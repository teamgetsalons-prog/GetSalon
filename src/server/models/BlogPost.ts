import { Schema, model, models, type Model, type Types } from "mongoose";

export interface IBlogPost {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  excerpt: string;
  /** Markdown-ish content rendered as paragraphs */
  content: string;
  coverImage?: string;
  author: string;
  category: string;
  tags: string[];
  isPublished: boolean;
  publishedAt?: Date;
  views: number;
  seo?: { title?: string; description?: string };
  createdAt: Date;
  updatedAt: Date;
}

const blogPostSchema = new Schema<IBlogPost>(
  {
    title: { type: String, required: true, maxlength: 150 },
    slug: { type: String, required: true, unique: true, index: true },
    excerpt: { type: String, required: true, maxlength: 300 },
    content: { type: String, required: true },
    coverImage: String,
    author: { type: String, default: "GetSalons Team" },
    category: { type: String, default: "Beauty Tips", index: true },
    tags: [String],
    isPublished: { type: Boolean, default: false, index: true },
    publishedAt: Date,
    views: { type: Number, default: 0 },
    seo: {
      title: String,
      description: String,
    },
  },
  { timestamps: true }
);

export const BlogPost: Model<IBlogPost> =
  (models.BlogPost as Model<IBlogPost>) ||
  model<IBlogPost>("BlogPost", blogPostSchema);
