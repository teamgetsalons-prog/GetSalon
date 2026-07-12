"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Upload, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Spinner } from "@/components/ui/misc";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  author: string;
  category: string;
  tags: string[];
  isPublished: boolean;
  publishedAt?: string;
  seo?: { title?: string; description?: string };
}

export default function EditBlogPostPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDesc, setSeoDesc] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await api<BlogPost[]>(`/api/blog/admin/all?limit=100`);
    if (res.success && res.data) {
      const found = res.data.find((p) => p._id === id);
      if (found) {
        setPost(found);
        setTitle(found.title);
        setExcerpt(found.excerpt);
        setContent(found.content);
        setAuthor(found.author);
        setCategory(found.category);
        setTags(found.tags.join(", "));
        setCoverImage(found.coverImage ?? "");
        setSeoTitle(found.seo?.title ?? "");
        setSeoDesc(found.seo?.description ?? "");
        setIsPublished(found.isPublished);
      }
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "blog");
    const res = await api<{ url: string; publicId: string }>("/api/upload", {
      method: "POST",
      body: formData,
    });
    setUploading(false);
    if (res.success && res.data) {
      setCoverImage(res.data.url);
    } else {
      window.alert(res.message ?? "Upload failed.");
    }
  }

  async function handleSave(publishOverride?: boolean) {
    if (!title.trim() || title.trim().length < 5) {
      setError("Title must be at least 5 characters.");
      return;
    }
    if (!excerpt.trim() || excerpt.trim().length < 10) {
      setError("Excerpt must be at least 10 characters.");
      return;
    }
    if (!content.trim() || content.trim().length < 50) {
      setError("Content must be at least 50 characters.");
      return;
    }
    setError(null);
    setSaving(true);

    const body: Record<string, unknown> = {
      title: title.trim(),
      excerpt: excerpt.trim(),
      content: content.trim(),
      author: author.trim() || "GetSalons Team",
      category: category.trim() || "Beauty Tips",
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      isPublished: publishOverride ?? isPublished,
    };
    if (coverImage) body.coverImage = coverImage;
    if (seoTitle.trim() || seoDesc.trim()) {
      body.seo = { title: seoTitle.trim(), description: seoDesc.trim() };
    }

    const res = await api(`/api/blog/${id}`, { method: "PATCH", json: body });
    setSaving(false);
    if (res.success) {
      router.push("/admin/blog");
    } else {
      setError(res.message ?? "Failed to save post.");
    }
  }

  if (loading) return <Spinner />;

  if (!post) {
    return (
      <div className="py-20 text-center">
        <p className="text-fg-muted">Blog post not found.</p>
        <Link href="/admin/blog" className="mt-4 inline-block text-sm text-gold hover:underline">
          Back to blog posts
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/blog"
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-fg-muted transition-colors hover:text-gold"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to blog posts
      </Link>

      <h2 className="font-display text-xl font-bold">Edit Blog Post</h2>

      <div className="mt-6 space-y-5">
        {/* Cover Image */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">Cover Image</label>
          {coverImage ? (
            <div className="relative inline-block">
              <Image
                src={coverImage}
                alt="Cover"
                width={400}
                height={225}
                className="rounded-xl object-cover"
              />
              <button
                onClick={() => setCoverImage("")}
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-line py-8 text-center transition-colors hover:border-gold-500/50">
              <Upload className="h-8 w-8 text-fg-faint" />
              <span className="text-sm text-fg-muted">
                {uploading ? "Uploading..." : "Click to upload cover image"}
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </label>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Title <span className="text-gold">*</span>
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. 10 Best Hair Care Tips"
            maxLength={150}
          />
          <p className="mt-1 text-xs text-fg-faint">{title.length}/150</p>
        </div>

        {/* Excerpt */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Excerpt <span className="text-gold">*</span>
          </label>
          <Textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="A short summary for previews and SEO..."
            maxLength={300}
            rows={2}
          />
          <p className="mt-1 text-xs text-fg-faint">{excerpt.length}/300</p>
        </div>

        {/* Content */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Content (Markdown) <span className="text-gold">*</span>
          </label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your article in Markdown..."
            rows={16}
            className="font-mono text-sm"
          />
          <p className="mt-1 text-xs text-fg-faint">{content.length} characters</p>
        </div>

        {/* Row: Author + Category */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Author</label>
            <Input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="GetSalons Team"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Category</label>
            <Input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Beauty Tips"
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Tags (comma separated)
          </label>
          <Input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="hair care, monsoon, tips"
          />
        </div>

        {/* SEO */}
        <div className="rounded-xl border border-line bg-bg-soft p-4">
          <p className="mb-3 text-sm font-semibold">SEO (optional)</p>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-fg-muted">
                SEO Title
              </label>
              <Input
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Override page title for search engines"
                maxLength={70}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-fg-muted">
                SEO Description
              </label>
              <Textarea
                value={seoDesc}
                onChange={(e) => setSeoDesc(e.target.value)}
                placeholder="Meta description for search results"
                maxLength={160}
                rows={2}
              />
            </div>
          </div>
        </div>

        {error && (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3 border-t border-line pt-5">
          <Button
            variant="outline"
            loading={saving}
            onClick={() => void handleSave(false)}
          >
            Save Changes
          </Button>
          <Button
            loading={saving}
            onClick={() => void handleSave(true)}
          >
            {isPublished ? "Update & Publish" : "Publish"}
          </Button>
        </div>
      </div>
    </div>
  );
}
