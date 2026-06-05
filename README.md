# Multi-Tenant CRM

Minimal multi-tenant CRM built for a full-stack take-home assignment: **NestJS**, **PostgreSQL**, **Prisma**, **Next.js**, and **JWT** auth with organization-scoped data isolation.

## Live URLs

| Service | URL |
|---------|-----|
| Frontend | _Add after deploy (e.g. Vercel)_ |
| Backend API | _Add after deploy (e.g. AWS App Runner / ECS)_ |
| Swagger | `{API_URL}/api` |

## Quick start (Docker — recommended)

**Requirements:** Docker & Docker Compose

```bash
git clone <your-repo-url>
cd multi-tenant-crm
docker compose up --build
```

| Service | URL |
|---------|-----|
| Web UI | http://localhost:3001 |
| API | http://localhost:3000 |
| Swagger | http://localhost:3000/api |

**Demo login**

- Admin: `admin@acme.test` / `password123`
- Member: `member@acme.test` / `password123`

Stop: `docker compose down`  
Reset DB: `docker compose down -v`

## Local development (without Docker)

### Backend

```bash
cd backend
cp .env.example .env
# Set DATABASE_URL, JWT_SECRET
npm install
npx prisma migrate deploy
npm run prisma:seed
npm run start:dev
```

API: http://localhost:3000  
Swagger: http://localhost:3000/api

### Frontend

```bash
cd frontend
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:3000
npm install
npm run dev
```

UI: http://localhost:3002 (or next free port)

---

## 1. Architecture decisions

- **Monorepo:** `backend/` (NestJS API) + `frontend/` (Next.js App Router).
- **Layers:** Controllers → Services → Prisma (no fat controllers).
- **Auth:** JWT (`sub`, `organizationId`, `role`) via Passport; guards on protected routes.
- **Multi-tenancy:** Every query filters by `organizationId` from the token — never trust client-supplied org IDs for authorization.
- **Activity log:** Written in the same DB transaction as the business action where possible.
- **API docs:** Swagger/OpenAPI at `/api` (production improvement).

## 2. Multi-tenancy isolation

- Each user belongs to **one** `Organization`.
- **Login** requires `organizationId` + `email` (scoped lookup via `@@unique([organizationId, email])`) so the same email in two orgs cannot log into the wrong tenant.
- JWT payload includes `organizationId`; `JwtStrategy` re-validates the user still exists in that org.
- All customer/user/note operations use `where: { organizationId: currentUser.organizationId }`.
- Updates use `updateMany` with `id` + `organizationId` so cross-tenant ID guessing returns 404.
- User emails are unique per org: `@@unique([organizationId, email])`.

## 3. Concurrency-safe assignment (max 5 active customers)

When assigning a customer to a user:

1. Start a **Prisma `$transaction`**.
2. **`SELECT ... FOR UPDATE`** on the assignee `User` row — serializes concurrent assigns to the same user.
3. Count active customers: `assignedToId = user`, `deletedAt IS NULL`, same org.
4. If count ≥ 5 → `409 Conflict` (unless already assigned to that user).
5. Update `assignedToId` and log `customer_assigned`.

This prevents two parallel requests from both passing a “4 assignments” check and creating a 6th assignment.

## 4. Performance strategy & indexing

**Goal:** Support ~100,000 customers per organization.

| Index | Purpose |
|-------|---------|
| `(organizationId, deletedAt)` | Paginated list of active customers |
| `(organizationId, name)` / `(organizationId, email)` | Search filters |
| `(assignedToId, deletedAt)` | Assignment count |
| **Partial** `(organizationId) WHERE deletedAt IS NULL` | Manual index for active-only scans |

**Query patterns**

- Pagination: `count` + `findMany` with `skip/take` in one transaction (no N+1 for meta).
- List includes `assignedTo` in a single query (no per-row user fetch).
- Soft-deleted rows excluded via `deletedAt: null` on normal reads.

**At scale:** Prefer cursor-based pagination over deep `OFFSET` for very large page numbers (trade-off documented; offset used for simplicity in this MVP).

## 5. Scaling this system

- **Database:** Read replicas for reporting; connection pooling (PgBouncer).
- **API:** Horizontal scale behind a load balancer; stateless JWT instances.
- **Tenancy:** Schema-per-tenant or DB-per-tenant only if compliance requires it; shared schema + `organizationId` is fine for many B2B SaaS cases.
- **Heavy reads:** Redis cache for org-scoped list pages with short TTL + cache invalidation on writes.
- **Writes:** Queue for async activity/analytics export if log volume grows.

## 6. Trade-offs

| Choice | Why | Cost |
|--------|-----|------|
| Shared DB + `organizationId` | Simple, fast to ship | Must enforce tenant filter everywhere |
| Offset pagination | Easy UI | Slower on very deep pages |
| Soft delete | Required; keeps notes/logs | Queries must always filter `deletedAt` |
| JWT stateless auth | Simple deploy | No instant revoke without blocklist |
| Minimal UI | Assignment focus | No admin user-management screen |
| Docker all-in-one compose | Easy reviewer setup | Not identical to production AWS topology |

## 7. Production improvement: Swagger (OpenAPI)

**Choice:** Interactive API documentation at `/api`.

**Reasoning:** Reviewers and integrators can test auth, customers, assign, and notes without reading source. Faster validation than Postman collections alone; standard for production APIs.

---

## Project structure

```
multi-tenant-crm/
├── backend/          # NestJS + Prisma
├── frontend/         # Next.js + React Query
├── docker-compose.yml
└── README.md
```

## API overview

| Area | Endpoints |
|------|-----------|
| Auth | `POST /auth/login` |
| Users | `GET /users`, `POST /users` (admin) |
| Customers | CRUD, search, pagination, soft delete, restore, `PATCH /:id/assign` |
| Notes | `GET/POST /customers/:id/notes` |

## AWS deployment (outline)

Dockerfiles are production-oriented; typical AWS layout:

- **RDS PostgreSQL** — database
- **ECR + ECS / App Runner** — `backend/Dockerfile`
- **Amplify / S3+CloudFront / ECS** — `frontend/Dockerfile` (set `NEXT_PUBLIC_API_URL` to public API URL)

`docker-compose.yml` is for **local/demo**; on AWS you replace the `db` service with RDS and deploy images separately.

## License

Private take-home submission.
