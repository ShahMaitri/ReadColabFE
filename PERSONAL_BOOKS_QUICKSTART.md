# Personal Book Sharing - Quick Start Guide

## Feature Overview
The Personal Book Sharing module enables colleagues to share books from their personal collections with other team members. Users can browse available books, request to borrow, manage requests, and track borrowed items.

## Access Paths

### Main Pages (Non-Admin Users Only)
1. **Browse Personal Library** → `/personal-library`
   - Search and discover colleagues' books
   - Advanced filtering by author, category, condition, language
   - View owner profiles and book details
   - Submit borrow requests

2. **My Shared Books** → `/personal-library/my-books`
   - Add new books to your personal library
   - Edit or delete existing books
   - View sharing status

3. **Borrowed Books** → `/personal-library/borrowed`
   - Track actively borrowed books
   - Monitor due dates
   - Return books with optional notes

4. **Borrow Requests** → `/personal-library/requests`
   - Review incoming borrow requests (owner view)
   - Approve or reject requests
   - Provide rejection reasons

5. **Library Settings** → `/personal-library/settings`
   - Toggle personal library sharing
   - Configure auto-approve for requests
   - Set maximum concurrent loans
   - Set default borrow duration

## Navigation
Look for **"PERSONAL LIBRARY"** section in the sidebar (below My Reviews) with menu items for all pages.

## Database Models

### PersonalBook
- id (UUID)
- ownerId (User)
- title, author, isbn, publisher
- category, description, condition, language, edition
- location (where owner keeps it)
- visibility (VISIBLE_TO_EVERYONE | VISIBLE_TO_DEPARTMENT | HIDDEN)
- rating (average from reviews)
- createdAt, updatedAt

### BorrowRequest
- id (UUID)
- bookId (PersonalBook)
- requesterId (User requester)
- ownerId (User owner)
- status (PENDING | APPROVED | REJECTED | BORROWED | RETURNED)
- requestDate, approvalDate, borrowDate, dueDate, returnDate
- remarks (rejection or return notes)

### PersonalBookReview
- id (UUID)
- bookId (PersonalBook)
- reviewerId (User)
- type (BOOK | OWNER | BORROW_EXPERIENCE)
- rating (1-5 stars)
- comment
- createdAt

### PersonalBookSettings
- id (UUID)
- userId (User)
- sharingEnabled (boolean)
- autoApproveRequests (boolean)
- maxConcurrentLoans (1-50)
- defaultBorrowDurationDays (1-90)

## API Endpoints

### Books Management
```
POST   /api/v1/personal-books/search       - Search books with filters
POST   /api/v1/personal-books              - Create book
GET    /api/v1/personal-books/:id          - Get book details
PUT    /api/v1/personal-books/:id          - Update book
DELETE /api/v1/personal-books/:id          - Delete book
```

### Borrow Workflow
```
POST   /api/v1/personal-books/:id/requests              - Request book
POST   /api/v1/personal-books/requests/:id/approve      - Approve request
POST   /api/v1/personal-books/requests/:id/reject       - Reject request
POST   /api/v1/personal-books/requests/:id/return       - Mark as returned
```

### Reviews
```
POST   /api/v1/personal-books/reviews      - Submit review
GET    /api/v1/personal-books/:id/reviews  - Get book reviews
```

### Owner & Settings
```
GET    /api/v1/personal-books/:id/owner    - Get owner profile
GET    /api/v1/personal-books/settings     - Get user settings
PUT    /api/v1/personal-books/settings     - Update settings
```

## Common Workflows

### Share a Book
1. Go to "My Shared Books"
2. Click "Add New Book"
3. Fill in: Title, Author, ISBN (optional), Category, Condition
4. Set visibility preference
5. Click "Create"

### Request a Book
1. Go to "Browse Personal Library"
2. Search or filter for book
3. Click on book card
4. Click "Request Book"
5. Wait for owner approval

### Manage Incoming Requests (Owner)
1. Go to "Borrow Requests"
2. Review pending requests
3. Click "Approve" to lend the book
   - Sets default borrow duration automatically
4. Or click "Reject" and provide reason

### Return a Borrowed Book
1. Go to "Borrowed Books"
2. Find the book in the table
3. Click "Return" button
4. Add optional return notes
5. Click "Confirm Return"

## User Settings

### Sharing Enabled
- Toggle to control if your books are visible to others

### Auto-Approve Requests
- When enabled: Requests automatically approved within set duration
- When disabled: You manually review each request

### Max Concurrent Loans
- Limits how many books you can lend at same time
- Range: 1-50 books

### Default Borrow Duration
- Sets initial loan period for new requests
- Range: 1-90 days
- Borrowers can't extend beyond this

## Technical Stack

**Frontend:**
- React 18 with TypeScript (strict mode)
- Material-UI v5+ for components
- React Query (TanStack Query) for state management
- Axios for HTTP requests
- Vite for build tool

**Backend:**
- Node.js with Express
- TypeScript
- Prisma ORM
- SQLite (dev) / PostgreSQL (prod)
- JWT authentication

## Code Organization

```
frontend/src/
├── pages/
│   ├── BrowsePersonalBooksPage.tsx
│   ├── MyPersonalBooksPage.tsx
│   ├── MyBorrowedBooksPage.tsx
│   ├── PendingRequestsPage.tsx
│   └── PersonalLibrarySettingsPage.tsx
├── components/personalBooks/
│   ├── PersonalBookCard.tsx
│   ├── RequestDialog.tsx
│   ├── OwnerCard.tsx
│   ├── SettingsPanel.tsx
│   ├── ReviewDialog.tsx
│   └── BadgeComponents.tsx
├── hooks/
│   └── usePersonalBooks.ts (20+ custom hooks)
├── api/
│   └── personalBook.api.ts (HTTP client & types)
└── routes/
    └── AppRouter.tsx (with personal library routes)
```

## Features Highlights

✅ **Search & Browse**
- Full-text search by title, author, ISBN
- Multiple filter options: category, condition, language
- Pagination (12 books per page)
- Owner profile view with statistics

✅ **Book Management**
- Create, read, update, delete personal books
- Set visibility (everyone/department/hidden)
- Track book condition
- Store location information

✅ **Request Workflow**
- Request books from colleagues
- Approve/reject with optional remarks
- Automatic notification system
- Track request timeline

✅ **Return Management**
- Track borrowed books with due dates
- Overdue detection with visual alerts
- Return with optional notes
- Days-until-due calculations

✅ **User Preferences**
- Enable/disable personal library
- Auto-approve requests
- Concurrency limits
- Default borrow duration

✅ **Owner Insights**
- View lending statistics
- Success reliability tracking
- Achievement badges
- Member ratings

## Build & Deployment

### Development
```bash
# Install dependencies
cd frontend && npm install
cd ../backend && npm install

# Start development servers
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

### Production Build
```bash
# Build frontend
cd frontend && npm run build

# Build backend (if needed)
cd backend && npm run build

# Output available in:
# frontend/dist/
# backend/dist/
```

### Environment Variables
**Frontend (.env):**
```
VITE_API_URL=http://localhost:3000/api/v1
```

**Backend (.env):**
```
DATABASE_URL=file:./dev.db
JWT_SECRET=your-secret-key
PORT=3000
```

## Troubleshooting

### Routes Not Loading
- Check that routes are registered in AppRouter.tsx
- Verify sidebar menu items match route paths
- Clear browser cache and refresh

### API Errors
- Verify backend is running on correct port
- Check JWT token is being sent in Authorization header
- Verify user has correct permissions (non-admin)

### Type Errors in IDE
- Run `npm install` to update dependencies
- Check TypeScript version matches (5.x)
- Restart TypeScript language server

## Next Steps

1. **Testing:** Run integration tests
2. **Deployment:** Deploy to staging environment
3. **UAT:** Conduct user acceptance testing
4. **Monitoring:** Set up error tracking
5. **Optimization:** Monitor performance metrics

## Support

For issues or questions:
1. Check error messages in browser console
2. Review backend server logs
3. Verify database connection
4. Check authentication token validity

---
**Last Updated:** 2024
**Status:** Ready for Testing
