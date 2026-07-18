import type { FilterQuery } from "mongoose";
import { connectDB } from "../db.js";
import { getEnv } from "../config.js";
import {
  Appointment,
  Area,
  AuditLog,
  Category,
  City,
  Review,
  Salon,
  Service,
  Staff,
  User,
  type ISalon,
} from "../models/index.js";
import { ApiError } from "../middleware/error-handler.js";
import { slugify } from "../../../shared/dist/utils.js";
import { SITE } from "../../../shared/dist/constants.js";
import type {
  CreateSalonInput,
  SearchSalonsInput,
  UpdateSalonInput,
} from "../../../shared/dist/validations/salon.js";
import type { SalonCardData } from "../../../shared/dist/types.js";
import { notify } from "./notification.service.js";
import { getSalonSubscription, startFreeTrial } from "./subscription.service.js";
import { sendEmail, salonSubmittedEmailHtml } from "./email.js";

/** Serialize a salon document to the lean card shape the frontend uses */
export function toSalonCard(
  salon: ISalon & { categories?: { name?: string }[] }
): SalonCardData {
  return {
    _id: salon._id.toString(),
    name: salon.name,
    slug: salon.slug,
    coverImage: salon.coverImage,
    cityName: salon.cityName,
    areaName: salon.areaName,
    genderServed: salon.genderServed,
    homeService: salon.homeService,
    isVerified: salon.isVerified,
    isFeatured: salon.isFeatured,
    rating: {
      average: salon.rating?.average ?? 0,
      count: salon.rating?.count ?? 0,
    },
    priceRange: {
      min: salon.priceRange?.min ?? 0,
      max: salon.priceRange?.max ?? 0,
    },
    categoryNames: Array.isArray(salon.categories)
      ? salon.categories
          .map((c) => (typeof c === "object" && c && "name" in c ? c.name : null))
          .filter((n): n is string => Boolean(n))
      : [],
  };
}

function currentTimeStrings(): { day: number; time: string } {
  const now = new Date();
  const time = `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}`;
  return { day: now.getDay(), time };
}

export async function searchSalons(input: SearchSalonsInput): Promise<{
  salons: SalonCardData[];
  total: number;
  page: number;
  totalPages: number;
}> {
  await connectDB();

  const filter: FilterQuery<ISalon> = { status: "approved" };
  // Collected separately (rather than written straight to filter.$or) so the
  // category match and the text search below can't silently clobber each
  // other when both are active at once.
  const andClauses: Record<string, unknown>[] = [];

  if (input.city) {
    const city = await City.findOne({ slug: input.city });
    if (city) filter.city = city._id;
    else return { salons: [], total: 0, page: 1, totalPages: 0 };
  }

  if (input.area) {
    const area = await Area.findOne({ slug: input.area });
    if (area) filter.area = area._id;
  }

  if (input.category) {
    const category = await Category.findOne({ slug: input.category });
    if (!category) return { salons: [], total: 0, page: 1, totalPages: 0 };
    // A salon matches a category either because the owner tagged the salon
    // itself with it, or because one of the salon's own services is tagged
    // with it - a salon offering a "Nail Art" service should show up under
    // the Nail Art category even if it never explicitly picked that tag.
    const taggedServiceSalonIds = await Service.distinct("salon", {
      category: category._id,
      isActive: true,
    });
    andClauses.push({
      $or: [{ categories: category._id }, { _id: { $in: taggedServiceSalonIds } }],
    });
  }

  if (input.service) {
    // Find every salon with at least one active service whose name matches
    // (services have no slug field, so we match on name against the
    // human-readable slug segment instead of a single findOne lookup).
    const escaped = input.service.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const rx = new RegExp(escaped.replace(/[-_]/g, "[ -]?"), "i");
    const matchingSalonIds = await Service.distinct("salon", {
      name: rx,
      isActive: true,
    });
    if (matchingSalonIds.length === 0) {
      return { salons: [], total: 0, page: 1, totalPages: 0 };
    }
    andClauses.push({ _id: { $in: matchingSalonIds } });
  }

  if (input.gender) filter.genderServed = input.gender;
  if (input.homeService) filter.homeService = true;
  if (input.rating) filter["rating.average"] = { $gte: input.rating };

  // Deals: only salons with at least one active discounted service.
  // Pushed as its own $and clause rather than written to filter._id, so it
  // naturally intersects with the category/service clauses above instead of
  // needing manual set intersection.
  if (input.deals) {
    const dealSalonIds = await Service.distinct("salon", {
      isActive: true,
      discountPrice: { $gt: 0 },
      $expr: { $lt: ["$discountPrice", "$price"] },
    });
    if (dealSalonIds.length === 0) {
      return { salons: [], total: 0, page: 1, totalPages: 0 };
    }
    andClauses.push({ _id: { $in: dealSalonIds } });
  }

  // Price overlap: salon range intersects the requested range
  if (input.minPrice !== undefined) {
    filter["priceRange.max"] = { $gte: input.minPrice };
  }
  if (input.maxPrice !== undefined) {
    filter["priceRange.min"] = { $lte: input.maxPrice };
  }

  if (input.openNow) {
    const { day, time } = currentTimeStrings();
    filter.openingHours = {
      $elemMatch: {
        day,
        isClosed: false,
        open: { $lte: time },
        close: { $gt: time },
      },
    };
  }

  if (input.q) {
    const rx = new RegExp(input.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    andClauses.push({ $or: [{ name: rx }, { description: rx }, { tags: rx }, { areaName: rx }] });
  }

  if (andClauses.length) filter.$and = andClauses;

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    recommended: { isFeatured: -1, "rating.average": -1, "rating.count": -1 },
    rating: { "rating.average": -1, "rating.count": -1 },
    reviews: { "rating.count": -1 },
    price_low: { "priceRange.min": 1 },
    price_high: { "priceRange.max": -1 },
    newest: { createdAt: -1 },
    featured: { isFeatured: -1, createdAt: -1 },
  };

  const page = input.page ?? 1;
  const limit = input.limit ?? 12;

  const [docs, total] = await Promise.all([
    Salon.find(filter)
      .populate("categories", "name")
      .sort(sortMap[input.sort ?? "recommended"])
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Salon.countDocuments(filter),
  ]);

  return {
    salons: docs.map((d) =>
      toSalonCard(d as unknown as ISalon & { categories: { name?: string }[] })
    ),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

/** Everything the public salon profile page needs, in one call */
export async function getSalonPageData(slug: string) {
  await connectDB();

  const salon = await Salon.findOne({ slug, status: { $in: ["approved", "featured"] } })
    .populate("categories", "name slug")
    .populate("city", "name slug")
    .populate("area", "name slug")
    .lean();

  if (!salon) return null;

  const salonId = salon._id;

  const [services, staff, reviews, branchDocs] = await Promise.all([
    Service.find({ salon: salonId, isActive: true })
      .populate("category", "name")
      .sort({ isPopular: -1, price: 1 })
      .lean(),
    Staff.find({ salon: salonId, isActive: true })
      .sort({ "rating.average": -1 })
      .lean(),
    Review.find({ salon: salonId, status: "published" })
      .populate("customer", "name avatar")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
    Salon.find({ owner: salon.owner, status: "approved", _id: { $ne: salonId } })
      .populate("categories", "name slug")
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  const branches = branchDocs.map((b) =>
    toSalonCard(b as unknown as ISalon & { categories: { name?: string }[] })
  );

  // Fire-and-forget view counter
  Salon.updateOne({ _id: salonId }, { $inc: { views: 1 } }).catch(
    () => undefined
  );

  return { salon, services, staff, reviews, branches };
}

export async function getHomePageData() {
  await connectDB();

  const [featured, topRated, newest, categories, cities, stats] =
    await Promise.all([
      Salon.find({ status: "approved", isFeatured: true })
        .sort({ "rating.average": -1 })
        .limit(8)
        .lean(),
      Salon.find({ status: "approved", "rating.count": { $gte: 1 } })
        .sort({ "rating.average": -1, "rating.count": -1 })
        .limit(8)
        .lean(),
      Salon.find({ status: "approved" })
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
      Category.find({ isActive: true }).sort({ order: 1 }).limit(12).lean(),
      City.find({ isActive: true, salonCount: { $gt: 0 } }).sort({ order: 1 }).lean(),
      getPlatformStats(),
    ]);

  return {
    featured: featured.map((s) => toSalonCard(s)),
    topRated: topRated.map((s) => toSalonCard(s)),
    newest: newest.map((s) => toSalonCard(s)),
    categories: categories.map((c) => ({
      _id: c._id.toString(),
      name: c.name,
      slug: c.slug,
      icon: c.icon ?? "sparkles",
      image: c.image,
    })),
    cities: cities.map((c) => ({
      _id: c._id.toString(),
      name: c.name,
      slug: c.slug,
    })),
    stats,
  };
}

async function getPlatformStats() {
  const [salons, customers, bookings, citiesCount] = await Promise.all([
    Salon.countDocuments({ status: "approved" }),
    User.countDocuments({ role: "customer" }),
    Appointment.countDocuments({}),
    City.countDocuments({ isActive: true }),
  ]);
  return { salons, customers, bookings, cities: citiesCount };
}

/** The salon the acting user manages (owner → own salon, staff → assigned) */
/**
 * Resolves the salon the actor is currently operating on. Owners can run
 * multiple branches, so the JWT's salonId - which switchActiveSalon keeps
 * in sync with the branch they last selected - takes priority over a bare
 * owner lookup, which would otherwise resolve arbitrarily once an owner
 * has more than one salon.
 */
export async function getActorSalon(actor: {
  id: string;
  role: string;
  salonId?: string;
}) {
  await connectDB();
  if (actor.role === "owner") {
    if (actor.salonId) {
      const active = await Salon.findOne({ _id: actor.salonId, owner: actor.id });
      if (active) return active;
    }
    return Salon.findOne({ owner: actor.id });
  }
  if ((actor.role === "staff" || actor.role === "admin") && actor.salonId) {
    return Salon.findById(actor.salonId);
  }
  return null;
}

/** All branches (salons) owned by this user, newest first. */
export async function listOwnedSalons(ownerId: string) {
  await connectDB();
  return Salon.find({ owner: ownerId }).sort({ createdAt: -1 }).lean();
}

/**
 * "Branch" isn't a separate entity - it's any Salon that ISN'T its owner's
 * earliest (first-created) salon. This resolves that set of salon IDs once
 * so admin listing/badges can classify a salon as a first-time submission
 * (stays in the main Salons queue even once the owner adds more locations)
 * vs an additional branch, without a schema change. Owner-level grouping
 * alone isn't enough here - it would hide an owner's original salon from
 * the main queue the moment they open a second location.
 */
export async function getBranchSalonIds(): Promise<string[]> {
  await connectDB();
  const groups = await Salon.aggregate<{ _id: unknown; count: number; firstId: unknown }>([
    { $sort: { createdAt: 1 } },
    { $group: { _id: "$owner", count: { $sum: 1 }, firstId: { $first: "$_id" } } },
    { $match: { count: { $gt: 1 } } },
  ]);
  if (groups.length === 0) return [];

  const ownerIds = groups.map((g) => g._id);
  const firstIds = new Set(groups.map((g) => String(g.firstId)));
  const allForMultiOwners = await Salon.find({ owner: { $in: ownerIds } })
    .select("_id")
    .lean();
  return allForMultiOwners
    .map((s) => String(s._id))
    .filter((id) => !firstIds.has(id));
}

/** Every OTHER approved location owned by the same person as this salon -
 * powers the "Branches" section on the public salon page. */
export async function getSalonBranches(
  slug: string
): Promise<{ salonName: string; branches: SalonCardData[] } | null> {
  await connectDB();
  const salon = await Salon.findOne({ slug, status: { $in: ["approved", "featured"] } }).select("owner name");
  if (!salon) return null;

  const branches = await Salon.find({
    owner: salon.owner,
    status: "approved",
    _id: { $ne: salon._id },
  })
    .populate("categories", "name slug")
    .sort({ createdAt: -1 })
    .lean();

  return {
    salonName: salon.name,
    branches: branches.map((b) =>
      toSalonCard(b as unknown as ISalon & { categories: { name?: string }[] })
    ),
  };
}

/**
 * Switches which branch an owner is actively managing: updates the
 * durable pointer (user.salon, which login also reads) and re-issues the
 * JWT so the dashboard, middleware, and every getActorSalon-based route
 * resolve the new branch immediately without a re-login.
 */
export async function switchActiveSalon(ownerId: string, salonId: string) {
  await connectDB();
  const salon = await Salon.findOne({ _id: salonId, owner: ownerId });
  if (!salon) throw new ApiError("Salon not found.", 404);
  await User.updateOne({ _id: ownerId }, { salon: salon._id });
  return salon;
}

async function uniqueSlug(name: string, cityName: string): Promise<string> {
  const base = slugify(`${name}-${cityName}`);
  let candidate = base;
  let n = 2;
  while (await Salon.exists({ slug: candidate })) {
    candidate = `${base}-${n++}`;
  }
  return candidate;
}

const DEFAULT_HOURS = Array.from({ length: 7 }, (_, day) => ({
  day,
  open: "10:00",
  close: "21:00",
  isClosed: false,
}));

export async function createSalon(ownerId: string, input: CreateSalonInput) {
  await connectDB();

  // Branching (multiple salons per account) is temporarily gated off while
  // the feature is finished - the owner UI is blocked too, but the API is
  // the real line of defense. First-salon creation is unaffected.
  const alreadyHasSalon = await Salon.exists({ owner: ownerId });
  if (alreadyHasSalon) {
    throw new ApiError(
      "Adding more branches is currently under development. Each account can manage one salon for now.",
      403
    );
  }

  const city = await City.findById(input.cityId);
  if (!city || !city.isActive) throw new ApiError("Please select a valid city.");

  const area = input.areaId ? await Area.findById(input.areaId) : null;

  const salon = await Salon.create({
    name: input.name,
    slug: await uniqueSlug(input.name, city.name),
    owner: ownerId,
    description: input.description,
    about: input.about,
    categories: input.categoryIds,
    city: city._id,
    cityName: city.name,
    area: area?._id,
    areaName: area?.name,
    address: input.address,
    phone: input.phone,
    whatsapp: input.whatsapp || undefined,
    email: input.email || undefined,
    website: input.website || undefined,
    socials: input.socials,
    genderServed: input.genderServed,
    homeService: input.homeService,
    amenities: input.amenities ?? [],
    openingHours: DEFAULT_HOURS,
    status: "pending",
    ...(input.latitude !== undefined && input.longitude !== undefined
      ? {
          location: {
            type: "Point",
            coordinates: [input.longitude, input.latitude],
          },
        }
      : {}),
  });

  // Link the salon to the owner account - login and the salon dashboard
  // resolve the owner's salon through user.salon / the JWT's salonId.
  await User.updateOne({ _id: ownerId }, { role: "owner", salon: salon._id });

  // Awaited (not fire-and-forget) so logs land in request order, but the
  // outer catch guarantees a mail/DB hiccup here can never fail the listing.
  await notifyAdminOfNewSalon(salon, ownerId, city, area).catch((err) =>
    console.error("[email:salon-submitted] unexpected failure:", err)
  );

  return salon;
}

/** Fire-and-forget: never blocks or fails salon creation if the email
 * fails or ADMIN_EMAIL isn't configured. */
async function notifyAdminOfNewSalon(
  salon: ISalon,
  ownerId: string,
  city: { name: string; province?: string },
  area: { name?: string } | null
): Promise<void> {
  const adminEmail = getEnv().ADMIN_EMAIL;
  if (!adminEmail) {
    console.log(`[email:salon-submitted] skipped: ADMIN_EMAIL not configured, listingId=${salon._id}`);
    return;
  }

  const [owner, categories] = await Promise.all([
    User.findById(ownerId).select("name email"),
    Category.find({ _id: { $in: salon.categories } }).select("name"),
  ]);

  const sent = await sendEmail({
    to: adminEmail,
    subject: "New Salon Listing Requires Approval",
    title: "New salon listing requires approval",
    html: salonSubmittedEmailHtml({
      salonName: salon.name,
      ownerName: owner?.name ?? "Unknown",
      ownerEmail: owner?.email ?? "Unknown",
      phone: salon.phone,
      address: salon.address,
      city: area?.name ? `${area.name}, ${city.name}` : city.name,
      province: city.province,
      services: categories.map((c) => c.name),
      listingId: salon._id.toString(),
      submittedAt: salon.createdAt.toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" }),
      reviewUrl: `${SITE.url}/admin/salons`,
    }),
  });

  console.log(
    `[email:salon-submitted] listingId=${salon._id} salonId=${salon._id} adminEmail=${adminEmail} at=${new Date().toISOString()} status=${sent ? "sent" : "failed"}`
  );
}

export async function updateSalon(
  salonId: string,
  actor: { id: string; role: string },
  input: UpdateSalonInput
) {
  await connectDB();

  const salon = await Salon.findById(salonId);
  if (!salon) throw new ApiError("Salon not found.", 404);

  if (actor.role !== "admin" && salon.owner.toString() !== actor.id) {
    throw new ApiError("You can only edit your own salon.", 403);
  }

  if (input.cityId) {
    const city = await City.findById(input.cityId);
    if (!city) throw new ApiError("Invalid city.");
    salon.city = city._id;
    salon.cityName = city.name;
  }
  if (input.areaId) {
    const area = await Area.findById(input.areaId);
    if (area) {
      salon.area = area._id;
      salon.areaName = area.name;
    }
  }

  const direct: (keyof UpdateSalonInput)[] = [
    "name",
    "description",
    "about",
    "address",
    "phone",
    "whatsapp",
    "email",
    "website",
    "genderServed",
    "homeService",
    "amenities",
    "socials",
    "coverImage",
    "logo",
    "openingHours",
    "faqs",
    "policies",
  ];
  for (const key of direct) {
    const value = input[key];
    if (value !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (salon as any)[key] = value === "" ? undefined : value;
    }
  }
  if (input.categoryIds?.length) {
    salon.categories = input.categoryIds.map(
      (id: string) => id as unknown as (typeof salon.categories)[number]
    );
  }
  if (input.latitude !== undefined && input.longitude !== undefined) {
    (salon as any).location = {
      type: "Point",
      coordinates: [input.longitude, input.latitude],
    };
  }

  await salon.save();
  return salon;
}

/** Keep the denormalized price range in sync after service changes */
export async function recalcPriceRange(salonId: string): Promise<void> {
  const services = await Service.find({
    salon: salonId,
    isActive: true,
  }).select("price discountPrice");

  if (services.length === 0) {
    await Salon.updateOne(
      { _id: salonId },
      { priceRange: { min: 0, max: 0 } }
    );
    return;
  }

  const prices = services.map((s) =>
    s.discountPrice && s.discountPrice < s.price ? s.discountPrice : s.price
  );
  await Salon.updateOne(
    { _id: salonId },
    { priceRange: { min: Math.min(...prices), max: Math.max(...prices) } }
  );
}

export async function moderateSalon(
  salonId: string,
  admin: { id: string },
  action: "approve" | "reject" | "suspend" | "feature" | "unfeature",
  reason?: string
) {
  await connectDB();

  const salon = await Salon.findById(salonId);
  if (!salon) throw new ApiError("Salon not found.", 404);

  // salonCount only reflects "currently approved", not "ever approved" -
  // every transition into/out of "approved" must move it by exactly one,
  // regardless of which specific action caused the transition (approving
  // an already-approved salon, or rejecting/suspending one that was never
  // approved, must both be no-ops for this counter).
  const wasApproved = salon.status === "approved";

  switch (action) {
    case "approve": {
      salon.status = "approved";
      salon.isVerified = true;
      salon.rejectionReason = undefined;
      if (!wasApproved) {
        await City.updateOne({ _id: salon.city }, { $inc: { salonCount: 1 } });
      }
      // The free trial must actually start at approval, or the salon is
      // visible but unbookable - createBooking enforces an active
      // subscription. Idempotent: re-approving after a suspension must
      // not grant a fresh trial.
      const existing = await getSalonSubscription(salonId);
      if (!existing) await startFreeTrial(salonId);
      break;
    }
    case "reject":
      salon.status = "rejected";
      salon.rejectionReason = reason || "Does not meet listing guidelines.";
      if (wasApproved) {
        await City.updateOne({ _id: salon.city }, { $inc: { salonCount: -1 } });
      }
      break;
    case "suspend":
      salon.status = "suspended";
      if (wasApproved) {
        await City.updateOne({ _id: salon.city }, { $inc: { salonCount: -1 } });
      }
      break;
    case "feature":
      salon.isFeatured = true;
      break;
    case "unfeature":
      salon.isFeatured = false;
      break;
  }
  await salon.save();

  await AuditLog.create({
    actor: admin.id,
    actorRole: "admin",
    action: `salon.${action}`,
    entity: "Salon",
    entityId: salon._id.toString(),
    meta: { reason },
  });

  if (action === "approve" || action === "reject") {
    await notify({
      userId: salon.owner.toString(),
      type: action === "approve" ? "salon_approved" : "salon_rejected",
      title:
        action === "approve"
          ? "Your salon is live! 🎉"
          : "Salon listing update",
      message:
        action === "approve"
          ? `${salon.name} has been approved and is now visible to customers.`
          : `${salon.name} was not approved: ${salon.rejectionReason}`,
      link: "/salon-dashboard",
    });
  }

  return salon;
}
