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

## Deploying to Render

`render.yaml` is a Render Blueprint that provisions all three resources at once.

### 1. Push the repository

Render deploys from Git, so the code needs to be on GitHub, GitLab or Bitbucket:

```bash
git remote add origin git@github.com:<owner>/<repo>.git
git push -u origin main
```

### 2. Create the Blueprint

In the Render dashboard: **New → Blueprint**, select the repository, apply.
This creates:

| Resource | Type | Notes |
| --- | --- | --- |
| `truvmedic-db` | PostgreSQL | Free plan — **deleted after 30 days**, upgrade before launch |
| `truvmedic-api` | Web service (Node) | Runs `prisma migrate deploy` on every build |
| `truvmedic-web` | Static site | SPA rewrite so deep links survive a refresh |

`DATABASE_URL`, `JWT_SECRET`, `APP_URL`, `CORS_ORIGINS` and `VITE_API_URL` are
wired automatically between the services.

### 3. Add the secrets

These are marked `sync: false` in the blueprint, so Render prompts for them.
Set them on **`truvmedic-api` → Environment**:

| Variable | Purpose | Without it |
| --- | --- | --- |
| `BOOTSTRAP_ADMIN_EMAILS` | Comma-separated addresses granted `admin` on first registration | No way to reach the admin portal |
| `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` | CV, certificate and image uploads | Uploads return a clear error |
| `RESEND_API_KEY` | Invites, password resets, candidate emails | Emails are logged, not sent |
| `ANTHROPIC_API_KEY` | Site chatbot | Chatbot replies with a fallback message |

The API starts and serves traffic regardless — each integration degrades on its
own and reports its status at `GET /health`.

### 4. Create the first admin

Put your address in `BOOTSTRAP_ADMIN_EMAILS`, then register at
`https://<your-site>.onrender.com/register`. The account is created as an admin.
Invite the rest of the team from **Users & Roles**.

Alternatively, run the seed from the API service's Render shell:

```bash
SEED_ADMIN_EMAIL=you@truvmedic.com SEED_ADMIN_PASSWORD='…' npm run seed
```

### 5. Post-deploy checks

```bash
curl https://truvmedic-api.onrender.com/health
```

`integrations` in the response shows which providers are configured.

> **Free plan note:** Render spins free web services down after 15 minutes of
> inactivity, so the first request after an idle period takes ~30 seconds. Use a
> paid instance for production.

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
