import path from "node:path";
import crypto from "node:crypto";
import fs from "node:fs";
import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../../middleware/auth";
import { ApiError } from "../../utils/ApiError";

const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(process.cwd(), "uploads");
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(new Error("Unsupported file type. Allowed: JPEG, PNG, WEBP, GIF, PDF."));
      return;
    }
    cb(null, true);
  },
});

export const uploadsRouter = Router();

// Generic authenticated file upload used across the app (pharmacy documents,
// prescription vault, question-paper library, etc). Local disk storage is
// fine for dev/self-hosted deployments; swap the multer storage engine for
// an S3/Cloudinary adapter for production without changing this API shape.
uploadsRouter.post("/", requireAuth, (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err) return next(err instanceof multer.MulterError ? ApiError.badRequest(err.message) : err);
    if (!req.file) return next(ApiError.badRequest("No file uploaded"));
    res.status(201).json({
      url: `/uploads/${req.file.filename}`,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
    });
  });
});
