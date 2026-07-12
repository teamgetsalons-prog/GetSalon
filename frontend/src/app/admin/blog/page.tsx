"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Trash2, Eye, EyeOff, Search, Database } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState, Spinner } from "@/components/ui/misc";
import { Input } from "@/components/ui/input";

interface BlogPostRow {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  author: string;
  category: string;
  tags: string[];
  isPublished: boolean;
  publishedAt?: string;
  views: number;
  createdAt: string;
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "50" });
    if (search) params.set("search", search);
    const res = await api<BlogPostRow[]>(`/api/blog/admin/all?${params}`);
    setPosts(res.success && res.data ? res.data : []);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    void load();
  }, [load]);

  async function togglePublish(post: BlogPostRow) {
    setBusy(post._id);
    await api(`/api/blog/${post._id}`, {
      method: "PATCH",
      json: { isPublished: !post.isPublished },
    });
    setBusy(null);
    void load();
  }

  async function deletePost(post: BlogPostRow) {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    setBusy(post._id);
    const res = await api(`/api/blog/${post._id}`, { method: "DELETE" });
    setBusy(null);
    if (res.success) void load();
    else window.alert(res.message ?? "Could not delete.");
  }

  async function seedPosts() {
    if (!window.confirm("Seed 10 blog posts to the database? Existing posts will be skipped.")) return;
    setSeeding(true);
    const res = await api<{ created: number; skipped: number; total: number }>("/api/blog/admin/seed", { method: "POST" });
    setSeeding(false);
    if (res.success && res.data) {
      window.alert(`Done! Created: ${res.data.created}, Skipped: ${res.data.skipped} (already existed).`);
      void load();
    } else {
      window.alert(res.message ?? "Seed failed.");
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold">Blog Posts</h2>
          <p className="mt-1 text-sm text-fg-muted">
            Manage your beauty blog articles
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => void seedPosts()}
            disabled={seeding}
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-bg-soft px-4 py-2.5 text-sm font-semibold text-fg-muted transition-colors hover:border-gold-500/50 hover:text-gold disabled:opacity-50"
          >
            <Database className="h-4 w-4" />
            {seeding ? "Seeding..." : "Seed 10 Posts"}
          </button>
          <Link
            href="/admin/blog/new"
            className="inline-flex items-center gap-2 rounded-xl bg-gold-500 px-4 py-2.5 text-sm font-semibold text-gold-950 transition-colors hover:bg-gold-400"
          >
            <Plus className="h-4 w-4" /> New Post
          </Link>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-faint" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or category..."
            className="pl-9"
          />
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : posts.length === 0 ? (
        <EmptyState
          title="No blog posts yet"
          hint="Create your first beauty article to get started."
        />
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post._id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-card p-4 sm:p-5"
            >
              {post.coverImage && (
                <span className="hidden h-16 w-20 shrink-0 overflow-hidden rounded-xl sm:block">
                  <Image
                    src={post.coverImage}
                    alt=""
                    width={80}
                    height={64}
                    className="h-full w-full object-cover"
                  />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-fg">
                  {post.title}
                </p>
                <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-fg-muted">
                  <Badge variant={post.isPublished ? "success" : "neutral"}>
                    {post.isPublished ? "Published" : "Draft"}
                  </Badge>
                  <span>{post.category}</span>
                  <span>·</span>
                  <span>{post.author}</span>
                  <span>·</span>
                  <span>{post.views} views</span>
                </p>
                {post.publishedAt && (
                  <p className="mt-0.5 text-xs text-fg-faint">
                    Published{" "}
                    {new Date(post.publishedAt).toLocaleDateString("en-PK", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 gap-2">
                <Link
                  href={`/admin/blog/${post._id}`}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-fg-muted transition-colors hover:border-gold-500/50 hover:text-gold"
                  title="Edit"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Link>
                <button
                  onClick={() => void togglePublish(post)}
                  disabled={busy === post._id}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-fg-muted transition-colors hover:border-gold-500/50 hover:text-gold disabled:opacity-50"
                  title={post.isPublished ? "Unpublish" : "Publish"}
                >
                  {post.isPublished ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
                {post.isPublished && (
                  <Link
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-fg-muted transition-colors hover:border-gold-500/50 hover:text-gold"
                    title="View live"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Link>
                )}
                <button
                  onClick={() => void deletePost(post)}
                  disabled={busy === post._id}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-red-500 transition-colors hover:border-red-500/50 hover:bg-red-500/10 disabled:opacity-50"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
