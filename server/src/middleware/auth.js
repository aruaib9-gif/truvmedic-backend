import { prisma } from "../lib/prisma.js";
import { verifyToken } from "../lib/auth.js";
import { satisfies } from "../lib/entities.js";
import { forbidden, unauthorized } from "../lib/errors.js";

function extractToken(req) {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) return header.slice(7).trim();
  return null;
}

/**
 * Populates `req.user` when a valid token is present. Never rejects — routes
 * decide for themselves whether an anonymous caller is acceptable.
 */
export async function attachUser(req, _res, next) {
  const token = extractToken(req);
  if (!token) return next();

  const payload = verifyToken(token);
  if (!payload?.sub) return next();

  try {
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (user?.active) req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

export const requireAuth = (req, _res, next) =>
  req.user ? next() : next(unauthorized());

export const requireLevel = (level) => (req, _res, next) =>
  satisfies(level, req.user) ? next() : next(req.user ? forbidden() : unauthorized());
