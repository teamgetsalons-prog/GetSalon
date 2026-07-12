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
