import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { env } from "../lib/env.js";
import { createInviteToken, publicUser } from "../lib/auth.js";
import { sendEmail } from "../lib/email.js";
import { asyncHandler, badRequest, notFound } from "../lib/errors.js";
import { requireLevel } from "../middleware/auth.js";
import { STAFF_ROLES } from "../lib/entities.js";

const router = Router();

const inviteSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  role: z.enum(["admin", "recruiter", "manager", "viewer"]).default("viewer"),
});

/** Invite a staff member. Replaces Base44's `users.inviteUser`. */
router.post(
  "/invite",
  requireLevel("admin"),
  asyncHandler(async (req, res) => {
    const parsed = inviteSchema.safeParse(req.body ?? {});
    if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message || "Invalid invite");
    const { email, role } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && STAFF_ROLES.includes(existing.role)) {
      throw badRequest("That user already has staff access");
    }

    const { token, tokenHash } = createInviteToken();
    await prisma.invite.create({
      data: {
        email,
        role,
        token_hash: tokenHash,
        purpose: "invite",
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        created_by_id: req.user.id,
      },
    });

    // Record the intended role now so the admin list reflects the pending invite.
    if (existing) {
      await prisma.user.update({ where: { id: existing.id }, data: { intended_role: role } });
    }

    const link = `${env.appUrl}/accept-invite?token=${token}`;
    await sendEmail({
      to: email,
      from_name: "TRUV Medical",
      subject: "You've been invited to the TRUV Medical admin portal",
      body: inviteEmail({ role, link, invitedBy: req.user.full_name || req.user.email }),
    });

    res.status(201).json({ success: true, email, role });
  })
);

/** Pending invitations, so admins can see who hasn't accepted yet. */
router.get(
  "/invites",
  requireLevel("admin"),
  asyncHandler(async (req, res) => {
    const invites = await prisma.invite.findMany({
      where: { purpose: "invite", accepted_at: null, expires_at: { gt: new Date() } },
      orderBy: { created_date: "desc" },
      select: { id: true, email: true, role: true, expires_at: true, created_date: true },
    });
    res.json(invites);
  })
);

router.delete(
  "/invites/:id",
  requireLevel("admin"),
  asyncHandler(async (req, res) => {
    const invite = await prisma.invite.findUnique({ where: { id: req.params.id } });
    if (!invite) throw notFound("Invitation not found");
    await prisma.invite.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  })
);

/** Staff directory used by the internal messaging screen. */
router.get(
  "/staff",
  requireLevel("staff"),
  asyncHandler(async (_req, res) => {
    const users = await prisma.user.findMany({
      where: { role: { in: STAFF_ROLES }, active: true },
      orderBy: { full_name: "asc" },
    });
    res.json(users.map(publicUser));
  })
);

function inviteEmail({ role, link, invitedBy }) {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/></head>
<body style="margin:0;background:#f4f6f9;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:600px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <tr><td style="background:linear-gradient(135deg,#0A3272,#1565C0);padding:28px 32px;text-align:center;">
          <p style="color:#fff;font-size:20px;font-weight:700;margin:0;">TRUV Medical Services</p>
          <p style="color:rgba(255,255,255,0.75);font-size:12px;margin:8px 0 0;letter-spacing:1px;text-transform:uppercase;">Admin Portal Invitation</p>
        </td></tr>
        <tr><td style="padding:32px;">
          <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 20px;">
            ${invitedBy} has invited you to join the TRUV Medical admin portal as a
            <strong style="color:#0A3272;text-transform:capitalize;">${role}</strong>.
          </p>
          <p style="margin:0 0 24px;">
            <a href="${link}" style="display:inline-block;background:#0A3272;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:15px;font-weight:600;">Set your password</a>
          </p>
          <p style="font-size:13px;color:#6b7280;margin:0;">This invitation expires in 7 days. If the button doesn't work, paste this link into your browser:<br/>
            <span style="color:#0A3272;word-break:break-all;">${link}</span>
          </p>
        </td></tr>
        <tr><td style="background:#f8fafc;border-top:1px solid #e5e7eb;padding:16px 32px;text-align:center;">
          <p style="font-size:11px;color:#9ca3af;margin:0;">TRUV Medical Services Limited</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export default router;
