"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";

interface AuthorOption {
  _id: string;
  name: string;
}

const NEW_AUTHOR = "__new__";

export default function NewBlogPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [authors, setAuthors] = useState<AuthorOption[]>([]);
  const [authorId, setAuthorId] = useState("");
  const [newAuthorName, setNewAuthorName] = useState("");
  const [newAuthorBio, setNewAuthorBio] = useState("");
  const [newAuthorTitle, setNewAuthorTitle] = useState("");
  const [category, setCategory] = useState("Beauty Tips");
  const [tags, setTags] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDesc, setSeoDesc] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savingAction, setSavingAction] = useState<"draft" | "publish" | null>(null);
  const saving = savingAction !== null;
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const res = await api<AuthorOption[]>("/api/blog/admin/authors");
      if (res.success && res.data) {
        setAuthors(res.data);
        if (res.data.length > 0) setAuthorId(res.data[0]._id);
      }
    })();
  }, []);

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

  async function handleSubmit(publish: boolean, action: "draft" | "publish") {
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
    if (authorId === NEW_AUTHOR && newAuthorName.trim().length < 2) {
      setError("Enter a name for the new author.");
      return;
    }
    setError(null);
    setSavingAction(action);

    let resolvedAuthorId = authorId;
    let resolvedAuthorName: string | undefined;
    if (authorId === NEW_AUTHOR) {
      const authorRes = await api<{ _id: string; name: string }>("/api/blog/admin/authors", {
        method: "POST",
        json: {
          name: newAuthorName.trim(),
          bio: newAuthorBio.trim() || `${newAuthorName.trim()} writes for the GetSalons blog.`,
          title: newAuthorTitle.trim() || undefined,
        },
      });
      if (!authorRes.success || !authorRes.data) {
        setSavingAction(null);
        setError(authorRes.message ?? "Could not create the new author.");
        return;
      }
      resolvedAuthorId = authorRes.data._id;
      resolvedAuthorName = authorRes.data.name;
    }

    const body: Record<string, unknown> = {
      title: title.trim(),
      excerpt: excerpt.trim(),
      content: content.trim(),
      category: category.trim() || "Beauty Tips",
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      isPublished: publish,
    };
    if (resolvedAuthorId) body.authorId = resolvedAuthorId;
    const selectedAuthorName = resolvedAuthorName ?? authors.find((a) => a._id === authorId)?.name;
    if (selectedAuthorName) body.author = selectedAuthorName;
    if (coverImage) body.coverImage = coverImage;
    if (seoTitle.trim()) body.seo = { title: seoTitle.trim(), description: seoDesc.trim() };

    const res = await api("/api/blog", { method: "POST", json: body });
    setSavingAction(null);
    if (res.success) {
      router.push("/admin/blog");
    } else {
      setError(res.message ?? "Failed to create post.");
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/blog"
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-fg-muted transition-colors hover:text-gold"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to blog posts
      </Link>

      <h2 className="font-display text-xl font-bold">New Blog Post</h2>

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
            placeholder="e.g. 10 Best Hair Care Tips for Monsoon Season"
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
            placeholder="A short summary for previews and SEO (10-300 chars)..."
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
            placeholder="Write your article in Markdown. Use ## for headings, **bold**, *italic*, etc."
            rows={16}
            className="font-mono text-sm"
          />
          <p className="mt-1 text-xs text-fg-faint">{content.length} characters</p>
        </div>

        {/* Row: Author + Category */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Author</label>
            <Select value={authorId} onChange={(e) => setAuthorId(e.target.value)}>
              {authors.map((a) => (
                <option key={a._id} value={a._id}>{a.name}</option>
              ))}
              <option value={NEW_AUTHOR}>+ Add new author…</option>
            </Select>
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

        {authorId === NEW_AUTHOR && (
          <div className="space-y-3 rounded-xl border border-line bg-bg-soft p-4">
            <p className="text-sm font-semibold">New author</p>
            <div>
              <label className="mb-1 block text-xs font-medium text-fg-muted">Name</label>
              <Input
                value={newAuthorName}
                onChange={(e) => setNewAuthorName(e.target.value)}
                placeholder="e.g. Sana Malik"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-fg-muted">Credential (optional)</label>
              <Input
                value={newAuthorTitle}
                onChange={(e) => setNewAuthorTitle(e.target.value)}
                placeholder="e.g. GetSalons co-founder, 5 years in the beauty industry"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-fg-muted">Bio</label>
              <Textarea
                value={newAuthorBio}
                onChange={(e) => setNewAuthorBio(e.target.value)}
                placeholder="A short, honest bio - what they actually do and why they're writing this."
                rows={2}
                maxLength={1000}
              />
            </div>
          </div>
        )}

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
            loading={savingAction === "draft"}
            disabled={saving}
            onClick={() => void handleSubmit(false, "draft")}
          >
            Save as Draft
          </Button>
          <Button
            loading={savingAction === "publish"}
            disabled={saving}
            onClick={() => void handleSubmit(true, "publish")}
          >
            Publish
          </Button>
        </div>
      </div>
    </div>
  );
}
