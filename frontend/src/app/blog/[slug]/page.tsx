import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Calendar, Clock, User, ArrowLeft, Tag } from "lucide-react";
import { getBlogPost, getBlogPosts } from "@/lib/server-api";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { SITE } from "@getsalons/shared/constants";
import { JsonLd } from "@/components/seo/json-ld";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

function formatDate(date: Date | string | undefined): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function estimateReadTime(content: string): number {
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await getBlogPost(slug);
    if (!post) return { title: "Article not found" };
    return buildMetadata({
      title: post.seo?.title || `${post.title} | ${SITE.shortName}`,
      description:
        post.seo?.description || post.excerpt,
      path: `/blog/${post.slug}`,
      image: post.coverImage,
      type: "article",
    });
  } catch {
    return { title: "Blog Post" };
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderMarkdown(content: string): string {
  let html = escapeHtml(content)
    // H2 headers
    .replace(/^## (.+)$/gm, '<h2 class="font-display mt-8 mb-4 text-xl font-bold text-fg">$1</h2>')
    // H3 headers
    .replace(/^### (.+)$/gm, '<h3 class="font-display mt-6 mb-3 text-lg font-semibold text-fg">$1</h3>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-fg">$1</strong>')
    // Numbered lists
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 text-fg-muted">$2</li>')
    // Paragraphs
    .replace(/\n\n/g, '</p><p class="mb-4 text-fg-muted leading-relaxed">')
    // Line breaks
    .replace(/\n/g, '<br />');

  // Wrap in paragraph
  html = `<p class="mb-4 text-fg-muted leading-relaxed">${html}</p>`;

  // Wrap consecutive <li> in <ul>
  html = html.replace(
    /(<li class="ml-4 text-fg-muted">[^<]*(?:<\/li>\s*(?:<br\s*\/?>\s*)?){2,}<\/li>)/g,
    (match) => `<ul class="mb-4 ml-4 list-disc space-y-1 text-fg-muted">${match.replace(/<br\s*\/?>/g, "")}</ul>`
  );

  return html;
}

export default async function BlogPostPage({ params }: Params) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();

  const readTime = estimateReadTime(post.content);

  // Get related posts
  const { posts: relatedPosts } = await getBlogPosts({
    limit: 3,
    category: post.category,
  });
  const related = relatedPosts.filter((p) => p._id !== post._id).slice(0, 3);

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 sm:px-6">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt,
            image: post.coverImage,
            author: { "@type": "Organization", name: post.author },
            publisher: {
              "@type": "Organization",
              name: SITE.name,
              logo: { "@type": "ImageObject", url: `${SITE.url}/icon.svg` },
            },
            datePublished: post.publishedAt,
            dateModified: post.publishedAt,
            mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE.url}/blog/${post.slug}` },
          },
        ]}
      />

      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="py-4 text-xs text-fg-faint">
        <Link href="/" className="hover:text-gold">Home</Link>
        <span className="mx-1.5">/</span>
        <Link href="/blog" className="hover:text-gold">Blog</Link>
        <span className="mx-1.5">/</span>
        <span className="text-fg-muted">{post.title}</span>
      </nav>

      {/* Back link */}
      <Link
        href="/blog"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-gold"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Blog
      </Link>

      {/* Article Header */}
      <article className="animate-fade-in-up">
        <header className="mb-8">
          <span className="mb-3 inline-block rounded-lg bg-gold-500/10 px-3 py-1 text-xs font-semibold text-gold">
            {post.category}
          </span>
          <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl">
            {post.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-fg-muted">
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              {post.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formatDate(post.publishedAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {readTime} min read
            </span>
          </div>
        </header>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="relative mb-10 aspect-[2/1] overflow-hidden rounded-3xl">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 896px) 100vw, 896px"
            />
          </div>
        )}

        {/* Content */}
        <div
          className="prose-custom text-base leading-relaxed"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
        />

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap items-center gap-2">
            <Tag className="h-4 w-4 text-fg-faint" />
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-lg bg-bg-soft px-3 py-1 text-xs text-fg-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </article>

      {/* Related Posts */}
      {related.length > 0 && (
        <section className="mt-14 animate-fade-in-up delay-200">
          <h2 className="font-display text-xl font-bold">You might also like</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {related.map((r) => (
              <Link
                key={r._id}
                href={`/blog/${r.slug}`}
                className="group overflow-hidden rounded-2xl border border-line bg-card transition-all hover:-translate-y-0.5 hover:border-gold-500/40 hover:shadow-lg"
              >
                {r.coverImage && (
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image
                      src={r.coverImage}
                      alt={r.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, 33vw"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="line-clamp-2 text-sm font-semibold text-fg group-hover:text-gold">
                    {r.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs text-fg-muted">
                    {r.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
