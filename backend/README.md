# Smart Office Library Backend

Production-ready backend boilerplate using:
- Node.js + Express + TypeScript
- Prisma ORM + PostgreSQL
- JWT + bcrypt
- Multer
- Winston + Morgan
- Zod validation
- dotenv configuration
- node-cron scheduler

## Quick start

1. Install dependencies:
   npm install
2. Copy environment file:
   cp .env.example .env
3. Generate Prisma client:
   npm run prisma:generate
4. Run in development:
   npm run dev

## API

- Base URL prefix: `/api`
- Version: `/v1`
- Health check: `GET /api/v1/health`

## Notification Smoke Flow (Admin + User)

Use this quick flow to verify notification triggers for:
- Borrow Approved
- Book Returned
- Reservation Ready

Prerequisites:
- Backend server is running.
- You have one admin account and one employee account.

Run:

```bash
cd backend
SMOKE_ADMIN_EMAIL=admin@example.com \
SMOKE_ADMIN_PASSWORD=admin-password \
SMOKE_USER_EMAIL=user@example.com \
SMOKE_USER_PASSWORD=user-password \
npm run test:notifications:smoke
```

What the script does:
- Logs in admin and user.
- Creates or reuses books.
- User requests borrow.
- Admin approves borrow.
- User confirms and returns book.
- User creates reservation on an unavailable book.
- Admin marks reservation as ready.
- Verifies notifications and unread count via `/notifications` endpoints.

Frontend verification:
- Login as the same user in frontend.
- Open the bell icon in navbar.
- Confirm unread badge count increased.
- Confirm drawer shows BORROW_APPROVED, BOOK_RETURNED, and RESERVATION_READY notifications.

## Notification Integration Test (Offline-Only)

This test validates both service and controller paths and confirms notifications remain in-app (offline):
- Service path: `/borrow/:id/approve`, `/borrow/:id/return`
- Controller path: `/admin/reservations/:id/ready`
- Notification controller path: list, unread count, mark read, mark all read

Run:

```bash
cd backend
SMOKE_ADMIN_EMAIL=admin@example.com \
SMOKE_ADMIN_PASSWORD=admin-password \
SMOKE_USER_EMAIL=user@example.com \
SMOKE_USER_PASSWORD=user-password \
npm run test:notifications:integration
```

Assertions include:
- BORROW_APPROVED, BOOK_RETURNED, RESERVATION_READY generated for the current run.
- `channel` is `IN_APP` and `deliveryStatus` is `PENDING`.
- Unread count changes correctly after `mark read` and `read all` endpoints.
