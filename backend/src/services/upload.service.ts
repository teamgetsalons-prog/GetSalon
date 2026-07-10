import { v2 as cloudinary } from "cloudinary";
import { ApiError } from "../middleware/error-handler.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

/** Upload an image File (from route handler formData) to Cloudinary */
export async function uploadImage(
  file: File,
  folder: string
): Promise<{ url: string; publicId: string }> {
  if (!isCloudinaryConfigured()) {
    throw new ApiError(
      "Image uploads are not configured yet (Cloudinary env vars missing).",
      503
    );
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new ApiError("Only JPG, PNG, WEBP or AVIF images are allowed.", 415);
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new ApiError("Image must be smaller than 5 MB.", 413);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: `getsalons/${folder}`,
    resource_type: "image",
    transformation: [{ width: 1600, crop: "limit" }, { quality: "auto" }],
  });

  return { url: result.secure_url, publicId: result.public_id };
}

export async function deleteImage(publicId: string): Promise<void> {
  if (!isCloudinaryConfigured()) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error("[cloudinary] delete failed:", err);
  }
}
