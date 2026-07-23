# SPECIFICATIONS.md

# Smart Office Library – AI Agent Guidelines

## Project Overview

Smart Office Library is an AI-powered internal web application that enables employees to discover, borrow, reserve, review, and manage physical books available within an organization's office library.

The application consists of:

- React + TypeScript frontend
- Node.js + Express + TypeScript backend
- PostgreSQL database
- AI services through GitHub Models API (preferred)
- Internal office deployment (no Docker)

This document defines the standards, architecture, responsibilities, and development guidelines for AI agents contributing to this repository.

---

# Tech Stack

## Frontend

- React
- TypeScript
- Vite
- Material UI
- React Router
- TanStack Query
- Axios
- React Hook Form
- Zod

---

## Backend

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- JWT Authentication
- Multer
- QRCode
- node-cron
- Winston/Pino Logging

---

## Database

- PostgreSQL

---

## AI Layer

Primary Provider

- GitHub Models API

Future Supported Providers

- OpenAI
- Azure OpenAI
- Google Gemini
- Anthropic Claude
- Ollama

The application must never directly call AI providers outside the AI Service layer.

---

# Development Environment

Development is performed without Docker.

Services run independently.

Frontend

http://localhost:5173

Backend

http://localhost:5000

Database

localhost:5432

---

# Repository Structure

```
root/

frontend/
backend/
database/
docs/
README.md
AGENTS.md
```

Backend

```
backend/src/

auth/
users/
books/
borrow/
wishlist/
reviews/
notifications/
analytics/
ai/
middleware/
config/
utils/
routes/
controllers/
services/
```

Frontend

```
frontend/src/

components/
pages/
layouts/
hooks/
services/
api/
context/
utils/
assets/
types/
```

---

# Coding Principles

All generated code should follow these principles.

- SOLID Principles
- DRY
- KISS
- Clean Architecture
- Feature-based folder structure
- Dependency Injection where appropriate
- Async/Await only
- Strong typing
- Modular design

Avoid

- Business logic inside routes
- SQL queries inside controllers
- Large utility files
- Circular dependencies

---

# AI Service Architecture

Never call GitHub Models API directly from controllers.

Instead use

```
Controller
↓

Service
↓

AIService
↓

GitHub Models API
```

Example

```
BooksController

↓

RecommendationService

↓

AIService.recommendBooks()

↓

GitHub Models API
```

Future providers should only require changing AIService implementation.

---

# AI Responsibilities

AI should provide

- Smart Search
- Book Recommendation
- Book Summaries
- Book Comparison
- Reading Plans
- Review Summarization
- AI Chat Assistant

AI should never

- Modify database directly
- Bypass authorization
- Execute arbitrary code
- Generate SQL

---

# Authentication

Use JWT authentication.

Roles

Employee

Admin

Super Admin

Protect every API using middleware.

Authorization should always be role-based.

---

# API Standards

RESTful APIs only.

Examples

GET

/books

/books/:id

POST

/books

/borrow

/reserve

PUT

/books/:id

PATCH

/borrow/:id/return

DELETE

/books/:id

Responses should always use

```
{
    success: boolean,
    message: string,
    data: object | array | null
}
```

Errors should always return

```
{
    success: false,
    message: "...",
    errors: [...]
}
```

---

# Database Rules

Use Prisma ORM.

Never

- Write raw SQL unless absolutely necessary.
- Duplicate tables.
- Store derived data unnecessarily.

Every table must include

- id
- createdAt
- updatedAt

Use foreign keys appropriately.

---

# Validation

Every request must be validated.

Use Zod.

Never trust client input.

Validate

- Request body
- Params
- Query strings

---

# Logging

Log

- Authentication failures
- Borrow requests
- Returns
- Reservation approvals
- AI requests
- System errors

Do not log

- Passwords
- JWT secrets
- Tokens
- API keys

---

# Security

Never expose

- API Keys
- GitHub Tokens
- Database passwords

Use environment variables.

Example

```
PORT=

DATABASE_URL=

JWT_SECRET=

GITHUB_MODELS_ENDPOINT=

GITHUB_TOKEN=
```

Never hardcode secrets.

---

# File Uploads

Allowed

Book cover images

Maximum size

5 MB

Validate

- MIME Type
- Extension
- Size

---

# QR Code Rules

Every book receives a unique QR Code.

Scanning should open

```
Book Details Page
```

Never regenerate QR unless explicitly requested.

---

# Notifications

Support

- Due Date Reminder
- Reservation Available
- New Book Added
- Borrow Approved
- Return Confirmation

Use scheduled jobs.

---

# Employee Features

AI Agents may implement

- Dashboard
- Search
- Borrow
- Return
- Reserve
- Wishlist
- Ratings
- Reviews
- Reading History
- Recommendations

---

# Admin Features

AI Agents may implement

- Book CRUD
- User Management
- Borrow Management
- Reports
- Analytics
- QR Generation
- Notifications

---

# UI Guidelines

Use Material UI.

Requirements

- Responsive
- Accessible
- Mobile Friendly
- Dark Mode Ready

Avoid inline styles.

Use reusable components.

---

# Naming Conventions

Variables

camelCase

Functions

camelCase

Components

PascalCase

Interfaces

IUser

IBook

Enums

UserRole

BorrowStatus

Files

book.service.ts

book.controller.ts

book.routes.ts

---

# Git Commit Convention

Use Conventional Commits.

Examples

```
feat: add AI recommendation endpoint

fix: resolve borrow validation bug

refactor: move AI logic into service

docs: update AGENTS.md

test: add borrow service tests
```

---

# Testing

Backend

- Unit Tests
- Integration Tests

Frontend

- Component Tests
- API Tests

Test business logic.

Avoid testing implementation details.

---

# Performance

Use

- Pagination
- Lazy Loading
- Query Caching
- IndexedDB for offline support

Avoid

- N+1 queries
- Unnecessary AI calls
- Duplicate database requests

---

# Future Expansion

Architecture should support

- RFID
- Barcode
- Slack Integration
- Microsoft Teams
- Email Notifications
- Multi-office libraries
- Digital books
- Knowledge Portal

No breaking changes should be required.

---

# AI Agent Expectations

When generating code:

- Prefer readability over cleverness.
- Follow existing project structure.
- Keep functions focused on a single responsibility.
- Write reusable modules.
- Add comments only where the intent is not obvious.
- Avoid introducing unnecessary dependencies.
- Ensure all code passes TypeScript strict mode.
- Consider scalability and maintainability in every implementation.
- While adding new code make sure existing is not breaking, it's an improvement.

The goal is to build a secure, maintainable, AI-enabled office library platform that can evolve without requiring major architectural changes.