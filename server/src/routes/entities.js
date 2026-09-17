import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { getEntity, satisfies, sanitize } from "../lib/entities.js";
import { asyncHandler, badRequest, forbidden, notFound, unauthorized } from "../lib/errors.js";
import { broadcast, addSubscriber } from "../lib/realtime.js";

const router = Router();

/** Fields that must be stored as numbers even when a form submits them as strings. */
const NUMERIC_FIELDS = {
  JobApplication: ["years_experience"],
  BlogPost: ["read_time"],
  Testimonial: ["rating"],
};

const ARRAY_FIELDS = {
  JobPosting: ["requirements", "certifications_required"],
  JobApplication: ["certifications", "tags"],
  BlogPost: ["tags"],
};

const MAX_LIMIT = 1000;

/** Keeps only writable fields and coerces them to the types Prisma expects. */
function normalizePayload(entityName, entity, raw) {
  const out = {};
  const numeric = NUMERIC_FIELDS[entityName] || [];
  const arrays = ARRAY_FIELDS[entityName] || [];

  for (const field of entity.fields) {
    if (!(field in raw)) continue;
    let value = raw[field];

    if (numeric.includes(field)) {
      if (value === "" || value === null || value === undefined) {
        value = null;
      } else {
        const parsed = Number(value);
        if (Number.isNaN(parsed)) throw badRequest(`"${field}" must be a number`);
        value = parsed;
      }
    } else if (arrays.includes(field)) {
      if (value === null || value === undefined) value = [];
      else if (!Array.isArray(value)) throw badRequest(`"${field}" must be an array`);
      else value = value.map(String);
    }

    out[field] = value;
  }
  return out;
}

/** Parses the `filter` query param (URL-encoded JSON) into a Prisma `where`. */
function parseFilter(entity, rawFilter) {
  if (!rawFilter) return {};
  let parsed;
  try {
    parsed = typeof rawFilter === "string" ? JSON.parse(rawFilter) : rawFilter;
  } catch {
    throw badRequest("`filter` must be valid JSON");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw badRequest("`filter` must be a JSON object");
  }

  const allowed = new Set([...entity.fields, "id", "created_by"]);
  const where = {};
  for (const [key, value] of Object.entries(parsed)) {
    if (!allowed.has(key)) throw badRequest(`Cannot filter on unknown field "${key}"`);
    where[key] = value === null ? null : value;
  }
  return where;
}

/** Translates Base44-style sort strings ("-created_date") into Prisma orderBy. */
function parseSort(entity, sort) {
  if (!sort) return { created_date: "desc" };
  const desc = sort.startsWith("-");
  const field = desc ? sort.slice(1) : sort;
  const allowed = new Set([...entity.fields, "id", "created_date", "updated_date"]);
  if (!allowed.has(field)) throw badRequest(`Cannot sort on unknown field "${field}"`);
  return { [field]: desc ? "desc" : "asc" };
}

/** Narrows a query so non-staff callers only ever see rows they own. */
function scopeFor(entity, user) {
  if (!user) return entity.publicScope || {};
  const owner = entity.ownerScope?.(user);
  return owner || {};
}

function resolveEntity(req) {
  const entity = getEntity(req.params.entity);
  if (!entity) throw notFound(`Unknown entity "${req.params.entity}"`);
  return entity;
}

function assertAccess(entity, action, user) {
  if (satisfies(entity.access[action], user)) return;
  throw user ? forbidden(`Not allowed to ${action} this resource`) : unauthorized();
}

// ---------------------------------------------------------------------------
// Realtime — replaces Base44's entity.subscribe()
// ---------------------------------------------------------------------------
router.get(
  "/:entity/subscribe",
  asyncHandler(async (req, res) => {
    const entity = resolveEntity(req);
    assertAccess(entity, "read", req.user);

    res.set({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });
    res.flushHeaders?.();
    res.write(`retry: 5000\n\n`);

    const remove = addSubscriber(req.params.entity, res);
    // Render's proxy drops idle connections; a periodic comment keeps it warm.
    const heartbeat = setInterval(() => res.write(": ping\n\n"), 25_000);

    req.on("close", () => {
      clearInterval(heartbeat);
      remove();
    });
  })
);

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------
router.get(
  "/:entity",
  asyncHandler(async (req, res) => {
    const entity = resolveEntity(req);
    assertAccess(entity, "read", req.user);

    const where = { ...parseFilter(entity, req.query.filter), ...scopeFor(entity, req.user) };
    const limit = Math.min(Number(req.query.limit) || 100, MAX_LIMIT);

    const records = await prisma[entity.model].findMany({
      where,
      orderBy: parseSort(entity, req.query.sort),
      take: limit,
      skip: Number(req.query.offset) || 0,
    });

    res.json(records.map((record) => sanitize(record, entity)));
  })
);

router.get(
  "/:entity/:id",
  asyncHandler(async (req, res) => {
    const entity = resolveEntity(req);
    assertAccess(entity, "read", req.user);

    const record = await prisma[entity.model].findFirst({
      where: { id: req.params.id, ...scopeFor(entity, req.user) },
    });
    if (!record) throw notFound();

    res.json(sanitize(record, entity));
  })
);

router.post(
  "/:entity",
  asyncHandler(async (req, res) => {
    const entityName = req.params.entity;
    const entity = resolveEntity(req);
    assertAccess(entity, "create", req.user);

    const data = normalizePayload(entityName, entity, req.body || {});
    if (req.user) data.created_by = req.user.email;

    // Entities with a natural key (newsletter email, site-config key) upsert so
    // that a repeat submission updates instead of violating the unique index.
    let record;
    if (entity.upsertOn && data[entity.upsertOn]) {
      record = await prisma[entity.model].upsert({
        where: { [entity.upsertOn]: data[entity.upsertOn] },
        create: data,
        update: data,
      });
    } else {
      record = await prisma[entity.model].create({ data });
    }

    broadcast(entityName, { action: "create", id: record.id });
    res.status(201).json(sanitize(record, entity));
  })
);

const applyUpdate = asyncHandler(async (req, res) => {
  const entityName = req.params.entity;
  const entity = resolveEntity(req);
  assertAccess(entity, "update", req.user);

  const existing = await prisma[entity.model].findUnique({ where: { id: req.params.id } });
  if (!existing) throw notFound();

  const data = normalizePayload(entityName, entity, req.body || {});
  const record = await prisma[entity.model].update({ where: { id: req.params.id }, data });

  broadcast(entityName, { action: "update", id: record.id });
  res.json(sanitize(record, entity));
});

router.put("/:entity/:id", applyUpdate);
router.patch("/:entity/:id", applyUpdate);

router.delete(
  "/:entity/:id",
  asyncHandler(async (req, res) => {
    const entityName = req.params.entity;
    const entity = resolveEntity(req);
    assertAccess(entity, "delete", req.user);

    const existing = await prisma[entity.model].findUnique({ where: { id: req.params.id } });
    if (!existing) throw notFound();

    await prisma[entity.model].delete({ where: { id: req.params.id } });

    broadcast(entityName, { action: "delete", id: req.params.id });
    res.json({ success: true, id: req.params.id });
  })
);

export default router;
