import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import { env, isConfigured } from "./lib/env.js";
import { prisma } from "./lib/prisma.js";
import { attachUser } from "./middleware/auth.js";
import { HttpError } from "./lib/errors.js";
import { subscriberCount } from "./lib/realtime.js";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import entityRoutes from "./routes/entities.js";
import integrationRoutes from "./routes/integrations.js";
import functionRoutes from "./routes/functions.js";

const app = express();

// Render terminates TLS at its proxy — trust it so rate limiting sees real IPs.
app.set("trust proxy", 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

app.use(
  cors({
    origin(origin, callback) {
      // Same-origin/curl requests have no Origin header.
      if (!origin) return callback(null, true);
      if (env.corsOrigins.length === 0 || env.corsOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error(`Origin ${origin} is not allowed`));
    },
    credentials: true,
  })
);

app.use(rateLimit({ windowMs: 60 * 1000, limit: 300, legacyHeaders: false }));
app.use(attachUser);

app.get("/health", async (_req, res) => {
  let database = "up";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    database = "down";
  }

  res.status(database === "up" ? 200 : 503).json({
    status: database === "up" ? "ok" : "degraded",
    database,
    integrations: isConfigured,
    subscribers: subscriberCount(),
    uptime: Math.round(process.uptime()),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/entities", entityRoutes);
app.use("/api/integrations", integrationRoutes);
app.use("/api/functions", functionRoutes);

app.use((req, res) => res.status(404).json({ error: `No route for ${req.method} ${req.path}` }));

 
app.use((err, _req, res, _next) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, ...(err.extra || {}) });
  }
  if (err?.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ error: "File exceeds the 10 MB limit" });
  }
  if (err?.code === "P2002") {
    return res.status(409).json({ error: "A record with that value already exists" });
  }
  if (err?.code === "P2025") {
    return res.status(404).json({ error: "Not found" });
  }

  console.error("[error]", err);
  const message = env.nodeEnv === "production" ? "Internal server error" : err.message;
  res.status(500).json({ error: message });
});

const server = app.listen(env.port, () => {
  console.log(`[api] listening on :${env.port} (${env.nodeEnv})`);
  for (const [name, ok] of Object.entries(isConfigured)) {
    if (!ok) console.warn(`[api] ${name} is not configured — related features are disabled`);
  }
});

// Give in-flight requests and SSE streams a chance to close cleanly.
for (const signal of ["SIGTERM", "SIGINT"]) {
  process.on(signal, () => {
    console.log(`[api] ${signal} received, shutting down`);
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  });
}

export default app;
