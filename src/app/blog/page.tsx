import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { connectDB } from "@/server/db";
import { BlogPost } from "@/server/models";
import { buildMetadata } from "@/lib/seo";
import { EmptyState } from "@/components/ui/misc";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Beauty Blog — Tips, Trends & City Guides",
  description:
    "Expert beauty tips, hair care guides, skin care routines, bridal trends and salon guides for every city in Pakistan — from the GetSalons team.",
  path: "/blog",
});

export default async function BlogPage() {
  type Row = {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    coverImage?: string;
    category: string;
    publishedAt?: Date;
  };

  let posts: Row[] = [];
  try {
    await connectDB();
    const docs = await BlogPost.find({ isPublished: true })
      .sort({ publishedAt: -1 })
      .limit(30);
    posts = docs.map((p) => ({
      _id: p._id.toString(),
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      coverImage: p.coverImage,
      category: p.category,
      publishedAt: p.publishedAt,
    }));
  } catch {
    posts = [];
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          The GetSalons <span className="text-gold-gradient">Beauty Blog</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-fg-muted">
          Hair care, skin care, bridal trends and the best salons in every
          city — written by people obsessed with beauty.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="Articles coming soon"
            hint="Run the seed script to load starter articles, or add posts to the BlogPost collection."
          />
        </div>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post._id}
              href={`/blog/${post.slug}`}
              className="group overflow-hidden rounded-2xl border border-line bg-card transition-all hover:-translate-y-0.5 hover:border-gold-500/40 hover:shadow-lg"
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image
                  src={
                    post.coverImage ||
                    "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=75"
                  }
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
              </div>
              <div className="p-5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gold">
                  {post.category}
                </p>
                <h2 className="mt-1.5 line-clamp-2 font-semibold text-fg group-hover:text-gold">
                  {post.title}
                </h2>
                <p className="mt-2 line-clamp-2 text-sm text-fg-muted">
                  {post.excerpt}
                </p>
                {post.publishedAt && (
                  <p className="mt-3 text-xs text-fg-faint">
                    {post.publishedAt.toLocaleDateString("en-PK", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
