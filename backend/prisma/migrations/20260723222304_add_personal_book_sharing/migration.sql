-- CreateTable
CREATE TABLE "PersonalBook" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "publisher" TEXT,
    "isbn" TEXT,
    "category" TEXT,
    "description" TEXT,
    "condition" TEXT NOT NULL DEFAULT 'GOOD',
    "language" TEXT NOT NULL DEFAULT 'ENGLISH',
    "edition" TEXT,
    "coverImage" TEXT,
    "location" TEXT,
    "availabilityStatus" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "visibility" TEXT NOT NULL DEFAULT 'VISIBLE_TO_EVERYONE',
    "borrowCount" INTEGER NOT NULL DEFAULT 0,
    "averageRating" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PersonalBook_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PersonalBorrowRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "requestDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedDate" DATETIME,
    "borrowDate" DATETIME,
    "dueDate" DATETIME,
    "returnDate" DATETIME,
    "remarks" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PersonalBorrowRequest_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "PersonalBook" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PersonalBorrowRequest_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PersonalBorrowRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PersonalBookReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "reviewType" TEXT NOT NULL DEFAULT 'BOOK',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PersonalBookReview_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "PersonalBook" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PersonalBookReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PersonalBookSharingSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "sharingEnabled" BOOLEAN NOT NULL DEFAULT true,
    "autoApproveRequests" BOOLEAN NOT NULL DEFAULT false,
    "maxActiveLendingLoans" INTEGER NOT NULL DEFAULT 5,
    "defaultBorrowDuration" INTEGER NOT NULL DEFAULT 14,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PersonalBookSharingSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "PersonalBook_ownerId_idx" ON "PersonalBook"("ownerId");

-- CreateIndex
CREATE INDEX "PersonalBook_title_idx" ON "PersonalBook"("title");

-- CreateIndex
CREATE INDEX "PersonalBook_author_idx" ON "PersonalBook"("author");

-- CreateIndex
CREATE INDEX "PersonalBook_category_idx" ON "PersonalBook"("category");

-- CreateIndex
CREATE INDEX "PersonalBook_availabilityStatus_idx" ON "PersonalBook"("availabilityStatus");

-- CreateIndex
CREATE INDEX "PersonalBook_visibility_idx" ON "PersonalBook"("visibility");

-- CreateIndex
CREATE INDEX "PersonalBorrowRequest_bookId_idx" ON "PersonalBorrowRequest"("bookId");

-- CreateIndex
CREATE INDEX "PersonalBorrowRequest_ownerId_idx" ON "PersonalBorrowRequest"("ownerId");

-- CreateIndex
CREATE INDEX "PersonalBorrowRequest_requesterId_idx" ON "PersonalBorrowRequest"("requesterId");

-- CreateIndex
CREATE INDEX "PersonalBorrowRequest_status_idx" ON "PersonalBorrowRequest"("status");

-- CreateIndex
CREATE UNIQUE INDEX "PersonalBorrowRequest_bookId_requesterId_key" ON "PersonalBorrowRequest"("bookId", "requesterId");

-- CreateIndex
CREATE INDEX "PersonalBookReview_bookId_idx" ON "PersonalBookReview"("bookId");

-- CreateIndex
CREATE INDEX "PersonalBookReview_userId_idx" ON "PersonalBookReview"("userId");

-- CreateIndex
CREATE INDEX "PersonalBookReview_rating_idx" ON "PersonalBookReview"("rating");

-- CreateIndex
CREATE UNIQUE INDEX "PersonalBookReview_bookId_userId_reviewType_key" ON "PersonalBookReview"("bookId", "userId", "reviewType");

-- CreateIndex
CREATE UNIQUE INDEX "PersonalBookSharingSettings_userId_key" ON "PersonalBookSharingSettings"("userId");
