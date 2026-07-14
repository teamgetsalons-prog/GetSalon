import { connectDB } from "../db.js";
import { Author, BlogPost, type IBlogPost, type IAuthor } from "../models/index.js";
import { ApiError } from "../middleware/error-handler.js";
import { slugify } from "../../../shared/dist/utils.js";

export interface CreateBlogInput {
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  author?: string;
  authorId?: string;
  category?: string;
  tags?: string[];
  isPublished?: boolean;
  seo?: { title?: string; description?: string };
}

export interface UpdateBlogInput extends Partial<CreateBlogInput> {}

export interface AuthorPublic {
  _id: string;
  name: string;
  slug: string;
  bio: string;
  title?: string;
  avatar?: string;
  isTeam: boolean;
}

export interface BlogPostPublic {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  /** Display name - the linked Author's real name when assigned, otherwise
   * the legacy free-text byline. Always populated, always safe to render. */
  author: string;
  /** Present only when a real Author record is linked - lets pages/schema
   * distinguish "real identity" from "generic fallback string". */
  authorInfo?: AuthorPublic;
  category: string;
  tags: string[];
  publishedAt?: Date;
  updatedAt?: Date;
  views: number;
  seo?: { title?: string; description?: string };
}

type PostWithAuthor = IBlogPost & { authorId?: IAuthor | null };

function toPublic(post: PostWithAuthor): BlogPostPublic {
  const linkedAuthor =
    post.authorId && typeof post.authorId === "object" && "name" in post.authorId
      ? (post.authorId as IAuthor)
      : null;

  return {
    _id: post._id.toString(),
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    coverImage: post.coverImage,
    author: linkedAuthor?.name ?? post.author,
    authorInfo: linkedAuthor
      ? {
          _id: linkedAuthor._id.toString(),
          name: linkedAuthor.name,
          slug: linkedAuthor.slug,
          bio: linkedAuthor.bio,
          title: linkedAuthor.title,
          avatar: linkedAuthor.avatar,
          isTeam: linkedAuthor.isTeam,
        }
      : undefined,
    category: post.category,
    tags: post.tags,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    views: post.views,
    seo: post.seo,
  };
}

/** List published blog posts (public) */
export async function listPublishedBlogPosts(opts: {
  page?: number;
  limit?: number;
  category?: string;
} = {}): Promise<{ posts: BlogPostPublic[]; total: number; page: number; totalPages: number }> {
  await connectDB();
  const page = opts.page ?? 1;
  const limit = opts.limit ?? 12;
  const filter: Record<string, unknown> = { isPublished: true };
  if (opts.category) filter.category = opts.category;

  const [posts, total] = await Promise.all([
    BlogPost.find(filter)
      .populate("authorId")
      .sort({ publishedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    BlogPost.countDocuments(filter),
  ]);

  return {
    posts: (posts as unknown as PostWithAuthor[]).map(toPublic),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

/** Get a single published blog post by slug (public) */
export async function getPublishedBlogPost(slug: string): Promise<BlogPostPublic | null> {
  await connectDB();
  const post = await BlogPost.findOne({ slug, isPublished: true }).populate("authorId");
  if (!post) return null;

  // Increment views
  post.views += 1;
  await post.save();

  return toPublic(post as unknown as PostWithAuthor);
}

/** All authors, for the admin blog form's picker */
export async function listAuthors(): Promise<AuthorPublic[]> {
  await connectDB();
  const authors = await Author.find().sort({ name: 1 }).lean();
  return authors.map((a) => ({
    _id: a._id.toString(),
    name: a.name,
    slug: a.slug,
    bio: a.bio,
    title: a.title,
    avatar: a.avatar,
    isTeam: a.isTeam,
  }));
}

/** An author's public profile plus their published posts, for /blog/authors/:slug */
export async function getAuthorBySlug(
  slug: string
): Promise<{ author: AuthorPublic; posts: BlogPostPublic[] } | null> {
  await connectDB();
  const author = await Author.findOne({ slug }).lean();
  if (!author) return null;

  const posts = await BlogPost.find({ authorId: author._id, isPublished: true })
    .populate("authorId")
    .sort({ publishedAt: -1 })
    .lean();

  return {
    author: {
      _id: author._id.toString(),
      name: author.name,
      slug: author.slug,
      bio: author.bio,
      title: author.title,
      avatar: author.avatar,
      isTeam: author.isTeam,
    },
    posts: (posts as unknown as PostWithAuthor[]).map(toPublic),
  };
}

/** Get blog categories with post counts */
export async function getBlogCategories(): Promise<{ category: string; count: number }[]> {
  await connectDB();
  const results = await BlogPost.aggregate([
    { $match: { isPublished: true } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  return results.map((r) => ({ category: r._id, count: r.count }));
}

/** Admin: list all blog posts */
export async function adminListBlogPosts(opts: {
  page?: number;
  limit?: number;
  search?: string;
} = {}): Promise<{ posts: IBlogPost[]; total: number; page: number; totalPages: number }> {
  await connectDB();
  const page = opts.page ?? 1;
  const limit = opts.limit ?? 20;
  const filter: Record<string, unknown> = {};
  if (opts.search) {
    const escaped = opts.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { title: { $regex: escaped, $options: "i" } },
      { category: { $regex: escaped, $options: "i" } },
    ];
  }

  const [posts, total] = await Promise.all([
    BlogPost.find(filter)
      .populate("authorId", "name slug")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    BlogPost.countDocuments(filter),
  ]);

  return { posts, total, page, totalPages: Math.ceil(total / limit) };
}

/** Admin: create a blog post */
export async function createBlogPost(input: CreateBlogInput): Promise<IBlogPost> {
  await connectDB();

  const slug = slugify(input.title);

  // Ensure unique slug
  const existing = await BlogPost.findOne({ slug });
  const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

  const post = await BlogPost.create({
    ...input,
    slug: finalSlug,
    isPublished: input.isPublished ?? false,
    publishedAt: input.isPublished ? new Date() : undefined,
  });

  return post;
}

/** Admin: update a blog post */
export async function updateBlogPost(
  postId: string,
  input: UpdateBlogInput
): Promise<IBlogPost> {
  await connectDB();
  const post = await BlogPost.findById(postId);
  if (!post) throw new ApiError("Blog post not found.", 404);

  if (input.title !== undefined) {
    post.title = input.title;
    const newSlug = slugify(input.title);
    const existing = await BlogPost.findOne({ slug: newSlug, _id: { $ne: post._id } });
    post.slug = existing ? `${newSlug}-${Date.now()}` : newSlug;
  }
  if (input.excerpt !== undefined) post.excerpt = input.excerpt;
  if (input.content !== undefined) post.content = input.content;
  if (input.coverImage !== undefined) post.coverImage = input.coverImage;
  if (input.author !== undefined) post.author = input.author;
  if (input.authorId !== undefined) {
    post.set("authorId", input.authorId || undefined);
  }
  if (input.category !== undefined) post.category = input.category;
  if (input.tags !== undefined) post.tags = input.tags;
  if (input.seo !== undefined) post.seo = input.seo;

  if (input.isPublished !== undefined) {
    post.isPublished = input.isPublished;
    if (input.isPublished && !post.publishedAt) {
      post.publishedAt = new Date();
    }
  }

  await post.save();
  return post;
}

/** Admin: delete a blog post */
export async function deleteBlogPost(postId: string): Promise<void> {
  await connectDB();
  const post = await BlogPost.findById(postId);
  if (!post) throw new ApiError("Blog post not found.", 404);
  await BlogPost.deleteOne({ _id: post._id });
}
