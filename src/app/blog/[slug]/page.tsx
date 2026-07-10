import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { connectDB } from "@/server/db";
import { BlogPost } from "@/server/models";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/utils";
import { SITE } from "@/lib/constants";
import { JsonLd } from "@/components/seo/json-ld";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

async function getPost(slug: string) {
  try {
    await connectDB();
    const post = await BlogPost.findOne({ slug, isPublished: true });
    if (post) {
      BlogPost.updateOne({ _id: post._id }, { $inc: { views: 1 } }).catch(
        () => undefined
      );
    }
    return post;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Article not found" };

  return buildMetadata({
    title: post.seo?.title ?? post.title,
    description: post.seo?.description ?? post.excerpt,
    path: `/blog/${post.slug}`,
    image: post.coverImage,
    type: "article",
  });
}

export default async function BlogPostPage({ params }: Params) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { "@type": "Organization", name: post.author },
    publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
    mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <JsonLd
        data={[
          articleJsonLd,
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
        ]}
      />

      <nav aria-label="Breadcrumb" className="mb-6 text-xs text-fg-faint">
        <Link href="/" className="hover:text-gold">Home</Link>
        <span className="mx-1.5">/</span>
        <Link href="/blog" className="hover:text-gold">Blog</Link>
      </nav>

      <p className="text-xs font-semibold uppercase tracking-wider text-gold">
        {post.category}
      </p>
      <h1 className="font-display mt-2 text-3xl font-bold leading-tight sm:text-4xl">
        {post.title}
      </h1>
      <p className="mt-3 text-sm text-fg-faint">
        By {post.author}
        {post.publishedAt &&
          ` · ${post.publishedAt.toLocaleDateString("en-PK", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}`}
      </p>

      {post.coverImage && (
        <div className="relative mt-6 aspect-[16/8] overflow-hidden rounded-3xl">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>
      )}

      <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-fg-muted">
        {post.content.split(/\n{2,}/).map((para, i) =>
          para.startsWith("## ") ? (
            <h2 key={i} className="font-display pt-2 text-xl font-bold text-fg">
              {para.replace(/^## /, "")}
            </h2>
          ) : (
            <p key={i}>{para}</p>
          )
        )}
      </div>

      {post.tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2 border-t border-line pt-6">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-line px-3 py-1 text-xs text-fg-muted"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-10 rounded-2xl border border-gold-500/30 bg-gold-500/5 p-6 text-center">
        <p className="font-display text-lg font-bold">
          Ready for your next appointment?
        </p>
        <Link
          href="/salons"
          className="mt-3 inline-block rounded-xl bg-gold-500 px-5 py-2.5 text-sm font-semibold text-gold-950 hover:bg-gold-400"
        >
          Find top salons near you
        </Link>
      </div>
    </article>
  );
}
