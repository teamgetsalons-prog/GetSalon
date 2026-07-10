import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Article",
  robots: { index: false },
};

/**
 * Blog articles are being migrated to the new backend API.
 * Until blog endpoints ship, individual article URLs 404 cleanly.
 */
export default function BlogPostPage() {
  notFound();
}
