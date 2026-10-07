# AyurSethu — Hackathon Winning Notes

Read this once top to bottom, then re-read Parts 1, 2, 9, 10 and 11 the night before.
Everything here is based on the **actual code** in your project, so you can answer honestly and confidently.

**Time needed:** about 60–75 minutes for the full read. 15 minutes for the "last-minute revision" in Part 12.

---

## PART 0 — How to read this

| Part | What it gives you | Time |
|---|---|---|
| 1 | The pitch (what to say in the first 2 minutes) | 5 min |
| 2 | Problem and solution, in simple words | 5 min |
| 3 | Full tech stack, and why each tool was chosen | 10 min |
| 4 | Architecture, how the pieces talk to each other | 8 min |
| 5 | Database design | 8 min |
| 6 | Every feature, how it works inside | 15 min |
| 7 | Algorithms (Haversine, search, grading) | 5 min |
| 8 | AI part: AyurBot, RAG, LangChain | 8 min |
| 9 | Security | 5 min |
| 10 | Live demo script | 5 min |
| 11 | Judge questions and answers (the most important part) | 15 min |
| 12 | Last-minute revision cheat sheet | 5 min |
| 13 | Honest weaknesses and how to turn them into strengths | 5 min |
| 14 | Template for any future hackathon project | 5 min |

---

## PART 1 — The Pitch

### 30-second version (memorise this word for word)

> "India has a huge Ayurvedic medicine market, but a patient today cannot easily find out where a medicine is in stock nearby, whether it is from a verified manufacturer, or what its price is at different pharmacies. At the same time, BAMS students have no single modern platform to study. **AyurSethu** means *bridge of Ayurveda*. It connects patients, pharmacies, doctors and BAMS students in one platform. A patient searches by Sanskrit, English, Hindi or Kannada name, or even by voice, sees nearby pharmacies with live stock and price, scans the pack's QR code, reserves it, and gets notified at each step. Students get notes, quizzes, flashcards and an AI assistant called AyurBot that answers only from our verified database, so it never invents medical facts."

### 2-minute version structure

1. **Hook** (10 sec): a real situation. "Imagine your grandmother needs Ashwagandha churna at night. Which shop has it? Is it genuine? What is the price?"
2. **Problem** (20 sec): three pains (availability, trust, price) plus one for students.
3. **Solution** (30 sec): one sentence, then 4 key features.
4. **Demo** (60 sec): see Part 10.
5. **Tech and safety** (20 sec): "React, Node, PostgreSQL, role-based security, AI that is grounded and safe."
6. **Impact and future** (20 sec): who benefits, how it scales.

### Words judges love (use naturally)
- "Real problem, real users" · "Role-based access" · "Grounded AI, not hallucinating" · "Honest verification, not false claims" · "Works without an API key, graceful fallback" · "Dockerised and deployed live" · "Scalable to more states and languages"

---

## PART 2 — Problem, Solution, Users

### The problem (4 pains)
1. **Availability** — no single place to see which pharmacy has which Ayurvedic medicine in stock.
2. **Trust / authenticity** — fake or poor-quality products; patients cannot check the manufacturer or batch.
3. **Price opacity** — same medicine, very different prices in different shops.
4. **Education gap** — BAMS students (a 5.5 year degree with **14 subjects**) do not have a modern, organised, interactive study tool.

### The solution
One platform with **5 roles**, each with its own dashboard:

| Role | What they do |
|---|---|
| **Patient** | Search medicines, compare prices, find pharmacies on a map, scan QR, reserve, store prescriptions, set stock alerts |
| **Pharmacy** | Manage inventory, upload licence documents, handle reservations and availability requests |
| **Student (BAMS)** | Study chapters, take quizzes, flashcards, bookmarks, track progress, ask AyurBot |
| **Doctor** | Reference medicines/plants, check availability for patients |
| **Admin** | Verify pharmacies and manufacturers, handle reports, see audit log |

### The name
"Sethu" = bridge in Sanskrit. **AyurSethu = bridge between Ayurveda and people.** Say this; judges remember names with meaning.

### Unique selling points (USP) — say these 5 clearly
1. **Multilingual search** — English, Sanskrit, Hindi, Kannada names + voice search.
2. **Honest authenticity model** — we never say "100% genuine". We show separate signals: manufacturer verification, product verification, batch and expiry.
3. **Safe, grounded AI** — AyurBot only answers using our own database records; it will not prescribe.
4. **End to end** — discovery → compare → reserve → track → notify, plus a learning centre in the same platform.
5. **Accessibility** — "A+" mode for elderly users (large text, high contrast).

---

## PART 3 — Technology Stack (and WHY)

### Frontend
| Tech | What it is (simple) | Why we used it |
|---|---|---|
| **React 18** | JavaScript library for building UIs from reusable components | Industry standard, huge ecosystem, fast re-rendering |
| **TypeScript** | JavaScript with types | Catches bugs while coding; safer for large projects |
| **Vite** | Build tool and dev server | Starts instantly, much faster than older Create React App |
| **Tailwind CSS** | Utility-first CSS | Fast styling, consistent design, small output |
| **React Router v6** | Client-side routing | Pages without full reload; protected routes by role |
| **Axios** | HTTP client | Interceptors attach the JWT token automatically and normalise errors |
| **Leaflet + react-leaflet + OpenStreetMap** | Interactive map | **Free, no API key**, unlike Google Maps |
| **@zxing/browser** | Barcode / QR scanner library | Reads codes from the device camera in the browser |
| **lucide-react** | Icon set | Clean, consistent icons |
| **Web Speech API** | Browser built-in speech recognition | Voice search in English/Hindi/Kannada, no server, no cost |

### Backend
| Tech | What it is | Why |
|---|---|---|
| **Node.js 20** | JavaScript runtime on the server | Same language on frontend and backend |
| **Express** | Minimal web framework | Simple, flexible REST APIs |
| **TypeScript** | Types on the server too | Shared mental model, fewer runtime errors |
| **Prisma ORM** | Type-safe database toolkit | Schema as code, auto-generated client, migrations |
| **Zod** | Schema validation | Validates every request body/query, rejects bad input |
| **JWT (jsonwebtoken)** | Signed token for login | Stateless auth, scalable |
| **bcryptjs** | Password hashing | Passwords are never stored in plain text |
| **helmet** | Sets secure HTTP headers | Protects against common web attacks |
| **express-rate-limit** | Limits requests per IP | 300 requests / 15 min on `/api`, protects against abuse |
| **cors** | Cross-origin control | Only the allowed frontend origin can call the API |
| **morgan** | Request logging | Debugging and monitoring |
| **multer** | File upload handling | Pharmacy documents and prescriptions |

### Database
- **PostgreSQL 16** — relational, strong integrity, supports complex joins, case-insensitive search (`mode: insensitive`).
- Why relational and not MongoDB? Our data is highly connected (medicine ↔ ingredients ↔ plants ↔ pharmacies ↔ inventory ↔ reservations). Relations, foreign keys and unique constraints fit perfectly.

### AI
- **Anthropic Claude API** — called directly through HTTPS (`https://api.anthropic.com/v1/messages`).
- **RAG pattern** (Retrieval-Augmented Generation) implemented by hand: search our DB → put results in the prompt → model answers only from them.
- **Fallback mode** if there is no API key or the API fails: returns a safe summary straight from our database.

### DevOps / Deployment
- **Docker + Docker Compose** — 3 containers (Postgres, backend, frontend/Nginx).
- **Railway** — live demo at `https://ayursethu-production.up.railway.app` (single combined container with embedded Postgres, because of the account's service limit).
- **Nginx** serves the built frontend in Docker mode.

### Dev tools to mention
- **VS Code** (editor), **Git/GitHub** (version control), **Postman/Thunder Client** (API testing), **Prisma Studio** (view DB), **npm**.

---

## PART 4 — Architecture

```
 ┌────────────────────────────┐
 │  Browser (React + Vite)    │  ← Patient / Student / Doctor / Pharmacy / Admin
 │  Tailwind, Leaflet, ZXing  │
 └─────────────┬──────────────┘
               │  HTTPS, JSON, Authorization: Bearer <JWT>
               ▼
 ┌────────────────────────────────────────────────────────┐
 │  Express API (Node + TypeScript)                       │
 │  helmet → cors → json → morgan → rate-limit            │
 │  Router per module:                                    │
 │   /api/auth  /medicines  /pharmacies  /plants          │
 │   /learning  /ayurbot  /admin  /users                  │
 │   /uploads   /reservations  /prescriptions             │
 │  Middleware: requireAuth → requireRole → Zod validate  │
 │  Central errorHandler                                  │
 └──────────┬───────────────────────────┬─────────────────┘
            │ Prisma ORM                │ HTTPS (optional)
            ▼                           ▼
   ┌────────────────┐          ┌───────────────────┐
   │  PostgreSQL    │          │  Claude API       │
   │  (all data)    │          │  (AyurBot answers)│
   └────────────────┘          └───────────────────┘
            +  Local disk /uploads  (prescriptions, pharmacy documents)
```

### Backend code structure (modular)
Each domain folder has the same three files:
- `*.routes.ts` — URL → function mapping + which middleware guards it
- `*.controller.ts` — the logic
- `*.schema.ts` — Zod validation rules

Plus: `middleware/` (auth, errors), `utils/` (ApiError, asyncHandler, haversine distance), `config/` (env, Prisma client).

**Why this is good:** easy to add a new module without touching others. Say: "feature-based modular architecture".

### A request, step by step (explain this if asked "how does it work")
1. User types "ashwagandha" and presses search. React calls `GET /api/medicines?q=ashwagandha&lat=..&lng=..`.
2. Axios interceptor adds `Authorization: Bearer <token>` if logged in.
3. Express passes through helmet, CORS, rate limiter.
4. `optionalAuth` reads the token if present (search is public).
5. Zod validates and converts the query (`medicineSearchSchema`).
6. Controller builds a Prisma query across name, brand, Sanskrit/English/Kannada/Hindi names, indications, ingredients, manufacturer.
7. For each medicine, pharmacy offers are computed with **Haversine distance**, then sorted.
8. Filters (in-stock, price, radius) applied, paginated, JSON returned.
9. React renders cards. Errors go through the central error handler and come back in one consistent format.

### Deployment architecture
- **Local/self-hosted:** `docker compose up` → Postgres + backend + frontend (port 8080).
- **Live demo:** one Railway container: start Postgres → `prisma migrate deploy` → seed if empty → Node serves API and built React static files.
- Honest note: the README itself says the combined container is not the recommended production architecture, only a workaround for the account's service cap. Ideal = 3 separate services with managed Postgres.

---

## PART 5 — Database Design (PostgreSQL + Prisma)

### Main entity groups
1. **Identity:** `User` (email unique, `passwordHash`, `role`), plus 1-to-1 profiles: `PatientProfile`, `StudentProfile`, `DoctorProfile`, `Pharmacy`.
2. **Supply side:** `Manufacturer`, `Medicine`, `MedicineIngredient`, `MedicineImage`, `MedicinePackageSize`, `MedicineBatch`, `Inventory`.
3. **Patient actions:** `Reservation`, `StockAlert`, `Prescription`, `MedicineFavorite`, `Review`, `Report`, `AvailabilityRequest`.
4. **Plants:** `MedicinalPlant`, `PlantImage`, `MedicinePlant` (many-to-many), `AyurvedicProperty`, `ClassicalReference`.
5. **Learning:** `Subject` → `Chapter` → `StudyMaterial` / `Quiz` → `Question` / `Flashcard`; `QuizAttempt`, `StudyProgress`, `FlashcardProgress`, `Bookmark`.
6. **Platform:** `Notification`, `AuditLog`.

### Key design decisions (judges love hearing these)
- **Inventory is a separate table** from Medicine: `Inventory` links one pharmacy + one medicine with price, stock quantity, last updated. `@@unique([pharmacyId, medicineId])` means a pharmacy cannot list the same medicine twice.
- **Batch info separate from inventory:** `MedicineBatch` holds batch number, manufacture and expiry date.
- **Enums** for roles, dosage forms (Tablet, Churna, Kashaya, Asava-Arishta, Vati, Ghrita, Avaleha, Bhasma…), formulation categories, reservation status. This prevents invalid values.
- **Indexes** on frequently searched fields: medicine name, formulation category, product code, pharmacy city + pin code, inventory (medicineId, inStock).
- **Cascade deletes** (`onDelete: Cascade`) so child rows are cleaned up with the parent.
- **`isDemoData` flag** on seeded records, so demo data is never mistaken for real data.
- **Ayurvedic properties modelled:** Rasa, Guna, Virya, Vipaka, Karma (this shows domain knowledge).
- **`productCode` unique** → powers barcode/QR lookup.
- **Decimal(10,2)** for price (never float for money).

### Relationship examples to say aloud
- One Medicine has many Ingredients; an Ingredient can link to one MedicinalPlant.
- Medicine ↔ Plant is **many-to-many** via `MedicinePlant`.
- Pharmacy ↔ Medicine is **many-to-many** via `Inventory`, which also carries price and stock.
- User has one role-specific profile.

---

## PART 6 — Features, and How Each Works Inside

### 6.1 Authentication and roles (RBAC)
- **Register:** Zod validates; checks duplicate email; `bcrypt.hash(password, 10)`; creates User **and** the role-specific profile in one nested Prisma write; returns JWT.
- **Login:** `bcrypt.compare`; returns JWT containing `{ sub: userId, role, email }`.
- **`requireAuth`** reads `Authorization: Bearer …`, verifies with `jwt.verify`, attaches `req.user`.
- **`requireRole("PATIENT")`** blocks other roles with 403.
- **`optionalAuth`** for public routes that behave better when logged in.
- Frontend: `AuthContext` stores the token and user; `ProtectedRoute` guards pages by role.
- Pharmacy accounts must give licence number, address, GPS coordinates; they start as `PENDING` until admin approves.

### 6.2 Medicine discovery (the core feature)
- Searches name, brand, Sanskrit, English, Kannada, Hindi name, traditional indications, ingredients, manufacturer.
- Filters: dosage form, formulation category, verified only, in-stock only, price range, radius in km.
- Each result shows **lowest price, nearest distance, number of offers, stock count**, and top 5 offers.
- Pagination (`page`, `pageSize`).

### 6.3 Medicine detail
Ingredients (linked to plants), images, batches with expiry, package sizes, classical references (source text + citation), related plants, reviews, all pharmacy offers sorted by distance, then price. Buttons: favourite, review, **report this listing**, **ask pharmacies for availability**, **reserve**, **notify when back in stock**.

### 6.4 Authenticity model (a big differentiator)
We deliberately show **separate honest signals**:
- manufacturer verification status (PENDING / VERIFIED / REJECTED)
- product verified flag
- batch and expiry
- pharmacy verification status

We **never** claim "100% genuine". Say: *"We verify what we can prove, and show what we cannot, instead of giving false confidence. Verified by AyurSethu means our admin reviewed submitted documents, not that a government regulator certified it."*

### 6.5 Alternatives and comparison
- **Alternatives:** same formulation category + shares at least one traditional-indication keyword (words longer than 4 characters, first 6). Labelled clearly as **not a claim of clinical equivalence**.
- **Compare:** 2–4 medicines side by side (ingredients, package size, manufacturer licence, lowest price, pharmacies). Validated: fewer than 2 or more than 4 returns 400.

### 6.6 Barcode / QR scanner
- Page `/scan` uses the camera through `@zxing/browser`, or manual code entry.
- Calls `GET /api/medicines/by-code/:code` → looks up `productCode` (unique) → returns full detail.
- Use case: scan the box in a shop to instantly see authenticity info and compare prices.

### 6.7 Pharmacy locator
- Leaflet map with OpenStreetMap tiles, search by city / PIN / current GPS + radius.
- Distances computed on the server with **Haversine formula** (Part 7).

### 6.8 Reservation system (reserve, pay at pharmacy)
- Patient chooses quantity and **PICKUP or DELIVERY** (delivery needs an address; validated).
- Status workflow: `PENDING → CONFIRMED → READY_FOR_PICKUP / OUT_FOR_DELIVERY → COMPLETED` (or `CANCELLED`).
- Each step creates a **Notification** for the patient (message map in `STATUS_MESSAGE`).
- A patient can only cancel **their own** reservation, and not if already completed or cancelled.
- No payment integration (deliberate: pay at pharmacy). Future: Razorpay.

### 6.9 Stock alerts
- "Notify me when back in stock" creates `StockAlert` (unique per user+medicine+pharmacy, so no duplicates; endpoint is idempotent).
- When a pharmacy restocks, a notification is generated automatically.

### 6.10 Prescription vault
- Private file storage per patient. Never visible to any other account (queries filtered by `userId` from the token).
- Uses `POST /api/uploads` (multer to local disk). Swappable to S3/Cloudinary without changing the API.

### 6.11 Voice search + Accessibility
- **Voice:** browser Web Speech API in English, Hindi, Kannada. No server round trip, no API key, no cost. Works best in Chrome.
- **A+ mode:** larger text and higher contrast for elderly users, saved in localStorage.

### 6.12 Pharmacy dashboard
Profile, document upload, inventory CRUD (price, stock), availability-request inbox, reservations inbox with status updates.

### 6.13 Medicinal plants library
List and detail pages: botanical name, Sanskrit/English/Kannada/Hindi names, parts used, properties, uses, habitat, linked medicines. There is also a **preliminary keyword-based identification endpoint** (clearly labelled as non-authoritative, not computer vision).

### 6.14 BAMS Learning Centre
- **14 subjects** seeded → chapters → study notes → quizzes → flashcards.
- **Quiz grading is server-side** (the correct answers are never exposed to the browser for cheating protection); stores `QuizAttempt` with score and total.
- **Flashcards** with known / still-learning tracking per user.
- Bookmarks, per-chapter completed progress.

### 6.15 Admin dashboard
- Stats overview.
- Pharmacy verification queue (approve/reject → notifies the pharmacy).
- Manufacturer verification.
- CRUD for medicines, plants, learning content (via API).
- Report triage (OPEN / REVIEWING / RESOLVED / DISMISSED).
- **Audit log:** every admin action is recorded (who, what, target, when). Shows accountability.

### 6.16 Notifications
Types: availability response, pharmacy approved/rejected, medicine verified, report update, stock alert, reservation update.

---

## PART 7 — Algorithms (explain simply)

### 7.1 Haversine formula (distance between two GPS points)
Earth is a sphere, so straight-line distance on a flat map would be wrong. Haversine gives the **great-circle distance**.

```
a = sin²(Δlat/2) + cos(lat1) · cos(lat2) · sin²(Δlon/2)
c = 2 · atan2(√a, √(1−a))
distance = R · c          (R = 6371 km, Earth's radius)
```
File: `backend/src/utils/distance.ts`.
Used to attach `distanceKm` to every pharmacy offer, filter by radius, and sort nearest first.
**Complexity:** O(1) per pair. Rounded to 1 decimal.

Simple explanation for judges: "It is the formula GPS apps use to find the shortest path along the Earth's surface between two coordinates."

### 7.2 Offer ranking
Sort offers: if distance is known → nearest first; otherwise cheapest first. In stock means `inStock && stockQty > 0`.

### 7.3 Text search
Case-insensitive `contains` across many columns joined with `OR` (SQL `ILIKE '%term%'`). Simple and effective for a catalogue of this size. Scale-up path: Postgres full-text search (`tsvector`), trigram index (`pg_trgm`), or Elasticsearch/Meilisearch.

### 7.4 Alternatives algorithm
Same `formulationCategory` AND any of the first 6 significant words (length > 4) of `traditionalIndications`, limited to 8 results. Rule-based content filtering. Scale-up path: embeddings + cosine similarity.

### 7.5 Quiz scoring
Compare each submitted option with `correctOption` on the server, count the correct ones, store score/total.

### 7.6 Retrieval for AyurBot (keyword RAG)
Take words longer than 2 characters, first 8 words → search medicines (top 5), plants (top 5), subjects (top 3) → format as context. (Part 8.)

### 7.7 Password hashing
bcrypt with cost factor 10: salted, slow on purpose, so brute-forcing is expensive.

---

## PART 8 — The AI Part (AyurBot)

### What it is
An educational assistant embedded in the platform. It explains Ayurvedic terms, helps BAMS students, and can create practice MCQs.

### How it works (RAG — Retrieval-Augmented Generation)
1. **Retrieve:** user question → keyword search in our PostgreSQL (medicines, plants, subjects).
2. **Augment:** results are formatted as "Platform context (only verified facts you may rely on)".
3. **Generate:** sent to the Claude API with a strict **system prompt**.
4. **Return:** answer + the `sources` used + whether a live model was used.

### The system prompt rules (this is your "responsible AI" story)
- Educational information only, **not a doctor**, not a consultation.
- **Never prescribe** a medicine, dosage or treatment plan.
- Never tell anyone to stop or replace modern medical treatment.
- Always recommend consulting a qualified practitioner.
- Use **only** the provided context; do not invent ingredients, references, certifications or clinical claims.
- If context lacks the answer, **say so**; flag uncertainty.

### Graceful fallback (a strong engineering point)
- No `ANTHROPIC_API_KEY`, or the API call fails → AyurBot returns a **local-database summary** with the disclaimer. The app never breaks and the demo works even without internet or a key.
- `max_tokens: 600` caps cost and length.

### Why not just ChatGPT-style free answers?
Because in healthcare, hallucination is dangerous. Grounding answers in verified database records + refusing to prescribe is the safe design.

### About LangChain (the user asked about "long chain") — be careful and honest
**This project does NOT use LangChain.** It implements RAG manually with Prisma + a direct HTTPS call to the Claude API. If a judge asks:

> "We implemented the RAG pipeline directly (retrieve → build context → call the model), which keeps dependencies minimal and gives full control over the prompt and safety rules. The same flow maps one-to-one onto LangChain, where the retriever, prompt template, and LLM chain would be separate components. We can migrate to LangChain or LlamaIndex when we need multi-step agents, memory, or multiple tools."

**What LangChain is (so you can explain it):** a framework to build LLM apps by chaining steps: prompt templates, models, retrievers, memory, tools, and agents. "Chain" = output of one step is input to the next.

### RAG vs fine-tuning (common question)
- **RAG:** give the model fresh facts at question time. Cheap, easy to update, traceable sources. ← we use this.
- **Fine-tuning:** retrain model weights. Costly, hard to update, no source tracking.

### Current limits and the upgrade path
- Retrieval is keyword-based. Upgrade: **embeddings + vector DB (pgvector)** for semantic search, plus citations in answers.
- Plant identification is keyword-based; upgrade: a **vision model** for photo identification.
- Add multilingual AyurBot (Hindi, Kannada), personalised study assistant, AI flashcard generation with admin review.

> **Note on the model name:** the code defaults to `claude-3-5-sonnet-latest` (overridable with the `ANTHROPIC_MODEL` env variable). If a newer model is available, set `ANTHROPIC_MODEL` before the demo rather than editing code. Test it once before the event.

---

## PART 9 — Security (judges always ask)

| Threat | Our protection |
|---|---|
| Password theft | bcrypt hashing (salted, cost 10); password hash is never returned (`sanitizeUser`) |
| Unauthorised access | JWT verification + `requireRole` on every protected route |
| Role escalation | Role is inside the signed token; routes check it server-side |
| SQL injection | Prisma uses parameterised queries |
| Bad input | Zod validation on bodies and queries |
| Abuse / brute force | `express-rate-limit`: 300 requests / 15 min per IP |
| Header attacks | `helmet` |
| Cross-origin misuse | CORS limited to configured origin |
| Data privacy | Prescription and reservation queries always filtered by the token's user id |
| Admin accountability | `AuditLog` on every admin action |
| Large payload | `express.json({ limit: "2mb" })` |
| Secrets | `.env` (not committed); `JWT_SECRET`, API key via environment |
| Medical safety | AI cannot prescribe; honest authenticity wording; `isDemoData` flags |

**Honest points** (say them before a judge finds them; it builds trust):
- Token is stored in `localStorage` (simple, but exposed to XSS; production could use httpOnly cookies).
- Content Security Policy is disabled in helmet because the app loads fonts/tiles/icons from CDNs; production should add an allowlist.
- No automated tests yet.
- Change the default `JWT_SECRET` in production.

---

## PART 10 — Demo Script (3–4 minutes)

**Before going on stage (checklist)**
- [ ] Open the live URL: `https://ayursethu-production.up.railway.app` and **load it once 5 minutes before** (cloud apps can be slow to wake up).
- [ ] Have `localhost` version running as backup (`docker compose up`) and a **screen recording** of the full demo as a second backup.
- [ ] Log in tabs in advance: patient, pharmacy, admin (use demo accounts: `patient@ayursethu.demo`, `pharmacy@ayursethu.demo`, `admin@ayursethu.demo`; the password is printed by the seed script).
- [ ] Allow camera, location and microphone permissions in the browser beforehand.
- [ ] Charge laptop, disable notifications, zoom browser to 110%.
- [ ] Phone hotspot ready in case Wi-Fi fails.

**Flow**
1. **Landing page** (10 sec): "This is AyurSethu."
2. **Patient search** (30 sec): search a medicine by Sanskrit/Hindi name; show filters; click the mic for voice search.
3. **Medicine detail** (30 sec): ingredients, batch/expiry, verification badges, price at each pharmacy with distance. Point at "not a clinical-equivalence claim" wording: "we are careful and honest".
4. **Scan** (20 sec): `/scan`, enter a seeded product code, get the result instantly.
5. **Reserve** (30 sec): reserve for pickup.
6. **Switch to Pharmacy account** (30 sec): see the reservation → confirm → mark ready.
7. **Back to patient** (10 sec): notification arrived. "Real-time workflow without payment complexity."
8. **Admin** (20 sec): pharmacy verification queue and audit log.
9. **Student side** (30 sec): subject → chapter → quiz → flashcards.
10. **AyurBot** (30 sec): ask "What is Rasa?" then ask "Which medicine should I take for fever?" to **show it refuses to prescribe**. This is a strong moment; judges remember it.
11. **A+ accessibility toggle** (10 sec).
12. **Close** (15 sec): impact and next steps.

**Golden rules of a demo**
- Show **one complete story**, not every button.
- Say what you are doing while clicking ("I'm now the pharmacy owner…").
- If something fails, stay calm: "This is the fallback mode, so it still works", then continue with the video.

---

## PART 11 — Judge Questions and Model Answers

### Idea and business
**Q: What problem are you solving and who is the user?**
A: Patients cannot find out where an Ayurvedic medicine is available, whether it comes from a verified manufacturer, or at what price. BAMS students lack an integrated learning tool. Users: patients, pharmacies, doctors, students, admins.

**Q: Who are your competitors? How are you different?**
A: Online pharmacies (1mg, PharmEasy, Netmeds) are allopathy-focused with Ayurveda as a small category, with no local-pharmacy stock discovery by Sanskrit/regional names, no BAMS learning, and no honest verification tiers. Learning apps do not connect to real medicines. We combine discovery, local availability, trust signals, and education. *(Do not insult competitors; say "they do X well, we focus on Y".)*

**Q: How will you make money?**
A: (1) Premium listing / analytics subscription for pharmacies; (2) small commission on reservations once payments are added; (3) manufacturer verification and promotion fees; (4) premium student content / institution licences. Keep patients free.

**Q: How will you scale?**
A: Horizontal scaling of the stateless API (JWT, no server sessions), managed PostgreSQL with read replicas, Redis caching for popular searches, CDN for static files, S3 for uploads, move search to Postgres full-text or Meilisearch/Elasticsearch. Docker makes deployment repeatable.

**Q: Is the data real?**
A: The seeded data is clearly flagged `isDemoData: true` with obviously fake licence numbers. For production, data comes from partnered manufacturers and verified pharmacies. We chose honesty over fake credibility.

**Q: How do you ensure authenticity? Can you guarantee a medicine is genuine?**
A: No, and we deliberately do not claim that. We show separate signals: manufacturer verification, product verification, batch/expiry, pharmacy verification, plus user reports. "Verified" means our admin reviewed documents. A future step is integrating AYUSH licence databases and QR-based manufacturer authentication.

### Technical — backend
**Q: Why Node/Express?** Same language across stack, huge ecosystem, non-blocking I/O suits many concurrent API calls.

**Q: Why PostgreSQL over MongoDB?** Data is relational (medicine–ingredient–plant–pharmacy–inventory–reservation). We need constraints, joins, transactions and unique indexes.

**Q: What is Prisma and why?** A type-safe ORM. Schema as code, auto-generated typed client, migrations, parameterised queries (SQL-injection safe).

**Q: What is JWT? How does auth work?** On login the server signs a token containing user id, role, email with a secret. The client sends it in the `Authorization` header. The server verifies the signature each request; no session stored, so it scales. Expires in 7 days (configurable).

**Q: JWT vs sessions?** JWT is stateless, good for horizontal scaling and APIs; sessions allow instant revocation but need shared storage. Trade-off: to revoke JWTs we would add refresh tokens and a deny-list.

**Q: What is RBAC?** Role-Based Access Control. Each route declares allowed roles with `requireRole(...)`.

**Q: Why Zod?** Runtime validation plus TypeScript types from the same schema. TypeScript alone only checks at compile time; users can still send bad JSON.

**Q: How do you handle errors?** `asyncHandler` wraps controllers so rejected promises go to a central `errorHandler`; a custom `ApiError` class has status codes (400/401/403/404/409). Consistent JSON error format.

**Q: What is middleware?** Functions that run between request and response (auth, logging, validation, rate limiting). They are chained.

**Q: REST API? Which HTTP methods?** GET read, POST create, PUT/PATCH update, DELETE remove. Status codes: 200, 201 created, 204 no content, 400, 401, 403, 404, 409.

**Q: What is an ORM migration?** Versioned database schema changes (`prisma migrate`). Deployment runs `prisma migrate deploy`.

**Q: How do you prevent N+1 queries?** Prisma `include` fetches related rows in a few batched queries.

**Q: Does search scale?** Honest: it uses `contains` queries, and the offer filtering/price filtering and pagination happen in application memory after fetching. Fine for thousands of items; for millions we would push filters and pagination into SQL, add `pg_trgm`/full-text indexes, cache results, or use a search engine.

### Technical — frontend
**Q: Why React?** Component reuse, virtual DOM, large ecosystem, TypeScript support.

**Q: What are hooks/context?** Hooks (`useState`, `useEffect`) manage state and side effects in function components. `AuthContext` shares the logged-in user across all pages without prop drilling.

**Q: How are routes protected?** `ProtectedRoute` checks the user/role from context and redirects to login.

**Q: Why Vite over Create React App?** Faster dev server (native ES modules) and faster builds; CRA is deprecated.

**Q: Why Tailwind?** Speed and consistency. We built our own UI primitives (Button, Card, Input, Badge) in a shadcn-style.

**Q: Why Leaflet/OSM rather than Google Maps?** Free, no API key or billing, open data. Swappable later.

**Q: How does voice search work?** Browser Web Speech API → text → same search. No backend, no cost. Limitation: best in Chrome.

### Technical — AI
**Q: Which AI model do you use?** Anthropic's Claude via the Messages API.

**Q: How do you prevent hallucination?** RAG: retrieve from our own DB, give only that as context, instruct the model to say "I don't know" if missing, refuse prescribing, plus low token cap and a safe fallback.

**Q: What if the AI gives wrong medical advice?** The design forbids prescriptions/dosages, every answer carries a disclaimer, and the answer shows the `sources` used. Human experts should review content. It is an educational tool.

**Q: Are you using LangChain / vector DB?** No. We implemented RAG directly with keyword retrieval to keep the system simple and transparent. Next step is pgvector embeddings (and LangChain/LlamaIndex if we need agents).

**Q: What if the API key is missing or the API is down?** Automatic fallback to local-database mode. The feature degrades gracefully; it does not crash.

**Q: Do you train a model?** No. We use a pretrained model with retrieval, which is faster, cheaper and easier to update.

### Technical — DevOps
**Q: Why Docker?** Same environment everywhere; "works on my machine" problem solved; one command (`docker compose up`) starts Postgres, backend, frontend.

**Q: Where is it deployed?** Railway, live URL in the README. Honest note: single combined container due to a service limit; ideal production is separate services with managed DB.

**Q: How do you handle environment variables / secrets?** `.env` locally, platform variables in deployment; never committed.

### Safety / ethics
**Q: Is it legal to sell Ayurvedic medicine online?** We do not process payments or sell; pharmacies are licensed, and we only reserve, with payment at the pharmacy. We require licence numbers and admin verification. Prescription-only items would need prescription gating (on our roadmap).

**Q: Patient data privacy?** Prescription data is private to the owner; endpoints filter by the authenticated user id. Production would add encryption at rest, signed URLs, and compliance with India's DPDP Act.

### Team / process
**Q: What was the hardest part?** Pick a real one: e.g., modelling inventory, batches and authenticity honestly; or grounding the AI safely. Say what you learned.

**Q: What would you do with another month?** Pharmacy analytics, expiry and low-stock alerts, pgvector RAG, vision-based plant ID, multilingual AI, payments, mobile app (PWA), automated tests.

**Q: What did you NOT finish?** (Judges respect honesty.) See Part 13 and ROADMAP.md.

---

## PART 12 — Last-Minute Cheat Sheet

**One-liner:** AyurSethu is a full-stack platform that bridges patients, pharmacies, doctors and BAMS students for Ayurvedic medicine discovery, honest authenticity, reservation, and learning, with a safe, grounded AI assistant.

**Stack in one breath:** React 18 + TypeScript + Vite + Tailwind + Leaflet → Node/Express + TypeScript + Zod + JWT/bcrypt → PostgreSQL via Prisma → Claude API (RAG) → Docker, Railway.

**Numbers to remember**
- 5 roles · 14 BAMS subjects · 300 req/15 min rate limit · bcrypt cost 10 · JWT 7 days · compare 2–4 medicines · Earth radius 6371 km · AyurBot max 600 tokens · 11 API modules (auth, medicines, pharmacies, plants, learning, ayurbot, admin, users, uploads, reservations, prescriptions).

**API list**
```
POST /api/auth/register | /login
GET  /api/medicines  (search)        GET /api/medicines/:id
GET  /api/medicines/compare?ids=a,b  GET /api/medicines/by-code/:code
GET  /api/medicines/:id/alternatives
POST /api/medicines/:id/favorite | /reviews | /report | /availability-request | /stock-alert
GET/POST/PATCH /api/reservations     GET/POST /api/prescriptions
POST /api/uploads                    POST /api/ayurbot
/api/pharmacies  /api/plants  /api/learning  /api/admin  /api/users
```

**Five strongest talking points**
1. Honest authenticity model (no false "100% genuine").
2. Grounded, safe AI with graceful fallback.
3. Complete workflow across five roles (reserve → confirm → notify).
4. Multilingual + voice + elderly accessibility.
5. Live deployed, Dockerised, with security basics (RBAC, hashing, validation, rate limit, audit log).

**Never say:** "It is 100% accurate" · "AI gives medical advice" · "We use LangChain" (not true) · "It uses Google Maps" (it's OpenStreetMap) · "Plant identification uses computer vision" (it's keyword-based) · "Payments are integrated" (pay at pharmacy).

---

## PART 13 — Honest Weaknesses and How to Present Them

| Weakness | How to say it |
|---|---|
| No automated tests | "We prioritised a working end-to-end product; tests for the core search → reserve flow are the first item on the roadmap." |
| Search filters done in memory | "Right for this catalogue size; we know the SQL/full-text-index migration path." |
| Keyword RAG, not embeddings | "Deliberate simplicity and transparency; pgvector is the planned upgrade." |
| Plant ID is keyword-based | "Clearly labelled preliminary; a vision model is the next step." |
| JWT in localStorage | "Fine for MVP; httpOnly cookies and refresh tokens for production." |
| Files on local disk | "Swappable to S3 with no API change." |
| Combined container deployment | "Account limit; docker-compose shows the proper 3-service architecture." |
| No payments | "Intentional legal/complexity decision; reserve and pay at pharmacy." |
| Demo data | "Flagged `isDemoData` and fake licences on purpose, for honesty." |

Principle: **name the weakness, show you understand the fix, move on.** That reads as maturity, not failure.

---

## PART 14 — General Hackathon Winning Playbook (for any project)

### What judges score (typical)
| Criteria | Typical weight | Your move |
|---|---|---|
| Problem and innovation | 20–25% | Tell a human story, show real need |
| Technical depth | 20–25% | Explain architecture, security, algorithms |
| Working demo | 20–25% | Rehearse; have backups |
| Impact and scalability | 15% | Users, market, how it grows |
| UI/UX | 10–15% | Clean, accessible, consistent |
| Presentation | 10–15% | Clear story, confidence, timing |

### Presentation structure (5 minutes)
Hook (15s) → Problem (45s) → Solution (30s) → **Live demo (2 min)** → Tech and safety (45s) → Impact and roadmap (30s) → Thanks and questions.

### Delivery tips
- Practise out loud at least **3 times** with a timer.
- Split speaking roles: one presents, one drives the demo.
- Do not read slides. Look at the judges.
- Speak slowly; pause after key sentences.
- Never blame the Wi-Fi or teammates.
- "I don't know that exactly, but here's how I'd find out / handle it" is a good answer; **never bluff**.
- End with one memorable line: "AyurSethu — the bridge between Ayurveda and the people who need it."

### Q&A technique
1. Repeat the question briefly (buys thinking time).
2. Answer in one sentence first, then add detail.
3. If it is a weakness, **acknowledge → explain the plan**.
4. Link back to the user's problem.

### Night before checklist
- [ ] App deployed and tested; backup video recorded
- [ ] Demo accounts and data ready; permissions allowed
- [ ] Slides: max 8 (title, problem, solution, demo, architecture, tech, impact/roadmap, thanks)
- [ ] Architecture diagram on one slide
- [ ] Each team member can explain the whole project, not just their own part
- [ ] Print or save this notes file on your phone
- [ ] Sleep 🙂

### How to answer "tell me about yourself/your role"
"I worked on [frontend / backend / database / AI]. The part I'm proudest of is [X] because [Y]." Be specific, with one concrete technical detail.

---

### Glossary (quick definitions you may need)
- **API** — a defined way for two programs to talk (here, the frontend calls the backend over HTTP).
- **REST** — API style using URLs for resources and HTTP verbs for actions.
- **JWT** — signed token proving who you are.
- **RBAC** — permissions based on role.
- **ORM** — maps database tables to code objects.
- **Middleware** — function in the request pipeline.
- **RAG** — retrieve relevant data, then ask the model to answer using it.
- **Hallucination** — AI confidently stating false things.
- **Embedding / vector DB** — numbers representing meaning, used for semantic search.
- **LangChain** — framework for chaining prompts, models, retrievers and tools.
- **Docker** — packages an app and its environment into a container.
- **Nginx** — web server serving static files / reverse proxy.
- **CORS** — browser rule about which websites may call an API.
- **Rate limiting** — cap on requests to prevent abuse.
- **Haversine** — formula for distance between two GPS points.
- **Idempotent** — repeating the same request has the same effect as doing it once.
- **BAMS** — Bachelor of Ayurvedic Medicine and Surgery.
- **Rasa, Guna, Virya, Vipaka, Karma** — Ayurvedic properties: taste, quality, potency, post-digestive effect, action.

---

*Good luck. You built a real, honest, working product. Explain it simply, show one clean story, admit limits calmly, and you will stand out.*
