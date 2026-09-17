import { Router } from "express";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { prisma } from "../lib/prisma.js";
import { env } from "../lib/env.js";
import {
  createInviteToken,
  hashPassword,
  hashToken,
  publicUser,
  signToken,
  verifyPassword,
} from "../lib/auth.js";
import { sendEmail } from "../lib/email.js";
import { asyncHandler, badRequest, notFound, unauthorized } from "../lib/errors.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Credential endpoints are the obvious brute-force target, so they get their own bucket.
const credentialLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many attempts. Please try again in a few minutes." },
});

const emailSchema = z.string().trim().toLowerCase().email();
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(200);

const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  full_name: z.string().trim().min(1).max(120),
  phone: z.string().trim().max(40).optional(),
});

const loginSchema = z.object({ email: emailSchema, password: z.string().min(1) });

function parse(schema, body) {
  const result = schema.safeParse(body ?? {});
  if (!result.success) {
    throw badRequest(result.error.issues[0]?.message || "Invalid request body");
  }
  return result.data;
}

/**
 * Self-registration. Anyone may create an applicant account; a pending staff
 * invite for the same address upgrades the new account to its intended role.
 */
router.post(
  "/register",
  credentialLimiter,
  asyncHandler(async (req, res) => {
    const { email, password, full_name, phone } = parse(registerSchema, req.body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw badRequest("An account with that email already exists");

    const invite = await prisma.invite.findFirst({
      where: { email, accepted_at: null, purpose: "invite", expires_at: { gt: new Date() } },
      orderBy: { created_date: "desc" },
    });

    const bootstrapped = env.bootstrapAdmins.includes(email);
    const role = bootstrapped ? "admin" : invite?.role ?? "applicant";

    const user = await prisma.user.create({
      data: {
        email,
        full_name,
        phone,
        role,
        password_hash: await hashPassword(password),
        last_login: new Date(),
      },
    });

    if (invite) {
      await prisma.invite.update({ where: { id: invite.id }, data: { accepted_at: new Date() } });
    }

    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  })
);

router.post(
  "/login",
  credentialLimiter,
  asyncHandler(async (req, res) => {
    const { email, password } = parse(loginSchema, req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    const valid = await verifyPassword(password, user?.password_hash);

    // Same message either way — don't reveal which addresses have accounts.
    if (!user || !valid) throw unauthorized("Invalid email or password");
    if (!user.active) throw unauthorized("This account has been deactivated");

    await prisma.user.update({ where: { id: user.id }, data: { last_login: new Date() } });

    res.json({ token: signToken(user), user: publicUser(user) });
  })
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json(publicUser(req.user));
  })
);

router.patch(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const schema = z.object({
      full_name: z.string().trim().min(1).max(120).optional(),
      phone: z.string().trim().max(40).optional(),
      department: z.string().trim().max(120).optional(),
    });
    const data = parse(schema, req.body);

    const user = await prisma.user.update({ where: { id: req.user.id }, data });
    res.json(publicUser(user));
  })
);

router.post(
  "/change-password",
  requireAuth,
  credentialLimiter,
  asyncHandler(async (req, res) => {
    const { current_password, new_password } = parse(
      z.object({ current_password: z.string().min(1), new_password: passwordSchema }),
      req.body
    );

    if (!(await verifyPassword(current_password, req.user.password_hash))) {
      throw unauthorized("Current password is incorrect");
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: { password_hash: await hashPassword(new_password) },
    });

    res.json({ success: true });
  })
);

/**
 * Password reset request. Always reports success so the endpoint can't be used
 * to enumerate registered addresses.
 */
router.post(
  "/forgot-password",
  credentialLimiter,
  asyncHandler(async (req, res) => {
    const { email } = parse(z.object({ email: emailSchema }), req.body);
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const { token, tokenHash } = createInviteToken();
      await prisma.invite.create({
        data: {
          email,
          role: user.role,
          token_hash: tokenHash,
          purpose: "reset",
          expires_at: new Date(Date.now() + 60 * 60 * 1000),
        },
      });

      const link = `${env.appUrl}/reset-password?token=${token}`;
      await sendEmail({
        to: email,
        from_name: "TRUV Medical",
        subject: "Reset your TRUV Medical password",
        body: resetEmail(user.full_name || "there", link),
      });
    }

    res.json({ success: true });
  })
);

router.post(
  "/reset-password",
  credentialLimiter,
  asyncHandler(async (req, res) => {
    const { token, password } = parse(
      z.object({ token: z.string().min(10), password: passwordSchema }),
      req.body
    );

    const invite = await prisma.invite.findUnique({ where: { token_hash: hashToken(token) } });
    if (!invite || invite.accepted_at || invite.expires_at < new Date()) {
      throw badRequest("This reset link is invalid or has expired");
    }

    const user = await prisma.user.findUnique({ where: { email: invite.email } });
    if (!user) throw notFound("Account no longer exists");

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { password_hash: await hashPassword(password) },
      }),
      prisma.invite.update({ where: { id: invite.id }, data: { accepted_at: new Date() } }),
    ]);

    const refreshed = await prisma.user.findUnique({ where: { id: user.id } });
    res.json({ token: signToken(refreshed), user: publicUser(refreshed) });
  })
);

/** Accepts a staff invite: creates the account with the invited role. */
router.post(
  "/accept-invite",
  credentialLimiter,
  asyncHandler(async (req, res) => {
    const { token, password, full_name } = parse(
      z.object({
        token: z.string().min(10),
        password: passwordSchema,
        full_name: z.string().trim().min(1).max(120),
      }),
      req.body
    );

    const invite = await prisma.invite.findUnique({ where: { token_hash: hashToken(token) } });
    if (!invite || invite.accepted_at || invite.expires_at < new Date()) {
      throw badRequest("This invitation is invalid or has expired");
    }

    const existing = await prisma.user.findUnique({ where: { email: invite.email } });
    const password_hash = await hashPassword(password);

    const user = existing
      ? await prisma.user.update({
          where: { id: existing.id },
          data: { password_hash, role: invite.role, full_name, active: true },
        })
      : await prisma.user.create({
          data: { email: invite.email, full_name, role: invite.role, password_hash },
        });

    await prisma.invite.update({ where: { id: invite.id }, data: { accepted_at: new Date() } });

    res.json({ token: signToken(user), user: publicUser(user) });
  })
);

/** Lets the invite page show who it is for before the password is chosen. */
router.get(
  "/invite/:token",
  asyncHandler(async (req, res) => {
    const invite = await prisma.invite.findUnique({
      where: { token_hash: hashToken(req.params.token) },
    });
    if (!invite || invite.accepted_at || invite.expires_at < new Date()) {
      throw badRequest("This invitation is invalid or has expired");
    }
    res.json({ email: invite.email, role: invite.role, purpose: invite.purpose });
  })
);

function resetEmail(name, link) {
  return `Hi ${name},

We received a request to reset your TRUV Medical account password.

Reset it here (the link expires in one hour):
${link}

If you didn't request this, you can safely ignore this email — your password will stay unchanged.

— TRUV Medical Services Limited`;
}

export default router;
