/**
 * Seeds the minimum a fresh deploy needs: the singleton SiteConfig row and,
 * when SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD are set, a first admin account.
 * Safe to re-run — everything here upserts.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

const SITE_DEFAULTS = {
  key: "main",
  company_name: "TRUV Medical Services Limited",
  tagline: "Occupational & Offshore Healthcare",
  phone: "+234 800 000 0000",
  email: "info@truvmedic.com",
  emergency_phone: "+234 800 000 0000",
  address: "Lagos, Nigeria",
  newsletter_enabled: true,
  blog_subscription_enabled: true,
  careers_whatsapp_enabled: true,
};

async function main() {
  const config = await prisma.siteConfig.upsert({
    where: { key: "main" },
    create: SITE_DEFAULTS,
    update: {},
  });
  console.log(`[seed] SiteConfig "${config.key}" ready`);

  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    console.log("[seed] SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set — skipping admin user");
    return;
  }
  if (password.length < 8) {
    throw new Error("SEED_ADMIN_PASSWORD must be at least 8 characters");
  }

  const admin = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      full_name: process.env.SEED_ADMIN_NAME || "Administrator",
      role: "admin",
      password_hash: await bcrypt.hash(password, 12),
    },
    update: { role: "admin", active: true },
  });
  console.log(`[seed] admin user ready: ${admin.email}`);
}

main()
  .catch((err) => {
    console.error("[seed] failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
