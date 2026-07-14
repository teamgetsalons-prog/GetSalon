import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar } from "lucide-react";
import { getAuthorBySlug } from "@/lib/server-api";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { SITE } from "@getsalons/shared/constants";
import { JsonLd } from "@/components/seo/json-ld";
import { Avatar } from "@/components/ui/misc";

export const revalidate = 300;

type Params = { params: Promise<{ slug: string }> };

function formatDate(date: Date | string | undefined): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const result = await getAuthorBySlug(slug);
  if (!result) return { title: "Author not found" };
  return buildMetadata({
    title: `${result.author.name} — Author at ${SITE.shortName}`,
    description: result.author.bio,
    path: `/blog/authors/${slug}`,
  });
}

export default async function AuthorPage({ params }: Params) {
  const { slug } = await params;
  const result = await getAuthorBySlug(slug);
  if (!result) notFound();
  const { author, posts } = result;

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 sm:px-6">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: author.name, path: `/blog/authors/${author.slug}` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": author.isTeam ? "Organization" : "Person",
            name: author.name,
            description: author.bio,
            url: `${SITE.url}/blog/authors/${author.slug}`,
          },
        ]}
      />

      <Link
        href="/blog"
        className="my-6 inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-gold"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Blog
      </Link>

      {/* Author header */}
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-line bg-card p-8 text-center sm:flex-row sm:text-left">
        <Avatar src={author.avatar} name={author.name} size={72} />
        <div>
          <h1 className="font-display text-2xl font-bold">{author.name}</h1>
          {author.title && <p className="mt-0.5 text-sm text-gold">{author.title}</p>}
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-fg-muted">{author.bio}</p>
        </div>
      </div>

      {/* Posts by this author */}
      <section className="mt-12">
        <h2 className="font-display text-xl font-bold">
          Articles by {author.name} ({posts.length})
        </h2>
        {posts.length === 0 ? (
          <p className="mt-4 text-sm text-fg-muted">No published articles yet.</p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {posts.map((post) => (
              <Link
                key={post._id}
                href={`/blog/${post.slug}`}
                className="group overflow-hidden rounded-2xl border border-line bg-card transition-all hover:-translate-y-0.5 hover:border-gold-500/40 hover:shadow-lg"
              >
                {post.coverImage && (
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="line-clamp-2 text-sm font-semibold text-fg group-hover:text-gold">
                    {post.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs text-fg-muted">{post.excerpt}</p>
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-fg-faint">
                    <Calendar className="h-3 w-3" />
                    {formatDate(post.publishedAt)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
