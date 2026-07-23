# Book Module - Complete Implementation Guide

## Overview
A fully-featured book management system with CRUD operations, file uploads, QR code generation, advanced search and filtering, and pagination. Built with clean architecture separation between API layer and UI components, using TanStack Query for data fetching.

---

## Database Schema

### Book Model
```prisma
model Book {
  id               String     @id @default(cuid())
  title            String     // Book title
  author           String     // Author name
  isbn             String?    @unique
  description      String?    // Book description
  publicationDate  DateTime?  // Publication date
  category         String?    // Book category
  quantity         Int        @default(1)  // Total copies
  availableQuantity Int       @default(1)  // Available copies
  cover            String?    // Cover image URL
  qrCode           String?    @unique      // Generated QR code (Data URL)
  status           BookStatus @default(AVAILABLE)
  addedBy          String?    // User ID who added the book
  createdAt        DateTime   @default(now())
  updatedAt        DateTime   @updatedAt

  addedByUser User?    @relation(fields: [addedBy], references: [id])
  borrows     Borrow[]
  reviews     Review[]
  wishlist    Wishlist[]

  @@index([title])
  @@index([author])
  @@index([category])
  @@index([status])
}

enum BookStatus {
  AVAILABLE
  ARCHIVED
  OUT_OF_STOCK
}
```

---

## Backend Implementation

### 1. Book Repository (`src/repositories/book.repository.ts`)

**Responsibilities:**
- Database operations using Prisma
- Query optimization with indexes
- Pagination and filtering logic
- Data transformation

**Key Methods:**
```typescript
create(data: CreateBookInput): Promise<Book>
findById(id: string): Promise<Book | null>
findAll(pagination, sort, filters): Promise<{ data, total }>
update(id: string, data: UpdateBookInput): Promise<Book>
delete(id: string): Promise<Book>
findByIsbn(isbn: string): Promise<Book | null>
findByQRCode(qrCode: string): Promise<Book | null>
updateQRCode(id: string, qrCode: string): Promise<Book>
updateCover(id: string, coverUrl: string): Promise<Book>
getCategories(): Promise<string[]>
getAvailableCount(id: string): Promise<number>
decrementAvailableQuantity(id: string): Promise<void>
incrementAvailableQuantity(id: string): Promise<void>
```

### 2. Book Service (`src/books/service.ts`)

**Responsibilities:**
- Business logic and validation
- QR code generation
- Error handling
- Service orchestration

**Key Features:**
- Validates input data
- Checks ISBN uniqueness
- Generates QR codes using `qrcode` library
- Search functionality
- Category retrieval

```typescript
createBook(data: CreateBookInput): Promise<Book>
getBook(id: string): Promise<Book>
getBooks(page, limit, search?, category?, sortBy?, sortOrder?): Promise<...>
updateBook(id: string, data: UpdateBookInput): Promise<Book>
deleteBook(id: string): Promise<Book>
uploadCover(id: string, coverPath: string): Promise<Book>
generateQRCode(bookId: string): Promise<string>  // Returns Data URL
getCategories(): Promise<string[]>
searchBooks(query: string, limit?: number): Promise<Book[]>
```

### 3. Book Controller (`src/books/controller.ts`)

**Endpoints:**

**Create Book**
```
POST /api/v1/books
Auth: Required (Admin)
Body: {
  title: string,
  author: string,
  isbn?: string,
  description?: string,
  publicationDate?: datetime,
  category?: string,
  quantity?: number
}
Response: { success, message, data: Book }
```

**Get Books (Paginated)**
```
GET /api/v1/books?page=1&limit=10&search=query&category=cat&sortBy=title&sortOrder=desc
Auth: Not Required
Response: { success, message, data: { data[], total, page, limit, pages } }
```

**Get Single Book**
```
GET /api/v1/books/:id
Auth: Not Required
Response: { success, message, data: Book }
```

**Update Book**
```
PATCH /api/v1/books/:id
Auth: Required (Admin)
Body: Partial UpdateBookInput
Response: { success, message, data: Book }
```

**Delete Book**
```
DELETE /api/v1/books/:id
Auth: Required (Admin)
Response: { success, message }
```

**Upload Cover**
```
POST /api/v1/books/:id/cover
Auth: Required (Admin)
Body: multipart/form-data with file
Response: { success, message, data: Book }
```

**Generate QR Code**
```
POST /api/v1/books/:id/qr-code
Auth: Required (Admin)
Response: { success, message, data: { qrCode: DataURL } }
```

**Search Books**
```
GET /api/v1/books/search?q=query&limit=10
Auth: Not Required
Response: { success, message, data: Book[] }
```

**Get Categories**
```
GET /api/v1/books/categories
Auth: Not Required
Response: { success, message, data: string[] }
```

### 4. Validation (`src/books/book.validation.ts`)

Using Zod for type-safe validation:

```typescript
createBookSchema = z.object({
  title: z.string().min(1).max(255),
  author: z.string().min(1).max(255),
  isbn: z.string().optional(),
  description: z.string().max(2000).optional(),
  publicationDate: z.string().datetime().optional(),
  category: z.string().max(100).optional(),
  quantity: z.number().int().min(1).default(1)
})

updateBookSchema = z.object({
  // All fields optional
  title: z.string().min(1).max(255).optional(),
  author: z.string().min(1).max(255).optional(),
  // ... other fields
})

getBooksQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  category: z.string().optional(),
  sortBy: z.enum(['title', 'author', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})
```

### 5. File Upload Configuration

**Multer Configuration (`src/common/upload.ts`):**
- Storage: Disk storage to `/uploads/covers`
- File types: JPEG, PNG, WebP, GIF
- Size limit: 5MB
- Automatic filename generation with timestamp and random suffix

**Static File Serving:**
- Configured in `app.ts`
- Route: `/uploads/*`
- Full URL: `http://localhost:5000/uploads/covers/cover-1234567890-123456789.jpg`

---

## Frontend Implementation

### 1. API Layer (`src/api/book.api.ts`)

**Separation of Concerns:**
- Pure API client without React dependencies
- Type-safe interfaces
- Reusable across multiple components or frameworks
- Error handling at API level

```typescript
interface BookData { /* ... */ }
interface BooksResponse { /* ... */ }

const bookApi = {
  getBooks(page, limit, search?, category?, sortBy?, sortOrder?): Promise<BooksResponse>,
  searchBooks(query, limit?): Promise<BookData[]>,
  getBook(id: string): Promise<BookData>,
  createBook(data): Promise<BookData>,
  updateBook(id, data): Promise<BookData>,
  deleteBook(id: string): Promise<void>,
  uploadCover(id, file): Promise<BookData>,
  generateQRCode(id): Promise<{ qrCode: string }>,
  getCategories(): Promise<string[]>
}
```

### 2. TanStack Query Hooks (`src/hooks/useBooks.ts`)

**Query Keys Factory Pattern:**
```typescript
export const bookKeys = {
  all: ['books'],
  lists: () => [...bookKeys.all, 'list'],
  list: (filters) => [...bookKeys.lists(), { ...filters }],
  details: () => [...bookKeys.all, 'detail'],
  detail: (id) => [...bookKeys.details(), id],
  search: () => [...bookKeys.all, 'search'],
  categories: () => [...bookKeys.all, 'categories']
}
```

**Custom Hooks:**

```typescript
// Query Hooks
useBooks(page, limit, search?, category?, sortBy?, sortOrder?): UseQueryResult<BooksResponse>
useBook(id): UseQueryResult<BookData>
useSearchBooks(query, limit?): UseQueryResult<BookData[]>
useCategories(): UseQueryResult<string[]>

// Mutation Hooks
useCreateBook(): UseMutationResult<BookData, Error, CreateBookPayload>
useUpdateBook(): UseMutationResult<BookData, Error, { id, data }>
useDeleteBook(): UseMutationResult<void, Error, string>
useUploadCover(): UseMutationResult<BookData, Error, { id, file }>
useGenerateQRCode(): UseMutationResult<{ qrCode }, Error, string>
```

**Features:**
- Automatic cache invalidation on mutations
- Stale time configuration (5 minutes for books, 30 minutes for categories)
- Optimistic updates
- Error handling
- Loading states
- Query enabling based on conditions

### 3. Pages

#### BooksPage (`src/pages/BooksPage.tsx`)

**Features:**
- Material UI Table with pagination
- Search by title, author, or description
- Category filtering (dynamic categories from API)
- Sorting by title, author, or date added
- Sort order toggle (ascending/descending)
- Status display with color chips
  - Green for AVAILABLE
  - Red for OUT_OF_STOCK
  - Gray for ARCHIVED
- Admin-only Edit/Delete buttons
- Add Book button for admins
- Loading and error states
- Responsive design
- Click title to view details

**Props:** None (uses hooks for data)

**State Management:**
- Controlled filters (search, category)
- Pagination state
- Sorting state

#### CreateEditBookPage (`src/pages/CreateEditBookPage.tsx`)

**Features:**
- Create new book form
- Edit existing book form
- Form validation with React Hook Form + Zod
- Category dropdown with existing categories
- Date picker for publication date
- Optional fields: ISBN, description, category, publication date
- Quantity field (disabled in edit mode)
- Loading states during submission
- Navigation back to books list
- Error messages for invalid fields

**Form Fields:**
- Title (required, max 255 chars)
- Author (required, max 255 chars)
- ISBN (optional, unique)
- Description (optional, max 2000 chars)
- Publication Date (optional, datetime)
- Category (optional)
- Quantity (required for creation, disabled for edit)

#### BookDetailsPage (`src/pages/BookDetailsPage.tsx`)

**Features:**
- Book cover image display
- Cover upload for admins (accepts JPEG, PNG, WebP, GIF)
- Book metadata display (ISBN, category, dates)
- Full description
- Quantity information (total and available copies)
- Status badge
- Edit button for admins (redirects to edit form)
- QR code generation and preview
- QR code download functionality
- Responsive layout
- Loading and error states

**Actions:**
- View details by clicking on book title
- Edit book (admin only)
- Upload cover image (admin only)
- Generate and download QR code (admin only)

### 4. Routing (`src/routes/AppRouter.tsx`)

```
/books                    - Books listing page
/books/create             - Create new book page
/books/:id                - Book details page
/books/:id/edit           - Edit book page
```

All book routes are protected (require authentication).

### 5. Navigation (`src/components/navigation/Sidebar.tsx`)

- Main menu: Dashboard, Books
- Admin menu: Add Book (visible only for admins)
- Role-based visibility

---

## Features Summary

### Frontend Features
✅ **Listing Page**
  - Server-side pagination (10, 25, 50 items per page)
  - Full-text search
  - Category filtering
  - Multi-field sorting
  - Status display with color coding
  - Admin action buttons (Edit, Delete)

✅ **Create Book**
  - Form validation with Zod
  - Auto-generated QR code on creation
  - Quantity field

✅ **Edit Book**
  - Update book details
  - Preserve quantity (not editable)
  - All fields optional for partial updates

✅ **View Details**
  - Complete book information
  - Cover image display
  - Cover upload (admin)
  - QR code generation (admin)
  - QR code download
  - Edit link

✅ **Search & Filter**
  - Real-time search
  - Category filtering
  - Dynamic category list from API
  - Sort by title, author, or date
  - Sort order toggle

### Backend Features
✅ **CRUD Operations**
  - Create books with auto-generated QR codes
  - Read with advanced filtering
  - Update partial fields
  - Delete with cascading

✅ **Advanced Query**
  - Pagination support
  - Full-text search on title, author, description
  - Category filtering
  - Status filtering
  - Multi-field sorting

✅ **File Management**
  - Cover image upload (5MB max)
  - Automatic file naming
  - Type validation (JPEG, PNG, WebP, GIF)
  - Static file serving

✅ **QR Code Generation**
  - Automatic QR code generation on book creation
  - Manual QR code regeneration
  - Data URL format for immediate display
  - Direct scanning leads to book details

✅ **Data Integrity**
  - ISBN uniqueness
  - Quantity tracking
  - Cascading deletes
  - Foreign key relationships

---

## Configuration & Setup

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/smart_office_library
CORS_ORIGIN=http://localhost:5173
```

### Create Tables
```bash
cd backend
npx prisma db push
```

### Frontend Environment
- Uses Vite environment variables
- API base URL defaults to `http://localhost:5000/api/v1`

---

## Security

✅ **Authentication**
  - All write operations require authentication

✅ **Authorization**
  - Book creation/update/delete: Admin only
  - File upload: Admin only
  - QR generation: Admin only

✅ **Input Validation**
  - Zod schemas on frontend
  - Zod schemas on backend
  - File type and size validation

✅ **Data Protection**
  - Cascading deletes prevent orphaned data
  - Unique constraints (ISBN, QR code)
  - Foreign key relationships

---

## Error Handling

**Frontend:**
- Display user-friendly error messages
- Loading states during operations
- Network error alerts
- Form validation errors

**Backend:**
- 400: Bad request (validation errors)
- 404: Not found (book doesn't exist)
- 409: Conflict (ISBN/QR code already exists)
- 401: Unauthorized (missing authentication)
- 403: Forbidden (insufficient permissions)
- 500: Server error (with logging)

---

## Performance Optimizations

✅ **Pagination**
  - Server-side pagination
  - Configurable page sizes
  - Reduces data transfer

✅ **Caching**
  - TanStack Query automatic caching
  - Configurable stale time
  - Smart cache invalidation

✅ **Database**
  - Indexes on frequently searched fields
  - Efficient queries with proper joins
  - Connection pooling

✅ **Frontend**
  - Code splitting per route
  - Lazy loading of components
  - Memoization of expensive operations

---

## Testing Recommendations

### Backend
```bash
# Test book creation
curl -X POST http://localhost:5000/api/v1/books \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "isbn": "978-0743273565",
    "category": "Fiction",
    "quantity": 5
  }'

# Test search
curl "http://localhost:5000/api/v1/books?search=gatsby&limit=10"

# Test pagination
curl "http://localhost:5000/api/v1/books?page=1&limit=25"
```

### Frontend
- Test all CRUD operations
- Test search and filters
- Test file upload
- Test QR code generation
- Test pagination
- Test role-based access control
- Test error scenarios

---

## Future Enhancements

- Book ratings and reviews system
- Book recommendations based on user borrowing history
- Advanced analytics (most borrowed books, etc.)
- Export to PDF/CSV
- Batch upload from CSV
- Book series and sequels
- Reading lists and collections
- Integration with ISBN APIs for auto-fill
- Barcode scanning for quick lookup
- Email notifications for due dates

