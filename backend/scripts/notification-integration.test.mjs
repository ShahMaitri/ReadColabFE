#!/usr/bin/env node

import assert from 'node:assert/strict';
import test from 'node:test';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const baseUrl = process.env.API_BASE_URL || 'http://127.0.0.1:4000/api/v1';
const adminEmail = process.env.SMOKE_ADMIN_EMAIL;
const adminPassword = process.env.SMOKE_ADMIN_PASSWORD;
const userEmail = process.env.SMOKE_USER_EMAIL;
const userPassword = process.env.SMOKE_USER_PASSWORD;

const requiredEnv = {
  SMOKE_ADMIN_EMAIL: adminEmail,
  SMOKE_ADMIN_PASSWORD: adminPassword,
  SMOKE_USER_EMAIL: userEmail,
  SMOKE_USER_PASSWORD: userPassword
};

const missingEnv = Object.entries(requiredEnv)
  .filter(([, value]) => !value)
  .map(([key]) => key);

const prisma = new PrismaClient();

const requestJson = async (path, options = {}, token) => {
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

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.success === false) {
    throw new Error(`${options.method || 'GET'} ${path} failed: ${payload.message || response.status}`);
  }

  return payload;
};

const login = async (email, password) => {
  const payload = await requestJson('/auth/login', {
    method: 'POST',
    body: { email, password }
  });

  return {
    token: payload.data.accessToken,
    user: payload.data.user
  };
};

const upsertLocalUser = async ({ email, password, name, role }) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      name,
      role
    },
    create: {
      email,
      password: hashedPassword,
      name,
      role
    }
  });
};

const getOrCreateSessions = async () => {
  if (missingEnv.length === 0) {
    const adminSession = await login(adminEmail, adminPassword);
    const userSession = await login(userEmail, userPassword);
    return { adminSession, userSession };
  }

  const runId = Date.now();
  const fallbackAdmin = {
    email: `notif-admin-${runId}@local.test`,
    password: `Admin#${runId}`,
    name: 'Notification Admin',
    role: 'ADMIN'
  };
  const fallbackUser = {
    email: `notif-user-${runId}@local.test`,
    password: `User#${runId}`,
    name: 'Notification User',
    role: 'EMPLOYEE'
  };

  await upsertLocalUser(fallbackAdmin);
  await upsertLocalUser(fallbackUser);

  const adminSession = await login(fallbackAdmin.email, fallbackAdmin.password);
  const userSession = await login(fallbackUser.email, fallbackUser.password);

  return { adminSession, userSession };
};

const createBook = async (adminToken, suffix, quantity = 1, availableQuantity = quantity) => {
  const runId = Date.now();
  const payload = await requestJson(
    '/books',
    {
      method: 'POST',
      body: {
        title: `Notif IT ${suffix} ${runId}`,
        author: 'Integration Test',
        category: 'Testing',
        quantity,
        availableQuantity
      }
    },
    adminToken
  );

  return payload.data;
};

test('offline notification integration: service + controller paths', async () => {
  try {
    const { adminSession, userSession } = await getOrCreateSessions();

  const borrowBook = await createBook(adminSession.token, 'BorrowBook', 2, 2);
  const reservationBook = await createBook(adminSession.token, 'ReservationBook', 1, 1);

  // Prepare reservation target as unavailable.
  await requestJson(
    `/admin/books/${reservationBook.id}`,
    {
      method: 'PATCH',
      body: { availableQuantity: 0 }
    },
    adminSession.token
  );

  const unreadBefore = await requestJson('/notifications/unread-count', {}, userSession.token);
  const unreadBeforeCount = unreadBefore.data.unreadCount;

  // Service path: borrow approve/confirm/return via borrow module services.
  await requestJson(
    '/borrow',
    {
      method: 'POST',
      body: { bookId: borrowBook.id }
    },
    userSession.token
  );

  const pendingServiceBorrows = await requestJson(
    '/borrow/pending?page=1&limit=100',
    {},
    adminSession.token
  );

  const serviceBorrow = (pendingServiceBorrows.data?.data || []).find(
    (item) => item.userId === userSession.user.id && item.bookId === borrowBook.id
  );

  assert.ok(serviceBorrow, 'Expected pending borrow created through service path');

  const approvedServiceBorrow = await requestJson(
    `/borrow/${serviceBorrow.id}/approve`,
    { method: 'PATCH' },
    adminSession.token
  );

  await requestJson(
    `/borrow/${approvedServiceBorrow.data.id}/confirm`,
    { method: 'PATCH' },
    userSession.token
  );

  await requestJson(
    `/borrow/${approvedServiceBorrow.data.id}/return`,
    { method: 'PATCH' },
    userSession.token
  );

  // Controller path: admin reservations endpoint triggers reservation-ready notification.
  await requestJson(
    '/reservation',
    {
      method: 'POST',
      body: { bookId: reservationBook.id }
    },
    userSession.token
  );

  const pendingReservations = await requestJson(
    '/admin/reservations?status=PENDING&page=1&limit=100',
    {},
    adminSession.token
  );

  const controllerReservation = (pendingReservations.data || []).find(
    (item) => item.userId === userSession.user.id && item.bookId === reservationBook.id
  );

  assert.ok(controllerReservation, 'Expected pending reservation for controller path');

  await requestJson(
    `/admin/reservations/${controllerReservation.id}/ready`,
    { method: 'POST' },
    adminSession.token
  );

  // Notification controller checks.
  const notificationList = await requestJson('/notifications?page=1&limit=50', {}, userSession.token);
  const notifications = notificationList.data || [];

  const borrowApproved = notifications.find(
    (n) => n.type === 'BORROW_APPROVED' && n.referenceId === approvedServiceBorrow.data.id
  );
  const bookReturned = notifications.find(
    (n) => n.type === 'BOOK_RETURNED' && n.referenceId === approvedServiceBorrow.data.id
  );
  const reservationReady = notifications.find(
    (n) => n.type === 'RESERVATION_READY' && n.referenceId === controllerReservation.id
  );

  assert.ok(borrowApproved, 'BORROW_APPROVED should be generated via service path');
  assert.ok(bookReturned, 'BOOK_RETURNED should be generated via service path');
  assert.ok(reservationReady, 'RESERVATION_READY should be generated via controller path');

  // Offline-only assertions: all notifications generated as in-app with pending delivery.
  [borrowApproved, bookReturned, reservationReady].forEach((item) => {
    assert.equal(item.channel, 'IN_APP');
    assert.equal(item.deliveryStatus, 'PENDING');
  });

  const unreadAfter = await requestJson('/notifications/unread-count', {}, userSession.token);
  assert.ok(
    unreadAfter.data.unreadCount >= unreadBeforeCount + 3,
    'Unread count should increase by at least 3 for new notifications'
  );

  const targetNotificationId = borrowApproved.id;
  await requestJson(`/notifications/${targetNotificationId}/read`, { method: 'PATCH' }, userSession.token);

  const unreadAfterSingleRead = await requestJson('/notifications/unread-count', {}, userSession.token);
  assert.ok(
    unreadAfterSingleRead.data.unreadCount <= unreadAfter.data.unreadCount - 1,
    'Unread count should decrease after marking one notification as read'
  );

  await requestJson('/notifications/read-all', { method: 'PATCH' }, userSession.token);

    const unreadAfterReadAll = await requestJson('/notifications/unread-count', {}, userSession.token);
    assert.equal(unreadAfterReadAll.data.unreadCount, 0);
  } finally {
    await prisma.$disconnect();
  }
});
