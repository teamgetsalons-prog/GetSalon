/**
 * Seed script — loads realistic sample data for development & demos.
 *
 *   npm run seed
 *
 * Wipes and repopulates: users, cities, areas, categories, salons, staff,
 * services, appointments, reviews and blog posts.
 */
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import {
  Appointment,
  Area,
  BlogPost,
  Category,
  City,
  Review,
  Salon,
  Service,
  Staff,
  Subscription,
  User,
} from "../src/server/models";
import { slugify, timeToMinutes, toDateKey } from "../src/lib/utils";

const PASSWORD = "Password123!";

const img = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;

const SALON_IMAGES = [
  img("photo-1560066984-138dadb4c035"),
  img("photo-1522337660859-02fbefca4702"),
  img("photo-1521590832167-7bcbfaa6381f"),
  img("photo-1503951914875-452162b0f3f1"),
  img("photo-1585747860715-2ba37e788b70"),
  img("photo-1487412947147-5cebf100ffc2"),
  img("photo-1519014816548-bf5fe059798b"),
  img("photo-1516975080664-ed2fc6a32937"),
];

const GALLERY_POOL = [
  img("photo-1560066984-138dadb4c035", 800),
  img("photo-1522337660859-02fbefca4702", 800),
  img("photo-1521590832167-7bcbfaa6381f", 800),
  img("photo-1503951914875-452162b0f3f1", 800),
  img("photo-1585747860715-2ba37e788b70", 800),
  img("photo-1487412947147-5cebf100ffc2", 800),
  img("photo-1516975080664-ed2fc6a32937", 800),
  img("photo-1519014816548-bf5fe059798b", 800),
];

const HOURS = Array.from({ length: 7 }, (_, day) => ({
  day,
  open: day === 5 ? "14:00" : "10:00", // Friday afternoons
  close: "21:00",
  isClosed: false,
}));

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("✖ MONGODB_URI is not set. Copy .env.example to .env first.");
    process.exit(1);
  }

  console.log("→ Connecting to MongoDB…");
  await mongoose.connect(uri);

  console.log("→ Clearing existing data…");
  await Promise.all([
    User.deleteMany({}),
    City.deleteMany({}),
    Area.deleteMany({}),
    Category.deleteMany({}),
    Salon.deleteMany({}),
    Staff.deleteMany({}),
    Service.deleteMany({}),
    Appointment.deleteMany({}),
    Review.deleteMany({}),
    BlogPost.deleteMany({}),
    Subscription.deleteMany({}),
  ]);

  // ── Cities & areas ─────────────────────────────────────────
  console.log("→ Seeding cities & areas…");
  const cityDefs: Record<string, { province: string; areas: string[] }> = {
    Lahore: {
      province: "Punjab",
      areas: ["DHA", "Gulberg", "Johar Town", "Model Town", "Bahria Town"],
    },
    Karachi: {
      province: "Sindh",
      areas: ["Clifton", "DHA", "Gulshan-e-Iqbal", "PECHS", "North Nazimabad"],
    },
    Islamabad: {
      province: "ICT",
      areas: ["F-7", "F-10", "G-11", "Blue Area", "Bahria Enclave"],
    },
    Rawalpindi: { province: "Punjab", areas: ["Saddar", "Bahria Town", "Chaklala"] },
    Faisalabad: { province: "Punjab", areas: ["D Ground", "Peoples Colony", "Madina Town"] },
    Multan: { province: "Punjab", areas: ["Cantt", "Gulgasht", "Model Town"] },
  };

  const cities: Record<string, InstanceType<typeof City>> = {};
  const areas: Record<string, InstanceType<typeof Area>> = {};

  let order = 0;
  for (const [name, def] of Object.entries(cityDefs)) {
    const city = await City.create({
      name,
      slug: slugify(name),
      province: def.province,
      order: order++,
    });
    cities[name] = city;
    for (const areaName of def.areas) {
      const area = await Area.create({
        name: areaName,
        slug: slugify(areaName),
        city: city._id,
      });
      areas[`${name}:${areaName}`] = area;
    }
  }

  // ── Categories ─────────────────────────────────────────────
  console.log("→ Seeding categories…");
  const categoryDefs = [
    { name: "Haircut & Styling", icon: "scissors", isFeatured: true },
    { name: "Makeup", icon: "brush", isFeatured: true },
    { name: "Facial & Skin Care", icon: "flower", isFeatured: true },
    { name: "Massage & Spa", icon: "waves", isFeatured: true },
    { name: "Nails", icon: "hand", isFeatured: true },
    { name: "Bridal", icon: "gem", isFeatured: true },
    { name: "Mehndi", icon: "palette", isFeatured: false },
    { name: "Gents Grooming", icon: "spray", isFeatured: true },
    { name: "Hair Treatment", icon: "sun", isFeatured: false },
    { name: "Waxing & Threading", icon: "heart", isFeatured: false },
  ];
  const categories: Record<string, InstanceType<typeof Category>> = {};
  for (let i = 0; i < categoryDefs.length; i++) {
    const def = categoryDefs[i];
    categories[def.name] = await Category.create({
      ...def,
      slug: slugify(def.name),
      order: i,
    });
  }

  // ── Users ──────────────────────────────────────────────────
  console.log("→ Seeding users…");
  const passwordHash = await bcrypt.hash(PASSWORD, 12);

  await User.create({
    name: "Platform Admin",
    email: "admin@getsalons.pk",
    passwordHash: await bcrypt.hash("Admin@12345", 12),
    role: "admin",
    phone: "03001234567",
  });

  const ownerDefs = [
    { name: "Sana Tariq", email: "sana.owner@getsalons.pk" },
    { name: "Bilal Ahmed", email: "bilal.owner@getsalons.pk" },
    { name: "Mahnoor Fatima", email: "mahnoor.owner@getsalons.pk" },
    { name: "Usman Khalid", email: "usman.owner@getsalons.pk" },
    { name: "Zara Sheikh", email: "zara.owner@getsalons.pk" },
    { name: "Hamza Iqbal", email: "hamza.owner@getsalons.pk" },
    { name: "Rabia Nawaz", email: "rabia.owner@getsalons.pk" },
    { name: "Ali Raza", email: "ali.owner@getsalons.pk" },
  ];
  const owners = await Promise.all(
    ownerDefs.map((o, i) =>
      User.create({
        ...o,
        passwordHash,
        role: "owner",
        phone: `030012345${10 + i}`,
      })
    )
  );

  const customerDefs = [
    { name: "Ayesha Khan", email: "ayesha@example.com", city: "Lahore" },
    { name: "Hassan Raza", email: "hassan@example.com", city: "Karachi" },
    { name: "Fatima Noor", email: "fatima@example.com", city: "Islamabad" },
    { name: "Ahmed Ali", email: "ahmed@example.com", city: "Lahore" },
    { name: "Mariam Shah", email: "mariam@example.com", city: "Karachi" },
  ];
  const customers = await Promise.all(
    customerDefs.map((c, i) =>
      User.create({
        ...c,
        passwordHash,
        role: "customer",
        phone: `031198765${40 + i}`,
      })
    )
  );

  // ── Salons ─────────────────────────────────────────────────
  console.log("→ Seeding salons, services & staff…");

  interface SalonDef {
    name: string;
    city: string;
    area: string;
    gender: "men" | "women" | "unisex";
    homeService: boolean;
    featured: boolean;
    cats: string[];
    description: string;
    services: [string, number, number, number?][]; // name, duration, price, discount?
    staff: { name: string; title: string }[];
  }

  const salonDefs: SalonDef[] = [
    {
      name: "Royal Beauty Salon",
      city: "Lahore",
      area: "Gulberg",
      gender: "women",
      homeService: true,
      featured: true,
      cats: ["Makeup", "Bridal", "Facial & Skin Care", "Haircut & Styling"],
      description:
        "Lahore's most loved ladies salon for bridal makeup, signature facials and precision cuts — trusted by 1000+ brides since 2015.",
      services: [
        ["Party Makeup", 90, 8000, 6500],
        ["Bridal Makeup (Signature)", 180, 45000],
        ["Gold Facial", 60, 4500],
        ["Layered Haircut & Blowdry", 60, 2500],
        ["Keratin Treatment", 150, 15000, 12000],
        ["Mehndi (Both Hands)", 45, 3000],
      ],
      staff: [
        { name: "Sana Tariq", title: "Lead Makeup Artist" },
        { name: "Hira Butt", title: "Senior Stylist" },
        { name: "Nimra Aslam", title: "Skin Specialist" },
      ],
    },
    {
      name: "The Gentlemen's Lounge",
      city: "Lahore",
      area: "DHA",
      gender: "men",
      homeService: false,
      featured: true,
      cats: ["Gents Grooming", "Haircut & Styling"],
      description:
        "Premium barbering for the modern gentleman — hot towel shaves, skin fades and executive grooming in a classic lounge setting.",
      services: [
        ["Executive Haircut", 45, 1800],
        ["Skin Fade + Beard Sculpt", 60, 2500, 2000],
        ["Royal Hot Towel Shave", 30, 1200],
        ["Hair & Beard Color", 60, 3500],
        ["Gentleman's Facial", 45, 2800],
      ],
      staff: [
        { name: "Bilal Ahmed", title: "Master Barber" },
        { name: "Shahzaib Khan", title: "Senior Barber" },
      ],
    },
    {
      name: "Glow & Grace Studio",
      city: "Karachi",
      area: "Clifton",
      gender: "women",
      homeService: true,
      featured: true,
      cats: ["Facial & Skin Care", "Makeup", "Nails", "Waxing & Threading"],
      description:
        "Clifton's boutique beauty studio — hydrafacials, luxury nail art and flawless event makeup with imported products only.",
      services: [
        ["HydraFacial Deluxe", 75, 9000, 7500],
        ["Classic Manicure & Pedicure", 90, 3500],
        ["Gel Nail Art", 60, 2500],
        ["Event Makeup", 90, 10000],
        ["Full Body Wax", 90, 6000],
      ],
      staff: [
        { name: "Mahnoor Fatima", title: "Aesthetician" },
        { name: "Kiran Baig", title: "Nail Artist" },
        { name: "Sadia Imran", title: "Makeup Artist" },
      ],
    },
    {
      name: "Urban Cuts Barbershop",
      city: "Karachi",
      area: "Gulshan-e-Iqbal",
      gender: "men",
      homeService: false,
      featured: false,
      cats: ["Gents Grooming", "Haircut & Styling"],
      description:
        "No-nonsense modern barbershop — sharp fades, quick service and honest prices in the heart of Gulshan.",
      services: [
        ["Classic Haircut", 30, 800],
        ["Fade + Beard Trim", 45, 1200, 999],
        ["Kids Haircut", 25, 600],
        ["Head & Shoulder Massage", 20, 700],
      ],
      staff: [
        { name: "Usman Khalid", title: "Owner & Barber" },
        { name: "Danish Ali", title: "Barber" },
      ],
    },
    {
      name: "Serenity Spa & Wellness",
      city: "Islamabad",
      area: "F-7",
      gender: "unisex",
      homeService: false,
      featured: true,
      cats: ["Massage & Spa", "Facial & Skin Care"],
      description:
        "Escape the city at Islamabad's premier day spa — Swedish massages, aromatherapy and couple spa journeys in a tranquil setting.",
      services: [
        ["Swedish Full Body Massage", 60, 7000],
        ["Deep Tissue Massage", 90, 9500, 8500],
        ["Aromatherapy Session", 75, 8000],
        ["Signature Glow Facial", 60, 5500],
        ["Foot Reflexology", 45, 3500],
      ],
      staff: [
        { name: "Zara Sheikh", title: "Spa Director" },
        { name: "Meera Das", title: "Massage Therapist" },
        { name: "Adeel Hussain", title: "Massage Therapist" },
      ],
    },
    {
      name: "Signature Salon & Studio",
      city: "Islamabad",
      area: "F-10",
      gender: "unisex",
      homeService: true,
      featured: false,
      cats: ["Haircut & Styling", "Hair Treatment", "Makeup"],
      description:
        "Family salon with dedicated men's and women's sections — expert color, smart cuts and event styling under one roof.",
      services: [
        ["Ladies Cut & Style", 60, 2200],
        ["Gents Cut & Style", 40, 1200],
        ["Global Hair Color", 120, 8000, 6800],
        ["Protein Hair Treatment", 90, 6000],
        ["Party Makeup", 75, 7000],
      ],
      staff: [
        { name: "Hamza Iqbal", title: "Creative Director" },
        { name: "Anaya Malik", title: "Color Specialist" },
      ],
    },
    {
      name: "Mehndi Masters",
      city: "Faisalabad",
      area: "D Ground",
      gender: "women",
      homeService: true,
      featured: false,
      cats: ["Mehndi", "Bridal", "Makeup"],
      description:
        "Faisalabad's bridal mehndi specialists — intricate traditional and Arabic designs, plus complete bridal packages.",
      services: [
        ["Bridal Mehndi (Full)", 150, 12000, 10000],
        ["Party Mehndi (Both Hands)", 45, 2000],
        ["Arabic Mehndi", 30, 1500],
        ["Bridal Makeup", 150, 30000],
      ],
      staff: [
        { name: "Rabia Nawaz", title: "Mehndi Artist" },
        { name: "Iqra Javed", title: "Assistant Artist" },
      ],
    },
    {
      name: "Multan Grooming Co.",
      city: "Multan",
      area: "Cantt",
      gender: "men",
      homeService: false,
      featured: false,
      cats: ["Gents Grooming", "Haircut & Styling", "Massage & Spa"],
      description:
        "Multan's modern grooming destination for men — precision cuts, beard care and relaxing massage services.",
      services: [
        ["Premium Haircut", 40, 1000],
        ["Beard Styling", 25, 600],
        ["Hair Color (Ammonia Free)", 60, 2500],
        ["Relaxing Head Massage", 30, 800],
        ["Groom Package", 120, 8000, 6500],
      ],
      staff: [
        { name: "Ali Raza", title: "Head Barber" },
        { name: "Kashif Mehmood", title: "Barber" },
      ],
    },
  ];

  const allSalons: InstanceType<typeof Salon>[] = [];
  const salonServices = new Map<string, InstanceType<typeof Service>[]>();
  const salonStaff = new Map<string, InstanceType<typeof Staff>[]>();

  for (let i = 0; i < salonDefs.length; i++) {
    const def = salonDefs[i];
    const owner = owners[i];
    const city = cities[def.city];
    const area = areas[`${def.city}:${def.area}`];

    const prices = def.services.map(([, , price, discount]) =>
      discount && discount < price ? discount : price
    );

    const salon = await Salon.create({
      name: def.name,
      slug: slugify(`${def.name}-${def.city}`),
      owner: owner._id,
      description: def.description,
      about: `${def.description}\n\nWalk-ins are welcome but appointments through GetSalons always get priority. We use hygienic, single-use tools and premium products.`,
      categories: def.cats.map((c) => categories[c]._id),
      city: city._id,
      cityName: city.name,
      area: area?._id,
      areaName: area?.name,
      address: `${10 + i} Main Boulevard, ${def.area}`,
      phone: `0423567${1000 + i}`,
      whatsapp: `03211234${100 + i}`,
      email: `hello@${slugify(def.name)}.pk`,
      genderServed: def.gender,
      homeService: def.homeService,
      coverImage: SALON_IMAGES[i % SALON_IMAGES.length],
      gallery: GALLERY_POOL.slice(0, 4 + (i % 4)).map((url) => ({ url })),
      openingHours: HOURS,
      faqs: [
        {
          question: "Do I need to pay online?",
          answer:
            "No — booking through GetSalons is free. You pay at the salon after your service.",
        },
        {
          question: "Can I choose my specialist?",
          answer:
            "Yes! During booking you can pick a specific team member or select 'Any specialist' for maximum availability.",
        },
      ],
      policies: {
        cancellation:
          "Free cancellation up to 2 hours before your appointment. Repeated no-shows may restrict online booking.",
      },
      priceRange: { min: Math.min(...prices), max: Math.max(...prices) },
      status: "approved",
      isVerified: true,
      isFeatured: def.featured,
      views: 150 + i * 87,
      tags: def.cats,
      socials: {
        instagram: `https://instagram.com/${slugify(def.name)}`,
        facebook: `https://facebook.com/${slugify(def.name)}`,
      },
    });
    allSalons.push(salon);

    await Subscription.create({
      salon: salon._id,
      plan: def.featured ? "premium" : "free",
      price: def.featured ? 2500 : 0,
      expiresAt: def.featured
        ? new Date(Date.now() + 30 * 86_400_000)
        : undefined,
    });

    const services = await Promise.all(
      def.services.map(([name, duration, price, discount], idx) =>
        Service.create({
          salon: salon._id,
          name,
          description: `${name} by our trained professionals using premium products.`,
          category: categories[def.cats[idx % def.cats.length]]._id,
          duration,
          price,
          discountPrice: discount,
          isPopular: idx === 0,
          isFeatured: idx <= 1,
        })
      )
    );
    salonServices.set(salon._id.toString(), services);

    const staffMembers = await Promise.all(
      def.staff.map((s) =>
        Staff.create({
          salon: salon._id,
          name: s.name,
          title: s.title,
          services: [], // performs all services
          workingHours: HOURS,
        })
      )
    );
    salonStaff.set(salon._id.toString(), staffMembers);

    await City.updateOne({ _id: city._id }, { $inc: { salonCount: 1 } });
  }

  // ── Completed appointments + verified reviews ─────────────
  console.log("→ Seeding bookings & verified reviews…");

  const reviewTexts: [number, string][] = [
    [5, "Absolutely amazing experience! The staff was professional, the place was spotless and I loved the result. Highly recommended."],
    [5, "Best salon experience I've had in years. Booked through GetSalons in seconds and was seated right on time."],
    [4, "Great service and friendly staff. Slightly busy on the weekend but the quality made up for the wait."],
    [5, "The specialist really listened to what I wanted. Will definitely be coming back every month!"],
    [4, "Very good value for money. Clean tools, nice ambience, and the booking process was super smooth."],
    [5, "Outstanding! They turned my special day into perfection. Thank you team!"],
    [3, "Decent service overall. The result was good but the salon was a bit crowded when I visited."],
    [5, "Loved it! Professional, punctual and genuinely skilled staff. 10/10 would recommend."],
  ];

  let bookingCounter = 1;
  for (const salon of allSalons) {
    const services = salonServices.get(salon._id.toString())!;
    const staffMembers = salonStaff.get(salon._id.toString())!;
    const reviewCount = 2 + (bookingCounter % 3); // 2-4 reviews each

    const ratings: number[] = [];

    for (let r = 0; r < reviewCount; r++) {
      const customer = customers[(bookingCounter + r) % customers.length];
      const service = services[r % services.length];
      const staffMember = staffMembers[r % staffMembers.length];

      const daysAgo = 3 + r * 4;
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      const startTime = ["11:00", "13:30", "16:00", "18:30"][r % 4];
      const startMinutes = timeToMinutes(startTime);
      const price =
        service.discountPrice && service.discountPrice < service.price
          ? service.discountPrice
          : service.price;

      const appointment = await Appointment.create({
        bookingNumber: `SH-SEED${String(bookingCounter++).padStart(3, "0")}`,
        customer: customer._id,
        salon: salon._id,
        service: service._id,
        staff: staffMember._id,
        serviceSnapshot: {
          name: service.name,
          price,
          duration: service.duration,
        },
        date: toDateKey(date),
        startTime,
        startMinutes,
        endMinutes: startMinutes + service.duration,
        price,
        status: "completed",
      });

      const [rating, comment] = reviewTexts[(bookingCounter + r) % reviewTexts.length];
      ratings.push(rating);

      await Review.create({
        salon: salon._id,
        customer: customer._id,
        appointment: appointment._id,
        staff: staffMember._id,
        rating,
        comment,
        status: "published",
        helpfulVotes: r % 2 === 0 ? [customers[0]._id] : [],
        ...(r === 0
          ? {
              reply: {
                text: "Thank you so much for your kind words! We can't wait to welcome you back. 💛",
                repliedAt: new Date(),
              },
            }
          : {}),
      });
    }

    const average = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    await Salon.updateOne(
      { _id: salon._id },
      {
        rating: {
          average: Math.round(average * 10) / 10,
          count: ratings.length,
        },
      }
    );
  }

  // Upcoming pending bookings for the demo customer
  const demoSalon = allSalons[0];
  const demoServices = salonServices.get(demoSalon._id.toString())!;
  const demoStaff = salonStaff.get(demoSalon._id.toString())!;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  await Appointment.create({
    bookingNumber: "SH-DEMO01",
    customer: customers[0]._id,
    salon: demoSalon._id,
    service: demoServices[0]._id,
    staff: demoStaff[0]._id,
    serviceSnapshot: {
      name: demoServices[0].name,
      price: demoServices[0].discountPrice ?? demoServices[0].price,
      duration: demoServices[0].duration,
    },
    date: toDateKey(tomorrow),
    startTime: "15:00",
    startMinutes: 900,
    endMinutes: 900 + demoServices[0].duration,
    price: demoServices[0].discountPrice ?? demoServices[0].price,
    status: "pending",
  });

  // ── Blog posts ─────────────────────────────────────────────
  console.log("→ Seeding blog posts…");
  const posts = [
    {
      title: "10 Bridal Makeup Trends Taking Over Pakistani Weddings in 2026",
      category: "Bridal",
      excerpt:
        "From soft glam to bold traditional looks — here are the bridal makeup trends every 2026 bride in Pakistan should know before booking her artist.",
      tags: ["bridal", "makeup", "trends", "wedding"],
      coverImage: img("photo-1487412947147-5cebf100ffc2"),
      content: `Wedding season in Pakistan is unlike anywhere else in the world — and 2026 is bringing a fresh wave of bridal beauty trends.\n\n## 1. Soft glam is here to stay\nBrides are moving away from heavy bases toward skin-first makeup that lets natural texture shine through, paired with softly defined eyes.\n\n## 2. Traditional reds with a modern twist\nThe classic red lehnga look now comes with monochromatic makeup — terracotta eyes, warm blush and a muted red lip.\n\n## 3. Dewy, glass-skin finishes\nThanks to the K-beauty influence, luminous skin prep with hydrating facials booked 2–3 weeks before the big day is now standard practice.\n\n## Book your trial early\nTop artists in Lahore, Karachi and Islamabad get booked months in advance. Use GetSalons to compare portfolios, read verified reviews and lock your date before someone else does.`,
    },
    {
      title: "How Often Should Men Really Get a Haircut? A Barber's Honest Guide",
      category: "Hair Care",
      excerpt:
        "Skin fade every two weeks or classic cut every six? A master barber breaks down the ideal haircut schedule for every style and hair type.",
      tags: ["men", "haircut", "grooming"],
      coverImage: img("photo-1503951914875-452162b0f3f1"),
      content: `Ask five barbers how often you should get a haircut and you'll get five different answers. Here's the truth — it depends on your style.\n\n## Skin fades & tapers: every 2–3 weeks\nFades grow out fast. If you want that fresh-from-the-chair sharpness, book a fortnightly appointment.\n\n## Classic medium cuts: every 4–6 weeks\nScissor cuts are far more forgiving and often look better in week two than day one.\n\n## Longer styles: every 8–10 weeks\nYou still need regular dusting to keep ends healthy — skipping the barber entirely leads to shapeless growth.\n\n## The smart move\nBook your next appointment before leaving the shop, or set a recurring reminder on GetSalons so your barber's calendar never fills up without you.`,
    },
    {
      title: "The Complete Guide to Facials: Which One Does Your Skin Actually Need?",
      category: "Skin Care",
      excerpt:
        "HydraFacial, gold facial, chemical peel or classic clean-up? We decode Pakistan's most popular salon facials so you can book the right one.",
      tags: ["skincare", "facial", "beauty tips"],
      coverImage: img("photo-1516975080664-ed2fc6a32937"),
      content: `Walk into any good salon in Pakistan and you'll find a facial menu long enough to be intimidating. Here's what each one actually does.\n\n## Classic clean-up (45–60 min)\nBest for: first-timers and monthly maintenance. Deep cleansing, exfoliation, steam, extraction and a soothing mask.\n\n## HydraFacial (60–75 min)\nBest for: dull, dehydrated or congested skin. A machine-based treatment that cleanses, extracts and infuses serums in one session — zero downtime.\n\n## Gold & luxury facials\nBest for: pre-event glow. These focus on brightening and radiance boosters right before a big occasion.\n\n## How often should you book?\nDermatologists agree: once every 4–6 weeks matches your skin's natural renewal cycle. Consistency beats intensity every time.`,
    },
    {
      title: "Lahore vs Karachi vs Islamabad: Where Is Pakistan's Best Salon Scene?",
      category: "City Guides",
      excerpt:
        "We crunched thousands of GetSalons bookings and reviews to compare the salon culture of Pakistan's three biggest cities.",
      tags: ["lahore", "karachi", "islamabad", "city guide"],
      coverImage: img("photo-1560066984-138dadb4c035"),
      content: `Every city swears its salons are the best. We looked at the data — here's what it says.\n\n## Lahore: the bridal capital\nNo surprise here. Lahore dominates bridal bookings, with Gulberg and DHA housing the country's most in-demand makeup artists.\n\n## Karachi: the trendsetter\nKarachi leads in nail art, hydrafacials and niche boutique studios. Clifton alone has more specialist studios per square kilometre than any area we track.\n\n## Islamabad: the wellness hub\nThe capital wins on spas and massage therapy, with F-7 and F-10 offering the highest-rated wellness experiences in the country.\n\n## The verdict\nThere's no single winner — but wherever you are, verified reviews on GetSalons make finding your city's hidden gems effortless.`,
    },
  ];

  for (const post of posts) {
    await BlogPost.create({
      ...post,
      slug: slugify(post.title),
      isPublished: true,
      publishedAt: new Date(Date.now() - Math.random() * 20 * 86_400_000),
      views: Math.floor(Math.random() * 500),
      seo: { title: post.title, description: post.excerpt },
    });
  }

  console.log(`
✔ Seed complete!

  Cities:      ${Object.keys(cityDefs).length}
  Categories:  ${categoryDefs.length}
  Salons:      ${allSalons.length} (all approved, ${salonDefs.filter((s) => s.featured).length} featured)
  Users:       1 admin, ${owners.length} owners, ${customers.length} customers
  Blog posts:  ${posts.length}

  ── Demo accounts ────────────────────────────────
  Admin:     admin@getsalons.pk / Admin@12345
  Owner:     sana.owner@getsalons.pk / ${PASSWORD}
  Customer:  ayesha@example.com / ${PASSWORD}
  ─────────────────────────────────────────────────
`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("✖ Seed failed:", err);
  process.exit(1);
});
