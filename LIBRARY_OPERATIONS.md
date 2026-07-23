# Library Operations Module - Complete Implementation Guide

## Overview

A comprehensive Library Operations system with Book Borrowing and Reservation functionality. Users can borrow available books, reserve unavailable books, track due dates, and view their borrow history. Admins can approve/reject borrow requests and manage the lending process.

---

## Database Schema Updates

### New Models & Enums

#### ReservationStatus Enum
```prisma
enum ReservationStatus {
  PENDING    // Waiting for book availability
  READY      // Book is available for pickup (3-day window)
  CANCELLED  // Reservation cancelled by user or auto-expired
}
```

#### Reservation Model
```prisma
model Reservation {
  id        String              @id @default(cuid())
  userId    String
  bookId    String
  status    ReservationStatus   @default(PENDING)
  position  Int                 @default(0)          // Position in queue
  createdAt DateTime            @default(now())
  updatedAt DateTime            @updatedAt

  user  User  @relation("userReservations", fields: [userId], references: [id], onDelete: Cascade)
  book  Book  @relation("bookReservations", fields: [bookId], references: [id], onDelete: Cascade)

  @@unique([userId, bookId])
  @@index([userId])
  @@index([bookId])
  @@index([status])
}
```

#### Updated User Model
```prisma
model User {
  // ... existing fields ...
  
  borrows      Borrow[]           @relation("userBorrows")
  reservations Reservation[]      @relation("userReservations")
  // ... other relations ...
}
```

#### Updated Book Model
```prisma
model Book {
  // ... existing fields ...
  
  borrows      Borrow[]        @relation("bookBorrows")
  reservations Reservation[]   @relation("bookReservations")
  // ... other relations ...
}
```

---

## Backend Implementation

### 1. Borrow Module

#### BorrowRepository (`src/repositories/borrow.repository.ts`)

**Responsibilities:**
- Database CRUD operations for borrow records
- Query for active/overdue borrows
- Status updates and history tracking

**Key Methods:**
```typescript
// Create
create(data: { userId, bookId, status? }): Promise<Borrow>

// Read
findById(id: string): Promise<Borrow | null>
findActiveByUserId(userId: string): Promise<Borrow[]>
findAllByUserId(userId, skip, take): Promise<{ data, total }>
findPending(skip, take): Promise<{ data, total }>
findOverdue(): Promise<Borrow[]>

// Update
updateStatus(id: string, status: BorrowStatus, data?: { borrowDate, dueDate, returnDate }): Promise<Borrow>

// Query
findActiveBorrowByUserAndBook(userId, bookId): Promise<Borrow | null>
countByStatus(): Promise<Record<string, number>>

// Delete
delete(id: string): Promise<Borrow>
```

#### BorrowService (`src/borrow/service.ts`)

**Responsibilities:**
- Core business logic for borrow operations
- Validation and error handling
- Book availability management
- Due date calculation

**Key Methods:**

```typescript
// Request & Approval
requestBorrow(userId: string, bookId: string): Promise<Borrow>
  // Validates: book exists, user not already borrowing, book available
  // Creates PENDING borrow request

approveBorrow(borrowId: string): Promise<Borrow>
  // Admin: approves PENDING request
  // Sets borrowDate + dueDate (14 days)
  // Updates status to APPROVED

rejectBorrow(borrowId: string): Promise<Borrow>
  // Admin: rejects PENDING request

confirmBorrow(borrowId: string): Promise<Borrow>
  // User: picks up book
  // Transitions: APPROVED → BORROWED
  // Decrements book.availableQuantity

// Return & History
returnBook(borrowId: string): Promise<Borrow>
  // User: returns book
  // Increments book.availableQuantity
  // Sets returnDate + status RETURNED

getActiveBorrows(userId: string): Promise<Borrow[]>
  // Returns APPROVED and BORROWED records

getBorrowHistory(userId, page, limit): Promise<PaginatedResult>
  // Full history with pagination

getPendingRequests(page, limit): Promise<PaginatedResult>
  // Admin: all pending requests

updateOverdueBorrows(): Promise<number>
  // Cron job: updates BORROWED with dueDate < now to OVERDUE
  // Returns count updated

getStatistics(): Promise<{ active, pending, overdue, returned, rejected }>
  // Admin dashboard statistics
```

**Constants:**
```typescript
BORROW_DURATION_DAYS = 14  // 2 weeks
```

#### BorrowController (`src/borrow/controller.ts`)

**Endpoints:**

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/borrow` | User | Request to borrow a book |
| GET | `/borrow/active` | User | Get current borrows |
| GET | `/borrow/history` | User | Get borrow history (paginated) |
| PATCH | `/borrow/:id/confirm` | User | Confirm pickup (APPROVED→BORROWED) |
| PATCH | `/borrow/:id/return` | User | Return book (BORROWED→RETURNED) |
| GET | `/borrow/pending` | Admin | Get pending requests (paginated) |
| PATCH | `/borrow/:id/approve` | Admin | Approve request (PENDING→APPROVED) |
| PATCH | `/borrow/:id/reject` | Admin | Reject request (PENDING→REJECTED) |
| GET | `/borrow/statistics` | Admin | Borrow statistics |

### 2. Reservation Module

#### ReservationRepository (`src/repositories/reservation.repository.ts`)

**Responsibilities:**
- Manage reservation queue for books
- Position tracking in queue
- Status transitions

**Key Methods:**
```typescript
// Create & Read
create(data: { userId, bookId }): Promise<Reservation>
  // Auto-calculates position based on existing PENDING

findById(id: string): Promise<Reservation | null>
findByUserId(userId: string): Promise<Reservation[]>
findQueueByBookId(bookId: string): Promise<Reservation[]>
  // Queue ordered by position

findByUserAndBook(userId, bookId): Promise<Reservation | null>
  // Unique constraint lookup

getNextInQueue(bookId: string): Promise<Reservation | null>
  // First pending reservation

findReadyByUserId(userId: string): Promise<Reservation[]>
  // All READY reservations

// Update
updateStatus(id: string, status: ReservationStatus): Promise<Reservation>

// Queue Management
cancel(id: string): Promise<Reservation>
  // Delete + recalculate positions for remaining

recalculatePositions(bookId: string): Promise<void>
  // Reorder queue by createdAt

// Delete
delete(id: string): Promise<Reservation>
```

#### ReservationService (`src/reservation/service.ts`)

**Responsibilities:**
- Reservation workflow
- Queue management
- Ready status handling

**Key Methods:**

```typescript
// Reservation Workflow
requestReservation(userId, bookId): Promise<Reservation>
  // Validate: book not available, no existing reservation
  // Creates PENDING with auto-calculated position

cancelReservation(reservationId, userId): Promise<Reservation>
  // User/Admin: cancel reservation
  // Recalculates queue positions

markAsReady(reservationId): Promise<Reservation>
  // PENDING → READY (when book returned)

fulfillReservation(reservationId): Promise<Reservation>
  // Delete READY reservation (converted to borrow)

// Queue Operations
getUserReservations(userId): Promise<Reservation[]>
getReservationQueue(bookId): Promise<Reservation[]>
getNextInQueue(bookId): Promise<Reservation | null>

processNextReservation(bookId): Promise<Reservation | null>
  // Called when book returned
  // Marks next pending as READY

getReadyReservations(userId): Promise<Reservation[]>
  // All reservations ready for pickup

// Expiration
cancelExpiredReady(): Promise<number>
  // Cron job: remove READY older than 3 days
  // Recalculates positions
```

#### ReservationController (`src/reservation/controller.ts`)

**Endpoints:**

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/reservation` | User | Reserve a book |
| GET | `/reservation` | User | Get user's reservations |
| DELETE | `/reservation/:id` | User | Cancel reservation |
| GET | `/reservation/ready` | User | Get ready reservations |
| GET | `/reservation/queue/:bookId` | Public | Get reservation queue |

#### ReservationValidation (`src/reservation/validation.ts`)

```typescript
reserveBookSchema = z.object({
  bookId: z.string().cuid()
})

cancelReservationSchema = z.object({
  reservationId: z.string().cuid()
})
```

---

## Frontend Implementation

### 1. Custom Hooks (`src/hooks/useBorrowReservation.ts`)

#### Type Definitions

```typescript
interface BorrowData {
  id: string
  userId: string
  bookId: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'BORROWED' | 'RETURNED' | 'OVERDUE'
  borrowDate?: string
  dueDate?: string
  returnDate?: string
  createdAt: string
  updatedAt: string
  book?: { id, title, author, cover? }
  user?: { id, name, email }
}

interface ReservationData {
  id: string
  userId: string
  bookId: string
  status: 'PENDING' | 'READY' | 'CANCELLED'
  position: number
  createdAt: string
  updatedAt: string
  book?: { id, title, author, cover? }
  user?: { id, name, email }
}

interface BorrowHistoryResponse {
  data: BorrowData[]
  total: number
  page: number
  limit: number
  pages: number
}
```

#### Query Keys Factory

```typescript
borrowKeys = {
  all: ['borrow'],
  active: () => [...borrowKeys.all, 'active'],
  history: () => [...borrowKeys.all, 'history'],
  historyDetail: (page, limit) => [...borrowKeys.history(), { page, limit }]
}

reservationKeys = {
  all: ['reservation'],
  user: () => [...reservationKeys.all, 'user'],
  ready: () => [...reservationKeys.all, 'ready'],
  queue: () => [...reservationKeys.all, 'queue'],
  queueDetail: (bookId) => [...reservationKeys.queue(), bookId]
}
```

#### Query Hooks

```typescript
useActiveBorrows(): UseQueryResult<BorrowData[]>
  // Fetch user's APPROVED/BORROWED books
  // Stale: 5 minutes

useBorrowHistory(page, limit): UseQueryResult<BorrowHistoryResponse>
  // Paginated history
  // Stale: 5 minutes

useReadyReservations(): UseQueryResult<ReservationData[]>
  // User's READY reservations
  // Stale: 5 minutes

useUserReservations(): UseQueryResult<ReservationData[]>
  // All user reservations
  // Stale: 5 minutes

useReservationQueue(bookId): UseQueryResult<ReservationData[]>
  // Public: queue for specific book
  // Enabled only if bookId provided
  // Stale: 2 minutes
```

#### Mutation Hooks

```typescript
useRequestBorrow(): UseMutationResult
  // POST /borrow
  // Invalidates: borrowKeys.active()

useConfirmBorrow(): UseMutationResult
  // PATCH /borrow/:id/confirm
  // Invalidates: borrowKeys.active(), borrowKeys.history()

useReturnBook(): UseMutationResult
  // PATCH /borrow/:id/return
  // Invalidates: borrowKeys.active(), borrowKeys.history()

useReserveBook(): UseMutationResult
  // POST /reservation
  // Invalidates: reservationKeys.user()

useCancelReservation(): UseMutationResult
  // DELETE /reservation/:id
  // Invalidates: reservationKeys.user()
```

### 2. Notification Context (`src/context/NotificationContext.tsx`)

**Features:**
- Global snackbar notifications
- Success/error/warning/info severity
- Auto-dismiss after 6 seconds
- Manual dismiss available

**Usage:**
```typescript
const { showNotification } = useNotification();

// Show notification
showNotification('Book borrowed successfully!', 'success');
showNotification('Book not available', 'error');
```

### 3. Pages

#### MyBooksPage (`src/pages/MyBooksPage.tsx`)

**Features:**
- Material UI Table showing current borrows
- Status badges: Borrowed, Ready to Pick Up, Pending Approval, Overdue
- Due date with color-coded days remaining
- "Pick Up" button (APPROVED status)
- "Return" button (BORROWED status)
- Confirmation dialog before action
- Loading and error states

**Columns:**
- Book Title (clickable)
- Author
- Status (chip)
- Due Date (with days remaining)
- Actions (buttons)

**Status Colors:**
- Green: BORROWED
- Blue: APPROVED (Ready to Pick Up)
- Yellow: PENDING (Waiting for approval)
- Red: OVERDUE

#### BorrowHistoryPage (`src/pages/BorrowHistoryPage.tsx`)

**Features:**
- Full borrow history with pagination
- Table with sorting by status/date
- Status badges for all states
- Configurable page size (5/10/25/50)
- Date formatting

**Columns:**
- Book Title
- Author
- Status (chip)
- Borrow Date
- Due Date
- Return Date

### 4. Enhanced BookDetailsPage

**New Features:**
- "Borrow Book" button (if available)
- "Reserve Book" button (if unavailable)
- Smart button logic:
  - Show Borrow if availableQuantity > 0
  - Disable if user already has active borrow
  - Show Reserve if no stock available
- Success notifications
- Error message display

### 5. Updated Sidebar Navigation

**New Links:**
- My Books → `/my-books`
- Borrow History → `/borrow-history`

**Icons:**
- LocalLibrary icon for My Books
- History icon for Borrow History

### 6. Updated AppRouter

**New Routes:**
```
/my-books         → MyBooksPage (protected)
/borrow-history   → BorrowHistoryPage (protected)
```

---

## API Endpoints Summary

### Borrow Endpoints

**User Endpoints:**
```
POST   /api/v1/borrow                    Request borrow
GET    /api/v1/borrow/active             Get active borrows
GET    /api/v1/borrow/history            Get history (paginated)
PATCH  /api/v1/borrow/:id/confirm        Confirm pickup
PATCH  /api/v1/borrow/:id/return         Return book
```

**Admin Endpoints:**
```
GET    /api/v1/borrow/pending            Get pending requests
PATCH  /api/v1/borrow/:id/approve        Approve request
PATCH  /api/v1/borrow/:id/reject         Reject request
GET    /api/v1/borrow/statistics         Get statistics
```

### Reservation Endpoints

**User Endpoints:**
```
POST   /api/v1/reservation               Reserve book
GET    /api/v1/reservation               Get user reservations
DELETE /api/v1/reservation/:id           Cancel reservation
GET    /api/v1/reservation/ready         Get ready reservations
```

**Public Endpoints:**
```
GET    /api/v1/reservation/queue/:bookId Get reservation queue
```

---

## Key Features

### User Features

✅ **Borrow Operations**
- Request to borrow available books
- Receive 14-day borrow period
- Track due dates
- View days remaining (color-coded)
- Return books before due date
- View complete borrow history

✅ **Reservation System**
- Reserve unavailable books
- View position in queue
- Notified when book becomes available (READY status)
- 3-day pickup window
- Cancel reservations

✅ **Status Tracking**
- See current active borrows
- Track all past borrows
- View reservation status

### Admin Features

✅ **Borrow Management**
- View all pending borrow requests
- Approve/reject requests
- Monitor overdue books
- View borrow statistics
- Automated overdue detection

✅ **Reservation Management**
- View reservation queues
- Auto-expire old ready reservations
- Queue position tracking

---

## Business Rules

### Borrow Rules
1. Users can only borrow available books
2. Users cannot have multiple active borrows of same book
3. Borrow duration: 14 days
4. Overdue books status automatically updated
5. Book availability decremented on confirmation
6. Book availability incremented on return

### Reservation Rules
1. Can only reserve unavailable books
2. One reservation per user per book
3. READY status lasts 3 days, then auto-cancelled
4. Position in queue recalculated after cancellations
5. First in queue gets priority when book returns

---

## Cron Jobs Required

### Job 1: Update Overdue Borrows
```
Schedule: Daily (e.g., midnight)
Action: Call BorrowService.updateOverdueBorrows()
```

### Job 2: Cancel Expired Ready Reservations
```
Schedule: Daily (e.g., early morning)
Action: Call ReservationService.cancelExpiredReady()
```

---

## Error Handling

### HTTP Status Codes

- **201**: Successfully created (borrow/reservation)
- **200**: Success (GET, PATCH, DELETE)
- **400**: Bad request, book unavailable, already borrowed
- **401**: Unauthorized, not authenticated
- **403**: Forbidden, insufficient permissions
- **404**: Not found (borrow/book/reservation)
- **409**: Conflict (duplicate reservation/active borrow)
- **500**: Server error

### User-Friendly Messages

```typescript
// Borrow Errors
"Book not found"
"You already have an active borrow request for this book"
"Book is currently not available. Please try to reserve it instead."
"Cannot approve borrow with status: X"
"Book must be approved before confirmation"
"Book must be borrowed to return"

// Reservation Errors
"Book not found"
"You already have a reservation for this book"
"Book is currently available for borrowing. No need to reserve."
"Reservation not found"
"Reservation must be pending"
"Unauthorized to cancel this reservation"
```

---

## Performance Considerations

✅ **Database Indexes**
- User ID on Borrow/Reservation
- Book ID on Borrow/Reservation
- Status fields for filtering
- Unique constraints prevent duplicates

✅ **Query Optimization**
- Include related book/user data in queries
- Pagination for history
- Avoid N+1 queries

✅ **Frontend Caching**
- Active borrows: 5 min stale time
- History: 5 min stale time
- Reservation queue: 2 min stale time

---

## Testing Recommendations

### Backend Testing

```bash
# Test borrow request
curl -X POST http://localhost:5000/api/v1/borrow \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "bookId": "<bookId>" }'

# Test borrow confirmation
curl -X PATCH http://localhost:5000/api/v1/borrow/<borrowId>/confirm \
  -H "Authorization: Bearer <token>"

# Test return
curl -X PATCH http://localhost:5000/api/v1/borrow/<borrowId>/return \
  -H "Authorization: Bearer <token>"

# Test reserve
curl -X POST http://localhost:5000/api/v1/reservation \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "bookId": "<bookId>" }'
```

### Frontend Testing

1. **Borrow Workflow**
   - Click Borrow on available book
   - Verify success notification
   - Check My Books page shows PENDING status
   - Admin approves request
   - User's status changes to APPROVED
   - User clicks "Pick Up"
   - Status becomes BORROWED
   - Days remaining displayed correctly

2. **Return Workflow**
   - Click Return on BORROWED book
   - Verify success notification
   - Book moved to history
   - Book availability incremented

3. **Reservation Workflow**
   - Try to reserve available book (should fail)
   - Reserve unavailable book (should succeed)
   - Check position in queue
   - Verify READY notification when available
   - Check 3-day pickup window

---

## Future Enhancements

- Loan renewal (extend due date)
- Late fee calculation
- Book recommendations based on borrow history
- Waitlist notifications via email
- Analytics: most borrowed books, avg borrow duration
- Rating/review integration with borrow history
- Reading goals tracking
- Digital versions support

