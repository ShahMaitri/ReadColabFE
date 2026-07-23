#!/usr/bin/env node

const baseUrl = process.env.API_BASE_URL || 'http://127.0.0.1:4000/api/v1';
const adminEmail = process.env.SMOKE_ADMIN_EMAIL;
const adminPassword = process.env.SMOKE_ADMIN_PASSWORD;
const userEmail = process.env.SMOKE_USER_EMAIL;
const userPassword = process.env.SMOKE_USER_PASSWORD;

if (!adminEmail || !adminPassword || !userEmail || !userPassword) {
  console.error('Missing required environment variables.');
  console.error('Required: SMOKE_ADMIN_EMAIL, SMOKE_ADMIN_PASSWORD, SMOKE_USER_EMAIL, SMOKE_USER_PASSWORD');
  process.exit(1);
}

const asJson = async (response) => {
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.success === false) {
    const message = body.message || `HTTP ${response.status}`;
    throw new Error(message);
  }
  return body;
};

const request = async (path, options = {}, token) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  return asJson(response);
};

const login = async (email, password) => {
  const payload = await request('/auth/login', {
    method: 'POST',
    body: { email, password }
  });

  return {
    token: payload.data.accessToken,
    user: payload.data.user
  };
};

const listBooks = async () => {
  const payload = await request('/books?limit=100&page=1');
  return payload.data?.data || [];
};

const createBook = async (adminToken, suffix, quantity = 2) => {
  const now = Date.now();
  const payload = await request(
    '/books',
    {
      method: 'POST',
      body: {
        title: `Smoke Test ${suffix} ${now}`,
        author: 'Automation',
        category: 'Testing',
        quantity
      }
    },
    adminToken
  );

  return payload.data;
};

const ensureBooks = async (adminToken) => {
  const books = await listBooks();

  let borrowBook = books.find((book) => (book.availableQuantity || 0) > 0 && book.status === 'AVAILABLE');
  if (!borrowBook) {
    borrowBook = await createBook(adminToken, 'Borrowable', 2);
  }

  let reservationBook = books.find(
    (book) => book.id !== borrowBook.id && (book.availableQuantity || 0) > 0 && book.status === 'AVAILABLE'
  );

  if (!reservationBook) {
    reservationBook = await createBook(adminToken, 'Reservable', 1);
  }

  return { borrowBook, reservationBook };
};

const run = async () => {
  console.log('Notification smoke flow started');
  console.log(`Base URL: ${baseUrl}`);

  const adminSession = await login(adminEmail, adminPassword);
  const userSession = await login(userEmail, userPassword);

  console.log(`Admin: ${adminSession.user.email}`);
  console.log(`User: ${userSession.user.email}`);

  const { borrowBook, reservationBook } = await ensureBooks(adminSession.token);
  console.log(`Borrow book: ${borrowBook.title} (${borrowBook.id})`);
  console.log(`Reservation book: ${reservationBook.title} (${reservationBook.id})`);

  const beforeUnread = await request('/notifications/unread-count', {}, userSession.token);
  const unreadBefore = beforeUnread.data.unreadCount;
  console.log(`Unread before flow: ${unreadBefore}`);

  // Borrow flow: request -> approve -> confirm -> return
  await request(
    '/borrow',
    {
      method: 'POST',
      body: { bookId: borrowBook.id }
    },
    userSession.token
  );
  console.log('Borrow requested by user');

  const pendingBorrows = await request('/admin/borrows?status=PENDING&page=1&limit=100', {}, adminSession.token);
  const borrowRecord = (pendingBorrows.data || []).find(
    (item) => item.userId === userSession.user.id && item.bookId === borrowBook.id
  );

  if (!borrowRecord) {
    throw new Error('Pending borrow request not found for smoke flow');
  }

  const approvedBorrow = await request(
    `/admin/borrows/${borrowRecord.id}/approve`,
    { method: 'POST' },
    adminSession.token
  );
  console.log('Borrow approved by admin');

  await request(`/borrow/${approvedBorrow.data.id}/confirm`, { method: 'PATCH' }, userSession.token);
  console.log('Borrow confirmed by user');

  await request(`/borrow/${approvedBorrow.data.id}/return`, { method: 'PATCH' }, userSession.token);
  console.log('Borrow returned by user');

  // Reservation flow: make book unavailable -> reserve -> mark ready
  await request(
    `/admin/books/${reservationBook.id}`,
    {
      method: 'PATCH',
      body: {
        availableQuantity: 0,
        quantity: Math.max(1, reservationBook.quantity || 1)
      }
    },
    adminSession.token
  );
  console.log('Reservation target book set unavailable by admin');

  await request(
    '/reservation',
    {
      method: 'POST',
      body: { bookId: reservationBook.id }
    },
    userSession.token
  );
  console.log('Reservation created by user');

  const pendingReservations = await request('/admin/reservations?status=PENDING&page=1&limit=100', {}, adminSession.token);
  const reservationRecord = (pendingReservations.data || []).find(
    (item) => item.userId === userSession.user.id && item.bookId === reservationBook.id
  );

  if (!reservationRecord) {
    throw new Error('Pending reservation not found for smoke flow');
  }

  await request(
    `/admin/reservations/${reservationRecord.id}/ready`,
    { method: 'POST' },
    adminSession.token
  );
  console.log('Reservation marked ready by admin');

  const afterUnread = await request('/notifications/unread-count', {}, userSession.token);
  const unreadAfter = afterUnread.data.unreadCount;

  const latestNotifications = await request('/notifications?page=1&limit=20', {}, userSession.token);
  const types = (latestNotifications.data || []).map((item) => item.type);

  console.log('--- Verification ---');
  console.log(`Unread after flow: ${unreadAfter}`);
  console.log(`Unread delta: ${unreadAfter - unreadBefore}`);
  console.log(`Latest notification types: ${types.join(', ')}`);

  const requiredTypes = ['BORROW_APPROVED', 'BOOK_RETURNED', 'RESERVATION_READY'];
  const missing = requiredTypes.filter((type) => !types.includes(type));

  if (missing.length > 0) {
    throw new Error(`Missing expected notifications: ${missing.join(', ')}`);
  }

  console.log('Smoke flow passed.');
  console.log('Next: Login as user in frontend and confirm bell badge + drawer entries update.');
};

run().catch((error) => {
  console.error(`Smoke flow failed: ${error.message}`);
  process.exit(1);
});
