/**
 * Seed sample salons with status="approved" so the site isn't empty.
 *
 * Usage:
 *   cd backend && npx tsx src/scripts/seed-salons.ts
 *
 * Requires MONGODB_URI env var (same as the backend).
 * Safe to run multiple times — skips existing salons by slug.
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/getsalons";

// ── Schemas (inline to avoid import issues with tsx) ───────────

const { Schema, model, models } = mongoose;

// City
const citySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    province: { type: String, required: true },
    image: String,
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    salonCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);
const City = (models.City as any) || model("City", citySchema);

// Area
const areaSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true },
    city: { type: Schema.Types.ObjectId, ref: "City", required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);
areaSchema.index({ city: 1, slug: 1 }, { unique: true });
const Area = (models.Area as any) || model("Area", areaSchema);

// Category
const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    icon: String,
    image: String,
    description: String,
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);
const Category =
  (models.Category as any) || model("Category", categorySchema);

// User
const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: String,
    passwordHash: { type: String, select: false },
    role: {
      type: String,
      enum: ["customer", "owner", "staff", "admin"],
      default: "customer",
    },
    avatar: String,
    city: String,
    favorites: [{ type: Schema.Types.ObjectId, ref: "Salon" }],
    salon: { type: Schema.Types.ObjectId, ref: "Salon" },
    emailVerifiedAt: Date,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);
const User = (models.User as any) || model("User", userSchema);

// Salon
const salonSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    slug: { type: String, required: true, unique: true },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: { type: String, required: true, maxlength: 500 },
    about: { type: String, maxlength: 3000 },
    categories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    city: { type: Schema.Types.ObjectId, ref: "City", required: true },
    cityName: { type: String, required: true },
    area: { type: Schema.Types.ObjectId, ref: "Area" },
    areaName: String,
    address: { type: String, required: true },
    location: {
      type: { type: String, enum: ["Point"] },
      coordinates: { type: [Number] },
    },
    phone: { type: String, required: true },
    whatsapp: String,
    email: String,
    website: String,
    socials: {
      facebook: String,
      instagram: String,
      tiktok: String,
    },
    genderServed: {
      type: String,
      enum: ["men", "women", "unisex"],
      default: "unisex",
    },
    homeService: { type: Boolean, default: false },
    coverImage: { type: String, default: "" },
    logo: String,
    gallery: [
      {
        url: { type: String, required: true },
        publicId: String,
        caption: String,
      },
    ],
    openingHours: [
      {
        day: { type: Number, min: 0, max: 6, required: true },
        open: { type: String, default: "10:00" },
        close: { type: String, default: "21:00" },
        isClosed: { type: Boolean, default: false },
      },
    ],
    faqs: [{ question: String, answer: String }],
    policies: { cancellation: String, notes: String },
    rating: { average: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
    priceRange: { min: { type: Number, default: 0 }, max: { type: Number, default: 0 } },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending",
    },
    isVerified: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isPremium: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    tags: [String],
  },
  { timestamps: true }
);
const Salon = (models.Salon as any) || model("Salon", salonSchema);

// Service
const serviceSchema = new Schema(
  {
    salon: { type: Schema.Types.ObjectId, ref: "Salon", required: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, maxlength: 500 },
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    duration: { type: Number, required: true, min: 10, max: 480 },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    image: String,
    isActive: { type: Boolean, default: true },
    isPopular: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    bookingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);
const Service = (models.Service as any) || model("Service", serviceSchema);

// Staff
const staffSchema = new Schema(
  {
    salon: { type: Schema.Types.ObjectId, ref: "Salon", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true, trim: true },
    title: String,
    avatar: String,
    bio: String,
    services: [{ type: Schema.Types.ObjectId, ref: "Service" }],
    workingHours: [
      {
        day: { type: Number, min: 0, max: 6, required: true },
        open: { type: String, default: "10:00" },
        close: { type: String, default: "21:00" },
        isClosed: { type: Boolean, default: false },
      },
    ],
    leaves: [{ date: { type: String, required: true }, reason: String }],
    rating: { average: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
    completedBookings: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);
const Staff = (models.Staff as any) || model("Staff", staffSchema);

// ── Seed data ──────────────────────────────────────────────────

const CITIES = [
  { name: "Lahore", slug: "lahore", province: "Punjab" },
  { name: "Karachi", slug: "karachi", province: "Sindh" },
  { name: "Islamabad", slug: "islamabad", province: "Islamabad Capital" },
  { name: "Rawalpindi", slug: "rawalpindi", province: "Punjab" },
  { name: "Faisalabad", slug: "faisalabad", province: "Punjab" },
];

const CATEGORIES = [
  { name: "Hair Salon", slug: "hair-salon", icon: "Scissors" },
  { name: "Beauty & Spa", slug: "beauty-spa", icon: "Sparkles" },
  { name: "Bridal", slug: "bridal", icon: "Gem" },
  { name: "Men's Grooming", slug: "mens-grooming", icon: "Scissors" },
  { name: "Nail Studio", slug: "nail-studio", icon: "Palette" },
  { name: "Skin Care", slug: "skin-care", icon: "HeartHandshake" },
];

const COVER_IMAGES = [
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80",
  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&q=80",
  "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=1200&q=80",
  "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=1200&q=80",
  "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=1200&q=80",
  "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1200&q=80",
  "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&q=80",
  "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=1200&q=80",
];

interface SalonSeed {
  name: string;
  slug: string;
  description: string;
  about: string;
  cityName: string;
  areaName: string;
  address: string;
  phone: string;
  genderServed: "men" | "women" | "unisex";
  homeService: boolean;
  coverImage: string;
  isFeatured: boolean;
  isVerified: boolean;
  rating: { average: number; count: number };
  priceRange: { min: number; max: number };
  tags: string[];
  services: { name: string; duration: number; price: number; isPopular?: boolean; discountPrice?: number }[];
  staff: { name: string; title: string }[];
}

const SALONS: SalonSeed[] = [
  {
    name: "Luxor Beauty Lounge",
    slug: "luxor-beauty-lahore",
    description: "Premium beauty salon in DHA Lahore offering hair, skin and bridal services with international products.",
    about: "Luxor Beauty Lounge is Lahore's premier beauty destination. Located in the heart of DHA, we offer a full range of hair, skin and bridal services. Our trained professionals use only international-grade products to ensure you leave looking and feeling your best.",
    cityName: "Lahore",
    areaName: "DHA",
    address: "Block C, Commercial Area, DHA Phase 5, Lahore",
    phone: "03211234567",
    genderServed: "unisex",
    homeService: false,
    coverImage: COVER_IMAGES[0],
    isFeatured: true,
    isVerified: true,
    rating: { average: 4.8, count: 124 },
    priceRange: { min: 1500, max: 15000 },
    tags: ["hair salon", "bridal", "facial", "DHA", "premium"],
    services: [
      { name: "Haircut & Styling", duration: 45, price: 2000, isPopular: true },
      { name: "Hair Color", duration: 120, price: 5000, isPopular: true },
      { name: "Bridal Package", duration: 240, price: 45000, discountPrice: 38000 },
      { name: "Facial Treatment", duration: 60, price: 3000 },
      { name: "Manicure & Pedicure", duration: 90, price: 2500 },
      { name: "Threading & Waxing", duration: 30, price: 1000 },
    ],
    staff: [
      { name: "Ayesha Khan", title: "Senior Hair Stylist" },
      { name: "Sana Malik", title: "Bridal Specialist" },
      { name: "Fatima Raza", title: "Skin Expert" },
    ],
  },
  {
    name: "The Studio by Hina",
    slug: "studio-by-hina-karachi",
    description: "Trendy hair and beauty studio in Karachi's Defence area. Known for creative cuts and colour.",
    about: "The Studio by Hina brings the latest international hair trends to Karachi. Our team of stylists is trained in London and Dubai, and we specialize in creative colouring, precision cuts and modern bridal looks.",
    cityName: "Karachi",
    areaName: "Defence",
    address: "Sea View Avenue, Phase 5, Defence Housing Authority, Karachi",
    phone: "03001234567",
    genderServed: "women",
    homeService: false,
    coverImage: COVER_IMAGES[1],
    isFeatured: true,
    isVerified: true,
    rating: { average: 4.6, count: 89 },
    priceRange: { min: 2000, max: 20000 },
    tags: ["hair salon", "colour specialist", "women only", "Defence"],
    services: [
      { name: "Precision Haircut", duration: 45, price: 2500, isPopular: true },
      { name: "Global Colour", duration: 150, price: 8000, isPopular: true },
      { name: "Highlights", duration: 120, price: 6000 },
      { name: "Hair Treatment", duration: 60, price: 3500 },
      { name: "Bridal Makeup", duration: 120, price: 25000 },
      { name: "Party Makeup", duration: 60, price: 8000 },
    ],
    staff: [
      { name: "Hina Shah", title: "Creative Director" },
      { name: "Nadia Ahmed", title: "Colour Specialist" },
    ],
  },
  {
    name: "Gentlemen's Grooming Co.",
    slug: "gentlemens-grooming-islamabad",
    description: "Elite men's grooming salon in F-7 Markaz. Classic cuts, hot towel shaves and modern styling.",
    about: "Gentlemen's Grooming Co. is Islamabad's answer to the modern gentleman. We offer classic barbering with a modern twist — hot towel shaves, precision fades, beard sculpting and grooming products.",
    cityName: "Islamabad",
    areaName: "F-7",
    address: "F-7 Markaz, Jinnah Super Market, Islamabad",
    phone: "03111234567",
    genderServed: "men",
    homeService: false,
    coverImage: COVER_IMAGES[2],
    isFeatured: false,
    isVerified: true,
    rating: { average: 4.7, count: 67 },
    priceRange: { min: 800, max: 5000 },
    tags: ["men", "barber", "grooming", "beard", "F-7"],
    services: [
      { name: "Classic Haircut", duration: 30, price: 1200, isPopular: true },
      { name: "Fade Haircut", duration: 40, price: 1500, isPopular: true },
      { name: "Hot Towel Shave", duration: 25, price: 800 },
      { name: "Beard Sculpting", duration: 20, price: 600 },
      { name: "Hair & Beard Combo", duration: 50, price: 1800 },
      { name: "Facial for Men", duration: 45, price: 2000 },
    ],
    staff: [
      { name: "Ahmed Raza", title: "Master Barber" },
      { name: "Usman Ali", title: "Stylist" },
    ],
  },
  {
    name: "Bridal Bliss Studio",
    slug: "bridal-bliss-lahore",
    description: "Specialized bridal makeup and styling studio in Gulberg. Complete bridal packages available.",
    about: "Bridal Bliss Studio has been making brides glow for over 8 years. We offer complete bridal packages including makeup, hair styling, mehndi and dressing. Our work has been featured in Siddy Sappoint and Vogue Pakistan.",
    cityName: "Lahore",
    areaName: "Gulberg",
    address: "Main Boulevard, Gulberg III, Lahore",
    phone: "03221234567",
    genderServed: "women",
    homeService: true,
    coverImage: COVER_IMAGES[3],
    isFeatured: true,
    isVerified: true,
    rating: { average: 4.9, count: 156 },
    priceRange: { min: 5000, max: 80000 },
    tags: ["bridal", "makeup", "mehndi", "Gulberg", "premium"],
    services: [
      { name: "Nikkah Makeup", duration: 120, price: 35000, isPopular: true },
      { name: "Walima Makeup", duration: 120, price: 40000, isPopular: true },
      { name: "Mehndi Night Makeup", duration: 90, price: 20000 },
      { name: "Engagement Makeup", duration: 90, price: 25000 },
      { name: "Full Bridal Package", duration: 480, price: 80000, discountPrice: 70000 },
      { name: "Party Makeup", duration: 60, price: 10000 },
    ],
    staff: [
      { name: "Zainab Hussain", title: "Lead Bridal Artist" },
      { name: "Mehreen Aslam", title: "Hair Stylist" },
      { name: "Saira Noor", title: "Mehndi Artist" },
    ],
  },
  {
    name: "SkinGlow Derm Spa",
    slug: "skinglow-derm-islamabad",
    description: "Advanced skin care and dermatology spa in F-8. Chemical peels, laser, facials and acne treatments.",
    about: "SkinGlow Derm Spa combines clinical dermatology with luxury spa treatments. Our board-certified dermatologists and aestheticians provide chemical peels, laser treatments, anti-aging facials and acne solutions in a calming environment.",
    cityName: "Islamabad",
    areaName: "F-8",
    address: "F-8/2, Medical Complex, Islamabad",
    phone: "03331234567",
    genderServed: "unisex",
    homeService: false,
    coverImage: COVER_IMAGES[4],
    isFeatured: false,
    isVerified: true,
    rating: { average: 4.5, count: 43 },
    priceRange: { min: 3000, max: 25000 },
    tags: ["skin care", "dermatology", "facial", "laser", "acne"],
    services: [
      { name: "Deep Cleansing Facial", duration: 60, price: 4000, isPopular: true },
      { name: "Chemical Peel", duration: 45, price: 6000, isPopular: true },
      { name: "Anti-Aging Treatment", duration: 90, price: 12000 },
      { name: "Acne Treatment Plan", duration: 60, price: 5000 },
      { name: "Laser Hair Removal", duration: 30, price: 8000 },
      { name: "Skin Brightening", duration: 60, price: 7000 },
    ],
    staff: [
      { name: "Dr. Sara Khan", title: "Dermatologist" },
      { name: "Amber Malik", title: "Aesthetician" },
    ],
  },
  {
    name: "Nail Artistry Studio",
    slug: "nail-artistry-karachi",
    description: "Creative nail art and gel nail studio in Clifton. Unique designs, gel extensions and nail care.",
    about: "Nail Artistry Studio is Karachi's go-to destination for creative nail designs. From classic manicures to elaborate nail art, gel extensions and dip powder nails — we make your nails a work of art.",
    cityName: "Karachi",
    areaName: "Clifton",
    address: "Block 5, Clifton, Karachi",
    phone: "03451234567",
    genderServed: "women",
    homeService: false,
    coverImage: COVER_IMAGES[5],
    isFeatured: false,
    isVerified: false,
    rating: { average: 4.3, count: 28 },
    priceRange: { min: 500, max: 5000 },
    tags: ["nails", "nail art", "gel nails", "Clifton"],
    services: [
      { name: "Classic Manicure", duration: 30, price: 800, isPopular: true },
      { name: "Gel Manicure", duration: 45, price: 2000, isPopular: true },
      { name: "Gel Extensions", duration: 60, price: 3500 },
      { name: "Nail Art Design", duration: 45, price: 1500 },
      { name: "Pedicure", duration: 45, price: 1200 },
      { name: "Dip Powder Nails", duration: 50, price: 2500 },
    ],
    staff: [
      { name: "Rabia Saleem", title: "Nail Artist" },
    ],
  },
  {
    name: "The Grooming Club",
    slug: "grooming-club-rawalpindi",
    description: "Complete men's grooming destination in Saddar. Haircuts, facials, waxing and massage services.",
    about: "The Grooming Club is Rawalpindi's premium men's grooming lounge. We offer everything from sharp haircuts and beard trims to relaxing massages and skin treatments in a modern, comfortable setting.",
    cityName: "Rawalpindi",
    areaName: "Saddar",
    address: "The Mall, Saddar, Rawalpindi",
    phone: "03009876543",
    genderServed: "men",
    homeService: false,
    coverImage: COVER_IMAGES[6],
    isFeatured: false,
    isVerified: true,
    rating: { average: 4.4, count: 52 },
    priceRange: { min: 600, max: 4000 },
    tags: ["men", "grooming", "massage", "Saddar"],
    services: [
      { name: "Premium Haircut", duration: 40, price: 1500, isPopular: true },
      { name: "Beard Trim & Style", duration: 20, price: 600 },
      { name: "Head Massage", duration: 30, price: 800 },
      { name: "Body Massage", duration: 60, price: 3000, isPopular: true },
      { name: "Men's Facial", duration: 45, price: 1500 },
      { name: "Full Body Wax", duration: 60, price: 3500 },
    ],
    staff: [
      { name: "Bilal Khan", title: "Senior Stylist" },
      { name: "Hassan Javed", title: "Massage Therapist" },
    ],
  },
  {
    name: "Zara's Beauty Point",
    slug: "zaras-beauty-faisalabad",
    description: "Affordable beauty salon for women in D-Ground. Hair, skin, waxing and party makeup services.",
    about: "Zara's Beauty Point makes quality beauty services accessible to everyone in Faisalabad. Located in the popular D-Ground area, we offer professional hair styling, skin treatments, waxing and party makeup at competitive prices.",
    cityName: "Faisalabad",
    areaName: "D-Ground",
    address: "D-Ground, People's Colony, Faisalabad",
    phone: "03129876543",
    genderServed: "women",
    homeService: true,
    coverImage: COVER_IMAGES[7],
    isFeatured: false,
    isVerified: false,
    rating: { average: 4.2, count: 35 },
    priceRange: { min: 500, max: 8000 },
    tags: ["women", "affordable", "party makeup", "D-Ground"],
    services: [
      { name: "Haircut & Blow Dry", duration: 40, price: 1200, isPopular: true },
      { name: "Hair Straightening", duration: 120, price: 4000 },
      { name: "Party Makeup", duration: 60, price: 5000, isPopular: true },
      { name: "Basic Facial", duration: 45, price: 1500 },
      { name: "Full Body Wax", duration: 60, price: 2500 },
      { name: "Manicure", duration: 30, price: 800 },
    ],
    staff: [
      { name: "Zara Bibi", title: "Owner & Stylist" },
      { name: "Hira Noor", title: "Makeup Artist" },
    ],
  },
];

// ── Default opening hours (Mon-Sat 10am-9pm, Sunday closed) ──

function defaultHours() {
  return Array.from({ length: 7 }, (_, i) => ({
    day: i,
    open: "10:00",
    close: "21:00",
    isClosed: i === 0, // Sunday closed
  }));
}

// ── Main seed function ─────────────────────────────────────────

async function seed() {
  console.log("🔗 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected\n");

  // 1. Ensure cities exist
  console.log("🏙️  Seeding cities...");
  const cityDocs: Record<string, any> = {};
  for (const c of CITIES) {
    const doc = await City.findOneAndUpdate(
      { slug: c.slug },
      { $setOnInsert: c },
      { upsert: true, new: true }
    );
    cityDocs[c.slug] = doc;
    console.log(`   ✓ ${c.name}`);
  }

  // 2. Ensure categories exist
  console.log("\n📂 Seeding categories...");
  const catDocs: Record<string, any> = {};
  for (const c of CATEGORIES) {
    const doc = await Category.findOneAndUpdate(
      { slug: c.slug },
      { $setOnInsert: c },
      { upsert: true, new: true }
    );
    catDocs[c.slug] = doc;
    console.log(`   ✓ ${c.name}`);
  }

  // 3. Create owner accounts (one per salon)
  console.log("\n👤 Creating owner accounts...");
  const passwordHash = await bcrypt.hash("Password123!", 12);
  const ownerDocs: any[] = [];

  for (let i = 0; i < SALONS.length; i++) {
    const salon = SALONS[i];
    const email = `owner${i + 1}@getsalons.pk`;
    const owner = await User.findOneAndUpdate(
      { email },
      {
        $setOnInsert: {
          name: salon.name + " Owner",
          email,
          passwordHash,
          role: "owner",
          isActive: true,
        },
      },
      { upsert: true, new: true }
    );
    ownerDocs.push(owner);
    console.log(`   ✓ ${email}`);
  }

  // 4. Create salons
  console.log("\n💇 Seeding salons...");
  for (let i = 0; i < SALONS.length; i++) {
    const s = SALONS[i];
    const existing = await Salon.findOne({ slug: s.slug });
    if (existing) {
      console.log(`   ⏭️  ${s.name} (already exists)`);
      continue;
    }

    const cityDoc = cityDocs[s.cityName.toLowerCase()];
    // Pick a random category
    const catKeys = Object.keys(catDocs);
    const randomCat = catDocs[catKeys[i % catKeys.length]];

    const salon = await Salon.create({
      name: s.name,
      slug: s.slug,
      owner: ownerDocs[i]._id,
      description: s.description,
      about: s.about,
      categories: [randomCat._id],
      city: cityDoc._id,
      cityName: s.cityName,
      areaName: s.areaName,
      address: s.address,
      phone: s.phone,
      genderServed: s.genderServed,
      homeService: s.homeService,
      coverImage: s.coverImage,
      isFeatured: s.isFeatured,
      isVerified: s.isVerified,
      status: "approved",
      rating: s.rating,
      priceRange: s.priceRange,
      tags: s.tags,
      openingHours: defaultHours(),
      gallery: [],
      faqs: [],
      views: Math.floor(Math.random() * 500) + 50,
    });

    // Link salon to owner
    await User.updateOne({ _id: ownerDocs[i]._id }, { salon: salon._id });

    // Update city salon count
    await City.updateOne(
      { _id: cityDoc._id },
      { $inc: { salonCount: 1 } }
    );

    // 5. Create services
    const serviceDocs: any[] = [];
    for (const svc of s.services) {
      const service = await Service.create({
        salon: salon._id,
        name: svc.name,
        duration: svc.duration,
        price: svc.price,
        discountPrice: svc.discountPrice,
        isPopular: svc.isPopular ?? false,
        category: randomCat._id,
      });
      serviceDocs.push(service);
    }

    // 6. Create staff
    for (const st of s.staff) {
      await Staff.create({
        salon: salon._id,
        name: st.name,
        title: st.title,
        services: serviceDocs.slice(0, 3).map((sv: any) => sv._id),
        workingHours: defaultHours(),
      });
    }

    console.log(`   ✓ ${s.name} (${s.services.length} services, ${s.staff.length} staff)`);
  }

  // 7. Summary
  const salonCount = await Salon.countDocuments();
  const serviceCount = await Service.countDocuments();
  const staffCount = await Staff.countDocuments();
  const userCount = await User.countDocuments();

  console.log("\n═══════════════════════════════════════");
  console.log("✅ Seed complete!");
  console.log(`   Salons:   ${salonCount}`);
  console.log(`   Services: ${serviceCount}`);
  console.log(`   Staff:    ${staffCount}`);
  console.log(`   Users:    ${userCount}`);
  console.log("═══════════════════════════════════════\n");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
