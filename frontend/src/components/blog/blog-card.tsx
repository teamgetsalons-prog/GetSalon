import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, User } from "lucide-react";
import type { BlogPostPublic } from "@/lib/server-api";

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

export function BlogCard({ post }: { post: BlogPostPublic }) {
  const readTime = estimateReadTime(post.content);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-inset ring-line/60 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-gold-500/5 hover:ring-gold-500/40"
    >
      {post.coverImage && (
        <div className="relative aspect-[16/9] overflow-hidden">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
          <span className="absolute bottom-2.5 left-3 rounded-lg bg-gold-500/90 px-2.5 py-1 text-xs font-semibold text-gold-950">
            {post.category}
          </span>
        </div>
      )}
      <div className="p-5">
        <h3 className="line-clamp-2 font-semibold text-fg group-hover:text-gold">
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-fg-muted">
          {post.excerpt}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-fg-faint">
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {post.author}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(post.publishedAt)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {readTime} min read
          </span>
        </div>
      </div>
    </Link>
  );
}
