import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import { authenticate, requireRole } from "../middleware/auth.js";
import { ok, fail } from "../middleware/error-handler.js";
import {
  listPublishedBlogPosts,
  getPublishedBlogPost,
  getBlogCategories,
  adminListBlogPosts,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
} from "../services/blog.service.js";

const router = Router();

// ── Public routes ──────────────────────────────────────────

router.get("/", async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 12));
  const category = typeof req.query.category === "string" ? req.query.category : undefined;

  const result = await listPublishedBlogPosts({ page, limit, category });
  return ok(res, result.posts, {
    pagination: { page: result.page, limit, total: result.total, totalPages: result.totalPages },
  });
});

router.get("/categories", async (_req: Request, res: Response) => {
  const categories = await getBlogCategories();
  return ok(res, categories);
});

router.get("/:slug", async (req: Request, res: Response) => {
  const slug = String(req.params.slug);
  const post = await getPublishedBlogPost(slug);
  if (!post) return fail(res, "Blog post not found.", 404);
  return ok(res, post);
});

// ── Admin routes ───────────────────────────────────────────

// Seed blog posts (admin only — creates all 10 posts if they don't exist)
router.post(
  "/admin/seed",
  authenticate,
  requireRole("admin"),
  async (_req: Request, res: Response) => {
    const { connectDB } = await import("../db.js");
    const { BlogPost } = await import("../models/index.js");
    await connectDB();

    const posts = [
      { title: "How to Choose the Best Salon in Lahore", slug: "how-to-choose-best-salon-lahore", excerpt: "Finding the right salon in Lahore can be overwhelming. Learn what to look for — from verified reviews and hygiene standards to pricing and service quality.", coverImage: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80", author: "GetSalons Team", category: "Salon Guide", tags: ["lahore", "salon tips"], isPublished: true, publishedAt: new Date("2026-07-01"), content: "Choosing the right salon in Lahore is about more than just convenience. Whether you need a quick haircut, a full bridal makeover, or a relaxing facial, the salon you pick determines the quality of your experience.\n\n## Check Verified Reviews First\n\nPlatforms like GetSalons show verified customer reviews — meaning only people who actually booked and visited the salon can leave feedback. Focus on detailed reviews that mention specific services.\n\n## Look at the Salon Portfolio\n\nMost reputable salons showcase their work through gallery photos. Look for consistency in their cuts, colour jobs and bridal looks.\n\n## Compare Prices\n\nUse GetSalons to compare prices across salons in your area. Remember, the cheapest option is not always the best — value for money is what matters." },
      { title: "Top 10 Hair Care Tips for Monsoon Season in Pakistan", slug: "hair-care-tips-monsoon-pakistan", excerpt: "Monsoon hair woes? From frizz control to dandruff prevention, here are 10 expert hair care tips to keep your locks healthy during the rainy season.", coverImage: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&q=80", author: "GetSalons Team", category: "Hair Care", tags: ["hair care", "monsoon", "tips", "frizz"], isPublished: true, publishedAt: new Date("2026-07-05"), content: "The monsoon season brings relief from the heat but also brings a host of hair problems. Humidity causes frizz, dandruff spikes and hair becomes unmanageable.\n\n## Use a Anti-Frizz Serum\n\nApply a lightweight anti-frizz serum after washing your hair. This creates a barrier against humidity.\n\n## Oil Your Hair Regularly\n\nCoconut oil or argan oil treatments once a week can keep your hair moisturised and protected.\n\n## Avoid Heat Styling\n\nSkip the straightener and curling iron during monsoon. Let your hair air dry naturally.\n\n## Use a Clarifying Shampoo\n\nOnce a week, use a clarifying shampoo to remove buildup from pollution and hard water." },
      { title: "Bridal Makeup Trends 2026: What Every Pakistani Bride Should Know", slug: "bridal-makeup-trends-2026", excerpt: "From glass skin to soft glam, discover the hottest bridal makeup trends for Pakistani weddings in 2026. Tips for nikkah, walima and mehndi looks.", coverImage: "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=1200&q=80", author: "GetSalons Team", category: "Bridal", tags: ["bridal", "makeup", "trends", "2026"], isPublished: true, publishedAt: new Date("2026-06-20"), content: "Pakistani weddings are grand affairs, and the bride's makeup is the centrepiece. Here are the top bridal makeup trends for 2026.\n\n## Glass Skin Base\n\nThe dewy, luminous glass skin look is dominating bridal trends. Think hydrated, glowing skin with minimal coverage.\n\n## Soft Glam Eyes\n\nGone are the heavy cut-crease looks. Soft blending with warm tones is the new elegance.\n\n## Monochromatic Looks\n\nUsing the same colour family for eyes, cheeks and lips creates a cohesive, modern bridal look.\n\n## Hair Accessories\n\nPearl pins, delicate tiaras and fresh flowers are replacing heavy matha patti trends." },
      { title: "The Complete Guide to Skincare Routines for Pakistani Weather", slug: "skincare-routine-pakistani-weather", excerpt: "Pakistan's diverse climate demands a tailored skincare approach. From humid summers to dry winters, here is your season-by-season skincare guide.", coverImage: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=1200&q=80", author: "GetSalons Team", category: "Skin Care", tags: ["skincare", "routine", "weather", "tips"], isPublished: true, publishedAt: new Date("2026-06-15"), content: "Your skin changes with the seasons, and Pakistan's weather can be particularly harsh. Here is how to adapt your routine.\n\n## Summer (March-June)\n\nUse a gel-based cleanser, lightweight moisturiser and SPF 50+ sunscreen daily. Avoid heavy creams.\n\n## Monsoon (July-September)\n\nSwitch to a foaming cleanser to combat excess oil. Use a lightweight moisturiser and keep skin dry.\n\n## Winter (October-February)\n\nSwitch to a cream cleanser, use a heavier moisturiser and add a hydrating serum with hyaluronic acid." },
      { title: "Men's Grooming: Why Every Man Needs a Regular Salon Visit", slug: "mens-grooming-salon-visit", excerpt: "Grooming is no longer just for women. Discover why regular salon visits are essential for the modern Pakistani man and what services to try.", coverImage: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=1200&q=80", author: "GetSalons Team", category: "Men's Grooming", tags: ["men", "grooming", "salon", "barber"], isPublished: true, publishedAt: new Date("2026-06-10"), content: "The modern Pakistani man understands that grooming is an investment, not an expense. Here is why regular salon visits matter.\n\n## First Impressions Count\n\nA well-groomed appearance speaks volumes about your professionalism and self-care.\n\n## Professional Haircuts\n\nA skilled barber understands face shapes and can recommend styles that suit you.\n\n## Skin Care for Men\n\nMen's skin is thicker and oilier. Regular facials can prevent acne and keep skin healthy.\n\n## Beard Maintenance\n\nA properly shaped and maintained beard frames your face and looks far better than a wild one." },
      { title: "How to Start a Salon Business in Pakistan: Complete Guide", slug: "start-salon-business-pakistan", excerpt: "Thinking of starting your own salon? From location selection to licensing, this comprehensive guide covers everything you need to know.", coverImage: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1200&q=80", author: "GetSalons Team", category: "Business", tags: ["business", "salon", "startup", "guide"], isPublished: true, publishedAt: new Date("2026-06-01"), content: "The beauty industry in Pakistan is booming. Here is your step-by-step guide to starting a salon business.\n\n## Market Research\n\nUnderstand your local market. What services are in demand? What are competitors charging?\n\n## Location is Key\n\nChoose a location with high foot traffic, easy parking and proximity to your target audience.\n\n## Licensing\n\nRegister your business, get a trade licence and ensure compliance with local regulations.\n\n## Staffing\n\nHire skilled professionals. Invest in their training and create a positive work environment.\n\n## Go Digital\n\nList your salon on GetSalons to reach thousands of potential customers online." },
      { title: "Monsoon Hair Care: Protect Your Hair from Rainy Season Damage", slug: "monsoon-hair-care-protection", excerpt: "Rainy season wreaks havoc on hair. Learn proven techniques to protect your hair from humidity, frizz and scalp infections during monsoon.", coverImage: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&q=80", author: "GetSalons Team", category: "Hair Care", tags: ["monsoon", "hair care", "protection", "frizz"], isPublished: true, publishedAt: new Date("2026-07-08"), content: "Monsoon is beautiful but brutal on your hair. Here is how to protect it.\n\n## Keep Hair Dry\n\nCarry an umbrella and try not to let rain water touch your hair. Rainwater contains pollutants that damage hair.\n\n## Use Leave-In Conditioner\n\nA leave-in conditioner creates a protective layer against humidity.\n\n## Don't Tie Wet Hair\n\nLet your hair air dry before tying it. Tying wet hair causes breakage and scalp infections." },
      { title: "Understanding Salon Prices in Pakistan: What You Should Expect to Pay", slug: "salon-prices-pakistan-guide", excerpt: "Confused about salon pricing? Here is a complete breakdown of what salon services cost across Pakistan, from basic cuts to premium bridal packages.", coverImage: "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=1200&q=80", author: "GetSalons Team", category: "Salon Guide", tags: ["prices", "salon", "guide", "pakistan"], isPublished: true, publishedAt: new Date("2026-06-25"), content: "Salon prices in Pakistan vary widely based on location, salon tier and services. Here is what to expect.\n\n## Budget Salons (Local)\n\nHaircut: Rs 300-800\nFacial: Rs 500-1500\nBeard trim: Rs 200-500\n\n## Mid-Range Salons\n\nHaircut: Rs 1000-3000\nHair colour: Rs 3000-8000\nBridal makeup: Rs 15000-40000\n\n## Premium Salons\n\nHaircut: Rs 2500-5000\nHair colour: Rs 6000-15000\nBridal package: Rs 50000-150000\n\nUse GetSalons to compare prices across salons in your city." },
      { title: "Beauty Trends Taking Over Pakistan in 2026", slug: "beauty-trends-pakistan-2026", excerpt: "From glass skin to laminated brows, these are the beauty trends dominating Pakistani salons in 2026. Find out which treatments are most popular.", coverImage: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&q=80", author: "GetSalons Team", category: "Beauty Tips", tags: ["trends", "2026", "beauty", "pakistan"], isPublished: true, publishedAt: new Date("2026-07-10"), content: "The beauty landscape in Pakistan is evolving rapidly. Here are the trends defining 2026.\n\n## Glass Skin\n\nThe Korean glass skin trend has fully arrived in Pakistan. Salons are offering multi-step facial treatments for that dewy, translucent look.\n\n## Laminated Brows\n\nBrow lamination gives you fluffy, feathered brows that stay put all day.\n\n## Hair Glazing\n\nA semi-permanent treatment that adds incredible shine and smoothness to hair.\n\n## Nail Art\n\nElaborate nail designs are becoming a form of self-expression. Pakistani nail artists are gaining international recognition." },
      { title: "How to Find the Best Salon in Karachi: A Local's Guide", slug: "best-salon-karachi-guide", excerpt: "Karachi has thousands of salons. Here is a local's honest guide to finding the best ones — with tips on avoiding scams and finding hidden gems.", coverImage: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80", author: "GetSalons Team", category: "Salon Guide", tags: ["karachi", "salon", "guide", "tips"], isPublished: true, publishedAt: new Date("2026-06-30"), content: "Karachi is a massive city with countless beauty options. Here is how to navigate them.\n\n## Start with GetSalons\n\nBrowse verified salons by area, service and rating. Read actual customer reviews.\n\n## Check the Area\n\nDefence, Clifton and Bahadurabad have the highest concentration of quality salons. But don't overlook hidden gems in other areas.\n\n## Try a Basic Service First\n\nBefore committing to a major treatment, try a basic haircut or facial to test the salon's quality.\n\n## Ask for Recommendations\n\nJoin local Facebook groups and ask for salon recommendations from people in your area." },
    ];

    let created = 0;
    let skipped = 0;
    for (const post of posts) {
      const existing = await BlogPost.findOne({ slug: post.slug });
      if (existing) { skipped++; continue; }
      await BlogPost.create(post);
      created++;
    }

    return ok(res, { created, skipped, total: posts.length });
  }
);

const createPostSchema = z.object({
  title: z.string().min(5).max(150),
  excerpt: z.string().min(10).max(300),
  content: z.string().min(50),
  coverImage: z.string().url().optional(),
  author: z.string().max(80).optional(),
  category: z.string().max(50).optional(),
  tags: z.array(z.string().max(30)).optional(),
  isPublished: z.boolean().optional(),
  seo: z
    .object({
      title: z.string().max(70).optional(),
      description: z.string().max(160).optional(),
    })
    .optional(),
});

router.get(
  "/admin/all",
  authenticate,
  requireRole("admin"),
  async (req: Request, res: Response) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
    const search = typeof req.query.search === "string" ? req.query.search : undefined;

    const result = await adminListBlogPosts({ page, limit, search });
    return ok(res, result.posts, {
      pagination: { page: result.page, limit, total: result.total, totalPages: result.totalPages },
    });
  }
);

router.post(
  "/",
  authenticate,
  requireRole("admin"),
  async (req: Request, res: Response) => {
    const input = createPostSchema.parse(req.body);
    const post = await createBlogPost(input);
    return ok(res, post, undefined, 201);
  }
);

router.patch(
  "/:id",
  authenticate,
  requireRole("admin"),
  async (req: Request, res: Response) => {
    const input = createPostSchema.partial().parse(req.body);
    const post = await updateBlogPost(String(req.params.id), input);
    return ok(res, post);
  }
);

router.delete(
  "/:id",
  authenticate,
  requireRole("admin"),
  async (req: Request, res: Response) => {
    await deleteBlogPost(String(req.params.id));
    return ok(res, { deleted: true });
  }
);

export { router as blogRoutes };
export default router;
