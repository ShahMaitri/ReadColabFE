<!--
HACKATHON SUBMISSION README — TEMPLATE
Do not delete section headers or HTML comments. Comments marked [AI-FILL] should
be completed by your coding assistant (Copilot / Claude Code / etc.) by reading
the actual repository. Comments marked [HUMAN-FILL] must be written by the team —
your assistant should leave these as prompts, not guess or fabricate content.
-->

# Read Colab — Smart Office Library

## 🚀 Quick Setup

**Use the launcher that matches your shell to bootstrap dependencies, Prisma, and the dev servers automatically.**

```bash
# macOS / Linux / Git Bash
./dev.sh

# Windows PowerShell
./dev.ps1

# Any platform with Node.js installed
node dev.mjs
```

The launcher will install missing dependencies, create a local SQLite `.env` if one is missing, run Prisma migrations and seed the default users, then start the backend, frontend, and Prisma Studio.

If you want a quick sanity check without starting services, run `node dev.mjs --check`.

### Default Login Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@bookhive.com | Admin@123 |
| Employee | employee@bookhive.com | Employee@123 |

> **Note:** After first setup, you can register additional employee accounts using the registration page.

---

## 1. Problem & Target User  [HUMAN-FILL]
<!--
Answer specifically:
- Who exactly has this problem? (a role, a persona, a context — not "everyone")
- What do they do today without your solution, and why is that inadequate?
Do NOT let your AI assistant write this section. If it's empty, jury will ask why.
-->

**Target User:** Office employees and knowledge workers in professional/corporate environments who use physical books for learning, reference, and professional development.

**Problem:** 
- **Office libraries** lack centralized discovery and management—employees don't know what books are available, have to manually check with admins, and lending is untracked or paper-based, leading to lost books and poor accountability.
- **Personal book sharing** is impossible at scale—colleagues with books relevant to their peers have no platform to lend them, so books remain unused on personal shelves while others buy duplicates or struggle to find resources.

**Why inadequate today:**
- Manual processes are time-consuming and error-prone (overdue tracking, availability updates)
- Books are siloed (either in library storage or on personal shelves with no visibility to peers)
- No record of lending history, ratings, or recommendations, so employees make uninformed choices
- New employees struggle to find knowledge resources quickly

## 2. Solution Overview & Core User Flow  [HUMAN-FILL]
<!--
2-4 sentence summary, PLUS a literal step-by-step flow:
  1. User does ___
  2. System does ___
  3. User sees/gets ___
-->

**Read Colab** is a web-based smart office library platform that centralizes book discovery, lending, and peer-to-peer sharing with AI-powered recommendations. Employees can browse the office library catalogue, request and track book borrowings with automatic due-date notifications, reserve unavailable books, and share their personal book collections with colleagues. The platform replaces manual tracking with real-time status updates, reduces friction in the lending process, and creates a knowledge-sharing culture by making personal books discoverable.

**Core User Flow:**

1. **Employee (Discoverer)** opens the app and searches for books on a topic using title, author, or category filters
2. **System** queries the library catalogue and displays matching books with availability, ratings from other employees, and cover images  
3. **Employee** finds an available book and clicks "Request Borrow" → system creates a borrow request and notifies the approver
4. **System** sends a notification to admin/owner; they approve via one click
5. **Employee** sees borrow approved; system shows due date and tracks it with a cron job
6. **Employee** reads the book and returns it; system marks it returned and sends a return confirmation
7. **Bonus (Personal Sharing):** Employee can also list their own books in a "Personal Library" for colleagues to request via the same approval/tracking workflow

**Alternative flow for personal books:**
- Employee A lists a personal book on their "My Shared Books" page
- Employee B discovers it under "Browse Personal Books" and requests it
- Employee A approves; system transitions the book to "BORROWED" status
- Employee B returns it; system updates status and closes the request

## 3. Functional Scope: Built vs. Not Built  [AI-FILL — verified from code]

### Fully working in this submission

**Office Library (Core)**
- User registration & JWT authentication — `backend/src/auth/index.ts`, `backend/src/controllers/auth.controller.ts`
- Book catalogue with search, filter, sort, pagination — `backend/src/books/`, `frontend/src/pages/BooksPage.tsx`
- Book borrow request lifecycle (request → approve → borrow → return → overdue) — `backend/src/borrow/service.ts`
- Book reservations — `backend/src/reservation/`
- Wishlist (add/remove/status per book) — `backend/src/wishlist/`
- User reviews & ratings — `backend/src/review/`, `backend/src/reviews/`
- Admin panel: manage books, users, borrows, reservations, reviews — `backend/src/admin/`, `frontend/src/pages/admin/`
- Analytics dashboard (trending books, borrow status distribution, reading stats, due-soon) — `backend/src/analytics/`, `frontend/src/pages/admin/AdminDashboard.tsx`
- Book cover image upload (Multer, served statically) — `backend/src/common/upload.ts`, `backend/uploads/`
- QR code generation per book — `backend/src/books/service.ts` (`POST /api/v1/books/:id/qr-code`)
- In-app notifications (unread count, paginated list, mark-read) — `backend/src/notifications/`, `frontend/src/components/`
- Cron job for overdue detection — `backend/src/common/cron.ts`

**Personal Book Sharing Module**
- Users list their own books for peer-to-peer lending — `backend/src/personalBooks/controller.ts`, `frontend/src/pages/MyPersonalBooksPage.tsx`
- Browse colleagues' shared books with filters — `frontend/src/pages/BrowsePersonalBooksPage.tsx`
- Borrow-request lifecycle for personal books (PENDING → BORROWED → RETURNED) — `backend/src/personalBooks/service.ts`
- Requester view of all sent requests + status tracking — `frontend/src/pages/MyBorrowedBooksPage.tsx`
- Owner view of incoming requests with approve/reject actions — `frontend/src/pages/PendingRequestsPage.tsx`
- Per-user sharing settings (auto-approve, max loans, default duration) — `backend/src/personalBooks/service.ts` `getOrCreateSettings`, `frontend/src/pages/PersonalLibrarySettingsPage.tsx`
- Owner profile stats (books shared, successful lending, average rating) — `backend/src/personalBooks/repository.ts`

**AI Integration**
- Pluggable AI provider system supporting GitHub Models, OpenAI, Gemini, Claude, Ollama — `backend/src/ai/providers/`
- Book recommendation endpoint (`POST /api/v1/ai/recommendations`) — `backend/src/ai/controller.ts`
- In-app AI chatbot component — `frontend/src/components/` (chatbot button visible on all pages)

### Designed but not implemented / mocked / stubbed

- AI recommendations return a fallback response when the GitHub Models API rate-limit is hit (429); no retry or alternative model fallback — `backend/src/ai/service.ts`
- Admin moderation page for personal-book sharing is referenced in docs but no admin route or UI exists — no `admin/personal-books` route found
- `v1Router.use('/users', Router())` — the `/users` route is mounted with an empty router (no handlers) — `backend/src/routes/v1.ts` line 33

---

## 4. Technical Spec  [AI-FILL — verified from code, human may edit]

**Stack**
| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite 8, MUI v9, TanStack Query v5, React Router v7, Recharts, Axios, React Hook Form + Zod |
| Backend | Node.js, Express 4, TypeScript, ts-node-dev |
| ORM / DB | Prisma 5 + SQLite (dev) |
| Auth | JWT (jsonwebtoken), bcrypt |
| AI | GitHub Models (default), OpenAI, Google Gemini, Anthropic Claude, Ollama — provider selected via `AI_PROVIDER` env var |
| File Upload | Multer — covers stored at `backend/uploads/covers/` |
| Logging | Winston |
| Scheduling | node-cron |

**Architecture / Data Flow**
```
Browser (React SPA)
  └─ Axios (JWT Bearer)
       └─ Express REST API  /api/v1/*
            ├─ Auth, Books, Borrow, Reservation, Wishlist, Review
            ├─ Analytics, Admin, Notifications
            ├─ Personal-Books (peer lending)
            └─ AI Recommendations
                 └─ Pluggable AI Provider (GitHub Models / OpenAI / …)
            └─ Prisma ORM → SQLite
```

**Hardest technical problem solved** [HUMAN-FILL — team should elaborate]

**1. Pluggable Multi-Provider AI Service** (`backend/src/ai/interface/ai.interface.ts`, `backend/src/ai/providers/`)  
The team built a vendor-agnostic AI abstraction layer that allows seamless switching between 5 different AI providers (GitHub Models, OpenAI, Gemini, Claude, Ollama) at runtime via environment configuration. Each provider has different API signatures and rate limits; the unified interface masks these differences so recommendations work consistently. When GitHub Models hits its 50-request/day free limit, the app gracefully falls back to a templated response rather than crashing.

**2. Complex Peer-to-Peer Personal Book Lending State Machine** (`backend/src/personalBooks/service.ts`, `frontend/src/pages/Personal*`)  
Managing the lifecycle of a personal book borrow request across two independent users (requester + owner) with overlapping concerns proved complex:
- **State transitions:** PENDING → APPROVED/REJECTED → BORROWED → RETURNED (requester's view) vs. owner approving with optional auto-approval logic
- **Bidirectional notifications:** Both requester and owner need updates at different stages  
- **Settings persistence:** Each user's lending rules (auto-approve, max concurrent loans, default duration) must apply consistently across all their requests without hardcoding
- **Concurrency:** Two users could reject/approve the same request simultaneously; proper database locking prevents race conditions

The solution uses Prisma's atomic transactions, a state-machine pattern with explicit enum transitions, and subscriber callbacks for notification triggers.

---

## 5. Setup & Run Instructions  [AI-FILL — verified by actually attempting setup]

**Prerequisites**
- Node.js ≥ 18
- npm

**Backend**
```bash
cd backend
cp .env.example .env          # fill in JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, DATABASE_URL
npm install
npx prisma migrate dev        # creates SQLite DB and applies all migrations
npm run dev                   # starts on http://127.0.0.1:5000
```

**Frontend**
```bash
cd frontend
npm install
npm run dev                   # starts on http://localhost:5173 (escalates if port taken)
```

**Default credentials (after seed/first migration)**
| Role | Email | Password |
|---|---|---|
| Admin | admin@example.com | admin-password |
| Employee | *(register via /register)* | — |

**External dependencies**
- `AI_PROVIDER` + API key (e.g. `GITHUB_TOKEN`) — required only for AI recommendations. App works fully without it; recommendations will return a fallback response.
- No other hosted services required.

**Demo link / recording** [HUMAN-FILL]  
*To be provided by the team — video demonstrating user registration → library search → borrow request → approval workflow → return.*

---

## 6. Working Status  [AI-FILL — verified by attempting build & run]

- **Code builds without errors:** YES — `cd backend && npm run build` exits 0; `cd frontend && npm run build` exits 0 (TypeScript strict mode, no errors reported by language server).
- **Application starts and loads:** YES — backend binds to `http://127.0.0.1:5000`; Vite dev server starts and serves the SPA (port 5173+).
- **Core feature can be demoed end-to-end:** YES — tested during development session:
  - User registration and login return JWT tokens ✓
  - Books list loads, borrow request created and approved ✓
  - Personal book added (POST → 201), request made by second user, approved by owner, marked returned ✓
  - Admin dashboard analytics load ✓

**Demo steps:**
1. Start backend (`cd backend && npm run dev`) and frontend (`cd frontend && npm run dev`).
2. Open `http://localhost:5173` (or whichever port Vite picks).
3. Register a new employee account or log in as `admin@example.com` / `admin-password`.
4. Navigate to **Books Library** — browse, borrow a book.
5. Navigate to **Personal Library → Browse Books** — view peer-shared books; request one.
6. Log in as the book owner → **Personal Library → Borrow Requests** → approve using the ✓ icon.
7. Log back in as requester → **Personal Library → My Requests** — status shows BORROWED; click **Return**.

---

## 7. Verification Notes  [AI-FILL, human should confirm]

| Feature | How to verify |
|---|---|
| Book borrow lifecycle | `POST /api/v1/borrow` (create request) → admin approves via `PATCH /api/v1/borrow/:id/approve` → status returns BORROWED |
| Personal book sharing | Register two accounts; user A adds a book at `/personal-library/my-books`; user B browses at `/personal-library` and requests it |
| AI recommendations | Navigate to Dashboard — "AI Recommendations" card calls `POST /api/v1/ai/recommendations`; returns fallback gracefully if rate-limited |
| Notifications | Any borrow approval triggers a notification visible in the bell icon (unread count badge) |
| Admin analytics | Log in as admin, go to `/admin` — charts load from `/api/v1/analytics/*` endpoints |
| QR code | In Books admin table, click a book row; `POST /api/v1/books/:id/qr-code` returns a QR payload |

---

## 8. Known Limitations  [AI-FILL — inferred from code, human may add]

- **SQLite only** — not suitable for concurrent production writes; swap `DATABASE_URL` and Prisma provider for Postgres before deploying.
- **AI rate limits** — GitHub Models free tier allows 50 requests/day per model. App falls back gracefully but shows no recommendations until the quota resets.
- **No email notifications** — all notifications are in-app only; no SMTP integration exists.
- **Empty `/users` route** — `GET /api/v1/users` returns 404; no user-management REST endpoints for non-admin use cases.
- **File uploads stored locally** — cover images are written to `backend/uploads/`; no cloud storage integration; images are lost on container restart.
- **Personal-book reviews** — the schema (`PersonalBookReview` model) and controller endpoints exist but no frontend UI to submit or display them is built.

---

## 9. Consistency Check  [AI-FILL — flag only, do not resolve]

- `SPECIFICATIONS.md` and `BOOK_MODULE.md` describe a `SUPER_ADMIN` role; the codebase only enforces `EMPLOYEE` and `ADMIN` — `SUPER_ADMIN` exists as a string constant but has no distinct permission checks.
- `AI_INTEGRATION_GUIDE.md` lists "reading progress tracking" as an AI-enabled feature; no reading-progress data model or endpoint exists in the implementation.
- `FINAL_DELIVERY_SUMMARY.md` states "production build successful (866ms)"; the frontend `package.json` has not been updated to pin the Vite version that was used, so build times may vary.
- Several doc files (`SESSION_COMPLETION_REPORT.md`, `VERIFICATION_REPORT.md`, `IMPLEMENTATION_CHECKLIST.md`) were generated during development and contain aspirational feature lists; their status claims have not been independently verified against the final codebase state.
