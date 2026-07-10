import { Router } from "express";
import type { Request, Response } from "express";
import multer from "multer";
import { authenticate } from "../middleware/auth.js";
import { ok, fail } from "../middleware/error-handler.js";
import { uploadImage, deleteImage } from "../services/upload.service.js";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const router = Router();

router.post("/", authenticate, upload.single("file"), async (req: Request, res: Response) => {
  if (!req.file) return fail(res, "Attach an image under the 'file' field.");

  const folder = (req.body.folder as string) || "misc";
  const safeFolder = folder.replace(/[^a-z0-9-]/gi, "").slice(0, 30) || "misc";

  const file = req.file;
  const result = await uploadImage(
    new File([file.buffer], file.originalname, { type: file.mimetype }),
    safeFolder
  );

  return ok(res, result, undefined, 201);
});

router.delete("/:publicId", authenticate, async (req: Request, res: Response) => {
  const { publicId } = req.params;
  await deleteImage(decodeURIComponent(publicId));
  return ok(res, { deleted: true });
});

export { router as uploadRoutes };
export default router;
