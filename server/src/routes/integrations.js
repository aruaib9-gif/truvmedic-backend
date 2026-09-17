import { Router } from "express";
import multer from "multer";
import rateLimit from "express-rate-limit";
import { uploadBuffer } from "../lib/storage.js";
import { sendEmail } from "../lib/email.js";
import { invokeLLM } from "../lib/llm.js";
import { asyncHandler, badRequest } from "../lib/errors.js";
import { requireLevel } from "../middleware/auth.js";

const router = Router();

const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.has(file.mimetype)) return cb(null, true);
    cb(new Error(`Unsupported file type: ${file.mimetype}`));
  },
});

const uploadLimiter = rateLimit({ windowMs: 10 * 60 * 1000, limit: 30, legacyHeaders: false });
const chatLimiter = rateLimit({ windowMs: 5 * 60 * 1000, limit: 30, legacyHeaders: false });

/**
 * File upload. Public because job applicants upload CVs and certificates
 * before they have an account; rate-limited and type/size restricted.
 * Mirrors Base44's `integrations.Core.UploadFile` response shape.
 */
router.post(
  "/upload",
  uploadLimiter,
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) throw badRequest("No file provided");

    const folder = typeof req.body.folder === "string" ? req.body.folder.replace(/[^\w-]/g, "") : "";
    const result = await uploadBuffer(req.file.buffer, {
      filename: req.file.originalname?.replace(/\.[^.]+$/, ""),
      folder: folder || undefined,
    });

    res.status(201).json({
      file_url: result.secure_url,
      public_id: result.public_id,
      bytes: result.bytes,
      format: result.format,
      original_name: req.file.originalname,
    });
  })
);

/** Staff-only transactional email. Mirrors `integrations.Core.SendEmail`. */
router.post(
  "/email",
  requireLevel("staff"),
  asyncHandler(async (req, res) => {
    const { to, subject, body, from_name, reply_to } = req.body || {};
    if (!to || !subject) throw badRequest("`to` and `subject` are required");

    const result = await sendEmail({ to, subject, body, from_name, reply_to });
    res.json({ success: true, ...result });
  })
);

/** Public chatbot proxy. Mirrors `integrations.Core.InvokeLLM`. */
router.post(
  "/llm",
  chatLimiter,
  asyncHandler(async (req, res) => {
    const { prompt, system, max_tokens, temperature } = req.body || {};
    if (!prompt) throw badRequest("`prompt` is required");
    if (typeof prompt === "string" && prompt.length > 8000) {
      throw badRequest("Prompt is too long");
    }

    const result = await invokeLLM({ prompt, system, max_tokens, temperature });
    res.json(result);
  })
);

export default router;
