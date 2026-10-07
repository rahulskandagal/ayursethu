# AyurSethu

Ayurvedic medicine discovery, authenticity information and BAMS student learning platform.
A working full-stack app: React/TypeScript frontend, Node/Express/TypeScript backend,
PostgreSQL via Prisma, role-based auth (Patient, Student, Doctor, Pharmacy, Admin).

**Live demo**: https://ayursethu-production.up.railway.app — demo logins below.

## Production deployment (`deploy/`)

The live demo runs as a **single combined Railway service** — one container with
an embedded PostgreSQL instance, built from [deploy/Dockerfile](deploy/Dockerfile)
and started by [deploy/entrypoint.sh](deploy/entrypoint.sh) (init/start Postgres →
`prisma migrate deploy` → seed if empty → start the Node server, which also serves
the built frontend as static files — see the bottom of `backend/src/app.ts`).

This exists because the hosting account has a cap on the number of separate
services it can provision. **It is not the recommended architecture** — it bundles
a database into an app container, which is harder to scale, back up, and reason
about than managed Postgres. On an unconstrained account, prefer three independent
services (backend, frontend, managed Postgres), which is exactly what
`docker-compose.yml` + `backend/Dockerfile` + `frontend/Dockerfile` already set up
for local/self-hosted use — use `deploy/` only when you're under a similar
service-count constraint.

## What's implemented

- **Auth & roles**: JWT auth, bcrypt password hashing, 5 roles with route-level RBAC.
- **Medicine discovery**: full-text-ish search (name/brand/Sanskrit/English/Kannada/Hindi/
  ingredient/manufacturer), filters (dosage form, verified-only, in-stock, price, radius),
  per-pharmacy offers with distance and last-updated stock.
- **Medicine detail**: ingredients, images, batches, package sizes, classical references,
  related plants, reviews, "report this listing", "ask pharmacies for availability".
- **Authenticity model**: separate, honest signals — manufacturer verification status,
  product verification flag, batch/expiry info — never a blanket "100% genuine" claim.
- **Medicine comparison** (2–4 items side by side).
- **Pharmacy locator**: OpenStreetMap/Leaflet map, search by city/PIN/geolocation + radius.
- **Pharmacy dashboard**: profile, document upload (real file upload to local disk),
  inventory CRUD, availability-request inbox, and a reservations inbox with a status
  workflow (confirm → ready/out-for-delivery → completed).
- **Medicinal plants library** + detail pages, plus a clearly-labeled *preliminary,
  non-authoritative* plant identification endpoint (keyword-based, not a vision model).
- **BAMS learning center**: all 14 subjects seeded, chapters, study notes, quizzes with
  server-side grading, flashcards with spaced "known/still learning" tracking, bookmarks,
  per-chapter progress tracking.
- **AyurBot**: retrieval-augmented assistant — pulls real matching medicines/plants/subjects
  from the database as grounding context, calls Claude if `ANTHROPIC_API_KEY` is set,
  otherwise falls back to a safe local-database summary. Always includes a non-prescriptive,
  "educational only" framing.
- **Admin dashboard**: stats, pharmacy verification queue (approve/reject + notifies the
  pharmacy), manufacturer verification, medicine/plant/learning-content CRUD via API,
  report triage, audit log of every admin action.
- **Seed data**: one demo account per role + 2 pharmacies (one verified, one pending),
  2 demo medicines with real relational data (ingredients, batches, inventory across
  pharmacies, barcode/QR codes), 2 demo plants, all 14 BAMS subjects, 1 sample chapter
  with notes/quiz/flashcards. Everything seeded is flagged `isDemoData: true` where the
  schema supports it, and uses obviously fake license numbers — replace before any real
  deployment.

### Patient-Commerce module (second pass)

Added on top of the foundation above — see [ROADMAP.md](ROADMAP.md) for the full
feature map and what's still unbuilt:

- **Medicine alternatives**: same-formulation-category suggestions on the medicine
  detail page, explicitly labeled as not a clinical-equivalence claim.
- **Barcode/QR scanner**: `/scan` page using the device camera (`@zxing/browser`) or
  manual code entry, resolving to `GET /medicines/by-code/:code`.
- **Online reservation**: patients reserve a specific quantity for pickup or delivery
  from a pharmacy's in-stock offer; pharmacies manage a status workflow (pending →
  confirmed → ready/out-for-delivery → completed) that notifies the patient at each
  step. No payment integration — "reserve, pay at pharmacy."
- **Digital prescription vault**: private per-patient file storage (`/patient/prescriptions`),
  never visible to any other account — there is no sharing workflow yet.
- **Out-of-stock alerts**: "Notify me when back in stock" on a medicine's page creates
  a `StockAlert`; restocking a pharmacy's inventory fires a notification automatically.
- **My Reports**: patients can see the status of listings they've reported.
- **Voice search**: a mic button on the medicine search page using the browser-native
  Web Speech API (English/Hindi/Kannada), no server round-trip or API key.
- **Accessibility mode**: an "A+" toggle in the navbar for larger text and higher
  contrast, aimed at elderly users, persisted per-browser.
- **Real file uploads**: `POST /api/uploads` (multer, local disk) now backs both
  pharmacy documents and the prescription vault, replacing the earlier URL-only fields.

## Deliberate scope choices for this build

The original spec is very large (Google Maps, QR-code scanning, file-upload storage,
vector-DB RAG, full shadcn/ui, Docker-everything). To ship something that actually runs,
this build makes swappable simplifications, documented so they're easy to extend:

| Spec item | This build | To go to spec |
|---|---|---|
| Google Maps API | OpenStreetMap + Leaflet (no API key needed) | Swap `PharmacyLocator.tsx` map layer for `@react-google-maps/api` |
| Secure document storage | Pharmacies submit a document **URL** | Add real upload (S3/Cloudinary) + signed URLs |
| QR code scanning | Not implemented | Add a scanning library + a `/medicines/by-code/:code` lookup |
| RAG for AyurBot | Keyword retrieval directly over the Postgres tables | Add embeddings + a vector store (pgvector, etc.) |
| shadcn/ui | Hand-rolled Tailwind components in a matching style | Run the shadcn CLI against `frontend/src/components/ui` |
| AI plant image ID | Text-description keyword matching, labeled preliminary | Add a real vision model behind `/plants/identify` |

## Tech stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, React Router, Leaflet, lucide-react.
- **Backend**: Node.js, Express, TypeScript, Zod validation, JWT, bcrypt, helmet, rate limiting.
- **Database**: PostgreSQL + Prisma ORM (see `backend/prisma/schema.prisma` for the full
  relational model: Users, Profiles, Pharmacies, Manufacturers, Medicines + ingredients/
  images/batches/package sizes, Inventory, AvailabilityRequests, MedicinalPlants, Subjects/
  Chapters/StudyMaterials/Quizzes/Questions/Flashcards, Bookmarks, Reviews, Reports,
  Notifications, AuditLog).
- **AI**: Anthropic Claude API (optional; falls back gracefully without a key).

## Running locally (without Docker)

Prerequisites: Node.js 20+, a running PostgreSQL instance.

```bash
# 1. Backend
cd backend
cp .env.example .env            # edit DATABASE_URL / JWT_SECRET as needed
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev                     # http://localhost:4000

# 2. Frontend (separate terminal)
cd frontend
npm install
npm run dev                     # http://localhost:5173 (proxies /api to :4000)
```

Demo logins (password shown in the seed script's console output):

| Role | Email |
|---|---|
| Admin | admin@ayursethu.demo |
| Patient | patient@ayursethu.demo |
| Student | student@ayursethu.demo |
| Doctor | doctor@ayursethu.demo |
| Pharmacy (verified) | pharmacy@ayursethu.demo |
| Pharmacy (pending) | pharmacy2@ayursethu.demo |

## Running with Docker

```bash
cp backend/.env.example .env   # optional: set JWT_SECRET / ANTHROPIC_API_KEY here
docker compose up --build
```

This starts Postgres, runs backend migrations on boot, and serves:

- Frontend: http://localhost:8080
- Backend API: http://localhost:4000

Seed the database once the containers are healthy:

```bash
docker compose exec backend npm run seed
```

## Project structure

```
backend/
  prisma/schema.prisma   # full data model
  prisma/seed.ts         # demo data, clearly marked as such
  src/
    modules/<domain>/    # routes + controller + zod schema per domain
    middleware/          # JWT auth, RBAC, error handling
    config/               # env, Prisma client
frontend/
  src/
    pages/               # one file per route, incl. per-role dashboards
    components/ui/        # Tailwind design-system primitives
    context/AuthContext.tsx
    api/client.ts         # axios instance with auth header + error normalization
```

## Next steps toward full production readiness

1. ~~Real file/image upload pipeline~~ — done for pharmacy documents and the prescription
   vault (local disk); medicine/plant photos still use seeded URLs.
2. A formal manufacturer/product licensing verification workflow (today, "verified"
   means AyurSethu has reviewed submitted info, not an independent regulatory check —
   keep that distinction visible in the UI).
3. Vector-store-backed RAG for AyurBot instead of keyword retrieval, with citations.
4. Rich admin screens for catalog/content CRUD (the API already supports it end-to-end).
5. Automated tests (unit for controllers/services, e2e for the core search → detail →
   availability-request flow).
6. See [ROADMAP.md](ROADMAP.md) for the full 60+ feature map and the next recommended
   module (Pharmacy-Ops: expiry/low-stock alerts, batch tracking, demand analytics).
