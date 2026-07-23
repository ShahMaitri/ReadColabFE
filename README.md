<!--
HACKATHON SUBMISSION README — TEMPLATE
Do not delete section headers or HTML comments. Comments marked [AI-FILL] should
be completed by your coding assistant (Copilot / Claude Code / etc.) by reading
the actual repository. Comments marked [HUMAN-FILL] must be written by the team —
your assistant should leave these as prompts, not guess or fabricate content.
-->

# Read Colab — Smart Office Library

## 1. Problem & Target User  [HUMAN-FILL]
<!--
Answer specifically:
- Who exactly has this problem? (a role, a persona, a context — not "everyone")
- What do they do today without your solution, and why is that inadequate?
Do NOT let your AI assistant write this section. If it's empty, jury will ask why.
-->

## 2. Solution Overview & Core User Flow  [HUMAN-FILL]
<!--
2-4 sentence summary, PLUS a literal step-by-step flow:
  1. User does ___
  2. System does ___
  3. User sees/gets ___
-->

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
*Candidate from code complexity: the pluggable multi-provider AI service with a consistent interface (`backend/src/ai/interface/ai.interface.ts`) and the full peer-to-peer personal-book lending lifecycle with settings, notifications, and status transitions.*

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
