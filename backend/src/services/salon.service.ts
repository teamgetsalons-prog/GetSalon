import type { FilterQuery } from "mongoose";
import { connectDB } from "../db.js";
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
import { slugify } from "@/lib/utils";
import type {
  CreateSalonInput,
  SearchSalonsInput,
  UpdateSalonInput,
} from "@/lib/validations/salon";
import type { SalonCardData } from "@/types";
import { notify } from "./notification.service.js";

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
    if (category) filter.categories = category._id;
  }

  if (input.service) {
    // Find salons that have at least one active service matching this slug
    const matchingService = await Service.findOne({
      slug: input.service,
      isActive: true,
    }).select("salon");
    if (matchingService) {
      filter._id = { $in: [matchingService.salon] };
    } else {
      return { salons: [], total: 0, page: 1, totalPages: 0 };
    }
  }

  if (input.gender) filter.genderServed = input.gender;
  if (input.homeService) filter.homeService = true;
  if (input.rating) filter["rating.average"] = { $gte: input.rating };

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
    filter.$or = [{ name: rx }, { description: rx }, { tags: rx }, { areaName: rx }];
  }

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    recommended: { isFeatured: -1, "rating.average": -1, "rating.count": -1 },
    rating: { "rating.average": -1, "rating.count": -1 },
    reviews: { "rating.count": -1 },
    price_low: { "priceRange.min": 1 },
    price_high: { "priceRange.max": -1 },
    newest: { createdAt: -1 },
  };

  const page = input.page;
  const limit = input.limit;

  const [docs, total] = await Promise.all([
    Salon.find(filter)
      .populate("categories", "name")
      .sort(sortMap[input.sort] ?? sortMap.recommended)
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

  const salon = await Salon.findOne({ slug, status: "approved" })
    .populate("categories", "name slug")
    .populate("city", "name slug")
    .populate("area", "name slug")
    .lean();

  if (!salon) return null;

  const salonId = salon._id;

  const [services, staff, reviews] = await Promise.all([
    Service.find({ salon: salonId, isActive: true })
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
  ]);

  // Fire-and-forget view counter
  Salon.updateOne({ _id: salonId }, { $inc: { views: 1 } }).catch(
    () => undefined
  );

  return { salon, services, staff, reviews };
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
      City.find({ isActive: true }).sort({ order: 1 }).lean(),
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
export async function getActorSalon(actor: {
  id: string;
  role: string;
  salonId?: string;
}) {
  await connectDB();
  if (actor.role === "owner") return Salon.findOne({ owner: actor.id });
  if ((actor.role === "staff" || actor.role === "admin") && actor.salonId) {
    return Salon.findById(actor.salonId);
  }
  return null;
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

  const existing = await Salon.findOne({ owner: ownerId });
  if (existing) {
    throw new ApiError(
      "You already have a salon profile. Multi-branch support is coming soon.",
      409
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

  // Owner accounts get their salonId in the JWT on next session update
  await User.updateOne({ _id: ownerId }, { role: "owner" });

  return salon;
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

  const direct: (keyof UpdateSalonInput & keyof ISalon)[] = [
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
      (id) => id as unknown as (typeof salon.categories)[number]
    );
  }
  if (input.latitude !== undefined && input.longitude !== undefined) {
    salon.location = {
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

  switch (action) {
    case "approve":
      salon.status = "approved";
      salon.isVerified = true;
      salon.rejectionReason = undefined;
      await City.updateOne({ _id: salon.city }, { $inc: { salonCount: 1 } });
      break;
    case "reject":
      salon.status = "rejected";
      salon.rejectionReason = reason || "Does not meet listing guidelines.";
      break;
    case "suspend":
      salon.status = "suspended";
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
