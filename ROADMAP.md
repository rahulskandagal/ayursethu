# AyurSethu — Feature Map, Architecture & Development Checklist

This tracks the full feature set from both the original spec and the "Additional
Advanced Features" expansion, organized into independent modules with status.
Update the status column as modules land. Do not implement everything at once —
ship one module end-to-end (API + DB + working UI) before starting the next.

Legend: ✅ Done (MVP) · 🚧 Partial · ⬜ Not started · 🔶 Needs an external
decision/account before work can start (payment provider, OCR engine, voice API, etc.)

## 0. Foundation (built in the first pass)

| # | Feature | Status | Notes |
|---|---|---|---|
| 1 | Auth & 5 user roles (RBAC) | ✅ | JWT, bcrypt, route-level guards |
| 2 | Medicine database (full relational model) | ✅ | ingredients, images, batches, package sizes, classical refs |
| 3 | Medicine discovery (search/filter/geo) | ✅ | |
| 4 | Pharmacy locator (map, city/PIN/radius) | ✅ | Leaflet/OSM, not Google Maps |
| 5 | Pharmacy inventory (CRUD) | ✅ | single price/stock per medicine, no batch-level inventory yet |
| 6 | Medicine verification (manufacturer/product flags) | ✅ | admin-reviewed flags, not independent regulatory verification |
| 7 | BAMS learning center (subjects/chapters/quizzes/flashcards) | ✅ | |
| 8 | AyurBot (educational assistant) | ✅ | keyword retrieval + optional Claude call, safe fallback |
| 9 | Admin dashboard | ✅ | pharmacy approval, reports, audit log |
| 10 | Docker Compose deployment | ✅ | verified working end-to-end |

## A. Advanced Patient Features

| Feature | Module | Status | External dependency |
|---|---|---|---|
| Medicine alternatives/comparison | Patient-Commerce | ✅ | `GET /medicines/:id/alternatives` (same formulation category + indication keywords) alongside the existing compare endpoint |
| Barcode/QR scanner | Patient-Commerce | ✅ | `@zxing/browser` camera scan + manual code entry, `GET /medicines/by-code/:code` |
| Price comparison | Patient-Commerce | ✅ | already in medicine detail/search offers |
| Online medicine reservation | Patient-Commerce | ✅ | `Reservation` model, patient create/cancel, pharmacy status workflow + notifications — pay at pharmacy, no payment integration |
| Digital prescription vault | Patient-Commerce | ✅ | `Prescription` model, private to the uploading user, local-disk file storage |
| Delivery tracking | Patient-Commerce | ✅ | modeled as `Reservation.status` steps (PENDING→CONFIRMED→READY/OUT_FOR_DELIVERY→COMPLETED) with a UI progress tracker — no real courier integration |
| Out-of-stock notifications | Patient-Commerce | ✅ | `StockAlert` model, fires a `Notification` when a pharmacy restocks |
| Expiry/batch info to patients | Patient-Commerce | ✅ | shown on medicine detail already |
| Medicine enquiry system | Patient-Commerce | ✅ | availability-request flow already covers this |
| Complaint/report portal | Patient-Commerce | ✅ | report-a-listing + new "My Reports" view (`GET /users/me/reports`) |
| Multilingual voice search | Patient-Commerce | ✅ | Web Speech API (English/Hindi/Kannada), browser-only, no server round-trip |
| Elderly-accessible UI mode | Patient-Commerce | ✅ | navbar "A+" toggle — larger base font size + higher contrast, persisted in localStorage |

**File storage**: a real local-disk upload pipeline now backs pharmacy documents and
the prescription vault (`POST /api/uploads`, multer, served from `/uploads`). Swap
the multer storage engine for an S3/Cloudinary adapter later without changing the
API shape — see `backend/src/modules/uploads/uploads.routes.ts`.

## B. Advanced BAMS Student Features

| Feature | Module | Status | External dependency |
|---|---|---|---|
| 3D human anatomy lab | Student-Advanced | ⬜ 🔶 | needs a 3D model library (three.js) + licensed/open anatomy models |
| Digital medicinal plant garden | Student-Advanced | ⬜ | can reuse MedicinalPlant data in a browsable "garden" map/grid view |
| Sanskrit terminology translator | Student-Advanced | ⬜ 🔶 | dictionary dataset or AI-assisted translation |
| Shloka learning + pronunciation | Student-Advanced | ⬜ 🔶 | needs audio assets or TTS provider |
| Previous question paper library | Student-Advanced | ⬜ | file storage + metadata model, no new infra beyond uploads |
| AI notes generation | Student-Advanced | ⬜ | Claude-backed, reuses AyurBot's pattern |
| Practical record management | Student-Advanced | ⬜ | new `PracticalRecord` model (student-authored, instructor sign-off) |
| Herb image identification | Student-Advanced | 🚧 | preliminary keyword version exists; real vision model is 🔶 |
| Virtual formulation lab | Student-Advanced | ⬜ | simulated "combine ingredients" exercise against real formulation data |
| Clinical case study library | Student-Advanced | ⬜ | admin/expert-authored content model |
| Internship/posting tracker | Student-Advanced | ⬜ | new model, straightforward CRUD |
| Research paper library | Research-Ecosystem | ⬜ | file + metadata model |
| Student discussion community | Student-Advanced | ⬜ | new forum module (threads/replies/moderation) |
| Subject-wise mock exams | Student-Advanced | ⬜ | extends existing quiz engine with timed, multi-chapter exams |
| Personalized exam prep | Student-Advanced | ⬜ | derived from quiz-attempt history, no new infra |

## C. Advanced AI Features

| Feature | Module | Status | External dependency |
|---|---|---|---|
| AyurBot | AI-Core | ✅ | |
| Medicine label OCR | AI-Core | ⬜ 🔶 | needs an OCR engine (Tesseract.js client-side, or a cloud OCR API) |
| Classical text search | AI-Core | ⬜ | search over `ClassicalReference`/`StudyMaterial`, mostly a search-index task |
| Multilingual AI assistant | AI-Core | ⬜ | extend AyurBot's system prompt + i18n'd UI |
| Voice-based discovery | AI-Core | ⬜ 🔶 | same Web Speech API decision as patient voice search |
| Personalized learning assistant | AI-Core | ⬜ | Claude-backed, reads a student's progress/quiz history as context |
| Research paper summarization | AI-Core | ⬜ | Claude-backed, depends on Research paper library existing first |
| Shloka explanation | AI-Core | ⬜ | Claude-backed, depends on Shloka content existing first |
| AI flashcard generation | AI-Core | ⬜ | Claude-backed, generates draft flashcards for admin review before publishing |
| AI plant identification (real) | AI-Core | 🚧 | preliminary keyword version exists; real version is 🔶 (vision model) |

## D. Pharmacy & Manufacturer Features

| Feature | Module | Status | External dependency |
|---|---|---|---|
| Pharmacy management dashboard | Pharmacy-Ops | ✅ | MVP exists; this group extends it |
| Real-time inventory updates | Pharmacy-Ops | 🚧 | CRUD exists; "real-time" (websockets/polling push to patients) not yet |
| Expiry alerts | Pharmacy-Ops | ⬜ | background job scanning `MedicineBatch.expiryDate` |
| Low-stock notifications | Pharmacy-Ops | ⬜ | threshold field + background job |
| Demand analytics | Pharmacy-Ops | ⬜ | aggregate search/enquiry events — needs an events/analytics table first |
| Manufacturer product management | Manufacturer-Ops | ⬜ | manufacturers currently admin-managed only; needs their own login/role or scoped pharmacy-like account |
| Batch tracking | Pharmacy-Ops | 🚧 | `MedicineBatch` exists; needs a dedicated tracking UI |
| Medicine recall tracking | Compliance | ⬜ | new `Recall` model + notifications to affected pharmacies/patients who favorited it |
| Supplier marketplace | Ecosystem-Marketplace | ⬜ 🔶 | B2B ordering between pharmacies and manufacturers — significant new module |
| Wholesale price comparison | Ecosystem-Marketplace | ⬜ | depends on supplier marketplace existing |
| Digital purchase orders | Ecosystem-Marketplace | ⬜ 🔶 | depends on supplier marketplace; payment/invoicing decision needed |
| Pharmacy performance analytics | Pharmacy-Ops | ⬜ | depends on demand analytics events table |

## E. Ayurvedic Ecosystem Features

| Feature | Module | Status | External dependency |
|---|---|---|---|
| Farmer marketplace | Ecosystem-Marketplace | ⬜ 🔶 | new role (`FARMER`), listings, likely payments |
| Medicinal plant geo map | Ecosystem-Marketplace | ⬜ | extends MedicinalPlant with cultivation-region geo data |
| College management portal | Research-Ecosystem | ⬜ 🔶 | new role (`COLLEGE_ADMIN`), significant new module |
| Research collaboration hub | Research-Ecosystem | ⬜ | forum/project-matching module |
| Conferences & events | Research-Ecosystem | ⬜ | straightforward CRUD + RSVP |
| Internship marketplace | Research-Ecosystem | ⬜ | listings + application flow, reuses patterns from availability-requests |
| Expert verification portal | Compliance | ⬜ | workflow for credentialed reviewers to sign off on content |
| Digital pharmacopoeia library | Research-Ecosystem | ⬜ | curated reference content, admin-authored |
| Public health awareness centre | Research-Ecosystem | ⬜ | expert-reviewed articles, admin-authored |
| Student portfolios/certificates | Student-Advanced | ⬜ | aggregates quiz/progress/practical data into a shareable profile |

## F. Safety, Verification & Compliance

| Feature | Status | Notes |
|---|---|---|
| Structured pharmacy/manufacturer verification workflow | ✅ | exists; can add more document types/stages |
| Batch info kept separate from inventory | ✅ | already modeled as separate `MedicineBatch` / `Inventory` |
| Traceable verification status + source docs | ✅ | `PharmacyDocument`, `AuditLog` |
| Complaint & recall management | 🚧 | complaints exist (Report); recall tracking is new (see D) |
| Patient data privacy | ✅ | only own data returned from authenticated endpoints |
| RBAC | ✅ | |
| Prescription authorization gating | ⬜ | depends on prescription vault (A) existing first |
| AI not presented as a medical professional | ✅ | enforced in AyurBot's system prompt and UI copy |
| No unverified authenticity claims | ✅ | explicit verification-tier language already in place |
| Qualified human review for medical entries | 🚧 | admin review exists; no formal "qualified reviewer" role yet |

## G. Advanced Analytics Dashboards

| Audience | Status | Depends on |
|---|---|---|
| Admin | 🚧 | basic stats exist; richer metrics need an events table |
| Pharmacy | ⬜ | demand analytics (D) |
| Manufacturer | ⬜ | manufacturer accounts (D) + demand analytics |
| College | ⬜ | college portal (E) |
| Student | 🚧 | basic progress view exists; richer analytics need more quiz history |
| Researcher | ⬜ | research hub (E) |

---

## Proposed module sequence

Everything above collapses into these independently shippable modules. Suggested
order balances "builds on existing foundation" against "user-facing value":

1. ~~**Patient-Commerce** (A) — alternatives, reservation, stock alerts, barcode scan, complaint portal polish.~~ ✅ Done.
2. **Pharmacy-Ops** (D core) — expiry/low-stock alerts (background jobs), batch tracking UI, demand analytics events table. Builds on existing pharmacy dashboard. **Recommended next.**
3. **Student-Advanced** (B core) — mock exams, AI notes generation, plant garden view, question paper library, discussion community. Builds on existing learning center.
4. **AI-Core expansion** (C) — OCR, multilingual, personalized learning assistant, AI flashcard generation. Builds on AyurBot's existing retrieval pattern.
5. **Compliance** (F remainder) — recall tracking, expert-reviewer role, prescription authorization gating.
6. **Analytics** (G) — once each module has an events table, build the per-audience dashboards.
7. **Ecosystem-Marketplace** (D/E marketplace items) — supplier marketplace, farmer marketplace, purchase orders. Largest new surface area; needs a payments decision.
8. **Research-Ecosystem** (E remainder) — college portal, research hub, conferences, pharmacopoeia library. Largest new surface area; needs new roles.

Modules 7 and 8 are effectively new products bolted onto AyurSethu and will roughly
double the codebase each — worth scoping separately when we get there.

## Open decisions needed before certain features can start

- **Payments**: reservation/marketplace/purchase-order features need a provider (Stripe, Razorpay, etc.) and a decision on test vs. live mode.
- **OCR**: client-side (Tesseract.js, free, runs in-browser) vs. a cloud OCR API (more accurate, costs money, sends images to a third party).
- **Voice**: browser-native Web Speech API (free, Chrome-only, no server round-trip) vs. a cloud STT provider.
- **3D anatomy models**: need a licensed or open-source anatomical model set — this is a content-licensing question, not just engineering.
- **File/image storage**: prescriptions, question papers, research papers all need the same real upload pipeline (S3/Cloudinary) that pharmacy documents already punted on.

Resolving the file-storage question once unblocks several B/D/E features at once, so
it's worth doing early regardless of which module is picked first.
