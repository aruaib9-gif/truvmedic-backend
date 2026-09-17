import dotenv from "dotenv";

dotenv.config();

const required = ["DATABASE_URL", "JWT_SECRET"];

for (const key of required) {
  if (!process.env[key]) {
    console.error(`[config] Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

const list = (value) =>
  (value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

/**
 * Render's blueprint supplies a linked service's `host` property as a bare
 * hostname, but CORS origins and link URLs both need a scheme. Add https://
 * when one is missing so `fromService` wiring works without manual edits.
 */
const withScheme = (value) => {
  const raw = (value || "").trim().replace(/\/$/, "");
  if (!raw) return raw;
  return /^https?:\/\//.test(raw) ? raw : `https://${raw}`;
};

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 4000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",

  // Comma-separated list of origins allowed to call the API.
  corsOrigins: list(process.env.CORS_ORIGINS).map(withScheme),
  appUrl: withScheme(process.env.APP_URL) || "http://localhost:5173",

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    folder: process.env.CLOUDINARY_FOLDER || "truvmedic",
  },

  resend: {
    apiKey: process.env.RESEND_API_KEY,
    from: process.env.EMAIL_FROM || "TRUV Medical <onboarding@resend.dev>",
    notifyEmail: process.env.NOTIFY_EMAIL || "info@truvmedic.com",
  },

  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5",
  },

  // Email addresses that are granted the `admin` role on first registration.
  bootstrapAdmins: list(process.env.BOOTSTRAP_ADMIN_EMAILS).map((e) => e.toLowerCase()),
};

export const isConfigured = {
  cloudinary: Boolean(
    env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret
  ),
  resend: Boolean(env.resend.apiKey),
  anthropic: Boolean(env.anthropic.apiKey),
};
