# TRUV Medical Services

Corporate website, careers portal and admin CRM for TRUV Medical Services Limited.

- **`/`** — React 18 + Vite + Tailwind + shadcn/ui frontend
- **`/server`** — Express + Prisma + PostgreSQL API

The app previously ran on Base44; that dependency has been removed entirely and
replaced by the self-hosted API in `server/`.

---

## Architecture

```
React SPA  ──HTTPS──▶  Express API  ──▶  PostgreSQL (Prisma)
                            ├──▶ Cloudinary   file uploads (CVs, certificates, images)
                            ├──▶ Resend       transactional email
                            └──▶ Anthropic    site chatbot
```

Authentication is email + password with a JWT held in `localStorage`. Roles:

| Role | Access |
| --- | --- |
| `admin` | Everything, including user management and site configuration |
| `recruiter` / `manager` / `viewer` | Admin portal (`/admin`), scoped by the permission matrix |
| `applicant` | Own applications and messages only (`/applicant-dashboard`) |

Applicants who register themselves get the `applicant` role. Staff join by
invitation: an admin invites them from **Users & Roles**, which emails a link to
set a password and activates the invited role on acceptance.

---

## Local development

**Prerequisites:** Node 20+, PostgreSQL 14+.

### 1. API

```bash
cd server
npm install
cp .env.example .env          # then fill in DATABASE_URL and JWT_SECRET
npx prisma migrate dev        # creates the schema
npm run seed                  # SiteConfig row + first admin (optional)
npm run dev                   # http://localhost:4000
```

Generate a JWT secret with:

```bash
openssl rand -base64 48
```

Set `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` before `npm run seed` to create
the first admin account. Without them the seed only creates the `SiteConfig` row.

### 2. Frontend

```bash
npm install
cp .env.example .env          # VITE_API_URL=http://localhost:4000
npm run dev                   # http://localhost:5173
```

### Verifying the API

`server/scripts/smoke.mjs` exercises every route — auth, entity CRUD,
authorisation boundaries, integrations and server functions — against a running
instance:

```bash
cd server && API=http://localhost:4000 node scripts/smoke.mjs
```

---

## Deployment

The stack is live on Render (workspace `My Workspace`, Frankfurt):

| Resource | URL / ID | Plan |
| --- | --- | --- |
| Frontend | https://truvmedic-web.onrender.com | static |
| API | https://truvmedic-api.onrender.com | starter |
| Database | `truvmedic-db` (`dpg-dalqcbqd0e5s7389n1fg-a`) | basic_256mb |

`GET /health` on the API reports database connectivity and which integrations
are configured.

### Creating the first admin

`BOOTSTRAP_ADMIN_EMAILS` is set to `tonifili@gmail.com`. Register at
[/register](https://truvmedic-web.onrender.com/register) with that address and
the account is created as an admin. Everyone else joins by invitation from
**Users & Roles** — which needs `RESEND_API_KEY` to actually send the email.

### Still to configure

These are unset, so the features they back are inactive:

| Variable | Feature | Current behaviour |
| --- | --- | --- |
| `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` | CV, certificate and image uploads | **Job applications cannot be submitted** — the CV upload step errors |
| `RESEND_API_KEY` | Invites, password resets, candidate and interview emails | Messages are logged server-side, never delivered |
| `ANTHROPIC_API_KEY` | Site chatbot | Replies with a fixed fallback message |

Set them on **truvmedic-api → Environment** in the Render dashboard, then
redeploy.

### Deploying changes

The services were created through Render's API, so **no GitHub webhook is
installed and pushes do not deploy automatically**. Either:

- connect the repo in the Render dashboard (Settings → Build & Deploy → connect
  `aruaib9-gif/truvmedic-backend`) to enable auto-deploy, or
- trigger a deploy manually: **Manual Deploy → Deploy latest commit**.

> `render.yaml` describes the same three resources. It is kept in sync as
> documentation, but the live services were created via the API — applying it as
> a new Blueprint would create *duplicates* rather than adopt them.

### Local setup against a fresh database

See "Local development" above; `npx prisma migrate deploy` applies the schema to
any new environment, and `npm run seed` creates the `SiteConfig` row.

---

## API reference

| Method | Path | Access |
| --- | --- | --- |
| `POST` | `/api/auth/register` · `/login` · `/forgot-password` · `/reset-password` · `/accept-invite` | Public |
| `GET` `PATCH` | `/api/auth/me` | Authenticated |
| `GET` | `/api/entities/:entity` | Per entity — see `server/src/lib/entities.js` |
| `POST` `PUT` `DELETE` | `/api/entities/:entity[/:id]` | Per entity |
| `GET` | `/api/entities/:entity/subscribe` | SSE change stream |
| `POST` | `/api/users/invite` | Admin |
| `POST` | `/api/integrations/upload` | Public (rate limited, 10 MB) |
| `POST` | `/api/integrations/email` | Staff |
| `POST` | `/api/integrations/llm` | Public (rate limited) |
| `POST` | `/api/functions/notifyNewApplication` | Public |
| `POST` | `/api/functions/sendCandidateMessage` · `sendInterviewInvite` | Staff |

List endpoints accept `?filter=<url-encoded JSON>&sort=-created_date&limit=100`.

Access rules live in one place — `server/src/lib/entities.js`. That file also
defines the writable-field allowlist for each entity, so a client cannot set
columns it has no business setting.
