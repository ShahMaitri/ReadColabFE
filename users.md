# BookHive Users

This document contains test user credentials for the BookHive Smart Office Library application.

## Test Users

### Admin User

| Field | Value |
|-------|-------|
| **Email** | `admin@bookhive.com` |
| **Password** | `Admin@123` |
| **Name** | Admin User |
| **Role** | ADMIN |
| **User ID** | `cmryht8mj000012s3a4qnqa5q` |

**Permissions:**
- Full access to all system features
- User management
- Book management
- Analytics and reporting
- System configuration

---

### Employee User

| Field | Value |
|-------|-------|
| **Email** | `employee@bookhive.com` |
| **Password** | `Employee@123` |
| **Name** | Employee User |
| **Role** | EMPLOYEE |
| **User ID** | `cmryht8n3000112s3nkp387w4` |

**Permissions:**
- Browse and borrow books
- Create personal book collections
- Leave reviews and ratings
- Manage own reservations
- View personal dashboard

---

## Access Instructions

1. Navigate to the login page at `http://localhost:5177/login`
2. Enter the email and password from one of the test users above
3. Click "Login" to access the application

## Environment Details

- **Backend API:** http://localhost:4000
- **Frontend:** http://localhost:5173 (or next available port)
- **Database:** SQLite (dev.db)
- **Environment:** Development

## Security Notes

⚠️ **Warning:** These are test credentials for development purposes only. 

- Do NOT use these credentials in production
- Keep passwords secure and never commit them to version control
- Change credentials before deploying to any staging or production environment

## Seeding

To recreate these users, run:

```bash
cd backend
npx ts-node prisma/seed.ts
```

Or use the npm script (if configured):

```bash
npm run prisma:seed
```

---

**Last Updated:** 2026-07-24
