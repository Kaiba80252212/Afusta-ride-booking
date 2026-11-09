/* End-to-end smoke tests for the CampusTrike API.
 * Requires a running API and a migrated database.
 *   BASE_URL=http://127.0.0.1:4100 node --test tests/
 * Optional (skips admin-side checks when absent):
 *   ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=...
 * Creates its own throwaway accounts per run (unique emails). */
import { test } from 'node:test';
import assert from 'node:assert/strict';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:4000';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const runId = `${Date.now()}${Math.floor(Math.random() * 1e4)}`;
let accountSeq = 0;

async function api(path, { method = 'GET', token, body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function register(role) {
  const email = `${role}-${runId}-${++accountSeq}@example.com`;
  const password = 'TestPass12345!';
  const res = await api('/api/auth/register', { method: 'POST', body: { fullName: `${role} ${runId}`, email, password, role } });
  assert.equal(res.status, 201, `register ${role} failed: ${JSON.stringify(res.data)}`);
  return { email, password };
}
async function login(email, password) {
  const res = await api('/api/auth/login', { method: 'POST', body: { email, password } });
  assert.equal(res.status, 200, `login failed: ${JSON.stringify(res.data)}`);
  return res.data.token;
}

test('health endpoint reports a connected database', async () => {
  const res = await api('/api/health');
  assert.equal(res.status, 200);
  assert.equal(res.data.status, 'ok');
  assert.equal(res.data.database, 'connected');
});

test('student signup, login, and /api/me round-trip', async () => {
  const student = await register('student');
  const token = await login(student.email, student.password);
  const me = await api('/api/me', { token });
  assert.equal(me.status, 200);
  assert.equal(me.data.user.role, 'student');
  assert.equal(me.data.user.email, student.email);
});

test('login is rejected with a wrong password', async () => {
  const student = await register('student');
  const res = await api('/api/auth/login', { method: 'POST', body: { email: student.email, password: 'WrongPass999!' } });
  assert.equal(res.status, 401);
});

test('booking rejects identical pickup and destination', async () => {
  const student = await register('student');
  const token = await login(student.email, student.password);
  const locations = await api('/api/locations', { token });
  assert.equal(locations.status, 200);
  assert.ok(locations.data.locations.length >= 2, 'need at least two seeded locations');
  const [a] = locations.data.locations;
  const booking = await api('/api/bookings', { method: 'POST', token, body: { pickupId: a.id, destinationId: a.id } });
  assert.equal(booking.status, 400);
});

test('full ride lifecycle: student books, driver is approved and completes, admin confirms payment', { skip: !ADMIN_EMAIL || !ADMIN_PASSWORD }, async () => {
  const adminToken = await login(ADMIN_EMAIL, ADMIN_PASSWORD);

  const student = await register('student');
  const studentToken = await login(student.email, student.password);
  const locations = await api('/api/locations', { token: studentToken });
  const [a, b] = locations.data.locations;
  const created = await api('/api/bookings', { method: 'POST', token: studentToken, body: { pickupId: a.id, destinationId: b.id, note: 'smoke test' } });
  assert.equal(created.status, 201);
  const bookingId = created.data.booking.id;

  const driver = await register('driver');
  // Unapproved drivers must not log in.
  const earlyLogin = await api('/api/auth/login', { method: 'POST', body: { email: driver.email, password: driver.password } });
  assert.equal(earlyLogin.status, 403);

  const drivers = await api('/api/admin/drivers', { token: adminToken });
  const record = drivers.data.drivers.find(d => d.email === driver.email);
  assert.ok(record, 'driver should appear in the approval queue');
  const approve = await api(`/api/admin/drivers/${record.id}/approval`, { method: 'PATCH', token: adminToken, body: { status: 'active' } });
  assert.equal(approve.status, 200);

  const driverToken = await login(driver.email, driver.password);
  assert.equal((await api(`/api/bookings/${bookingId}/accept`, { method: 'PATCH', token: driverToken })).status, 200);
  assert.equal((await api(`/api/bookings/${bookingId}/accept`, { method: 'PATCH', token: driverToken })).status, 409, 'double accept must fail');
  for (const status of ['driver_arriving', 'in_progress', 'completed']) {
    assert.equal((await api(`/api/bookings/${bookingId}/status`, { method: 'PATCH', token: driverToken, body: { status } })).status, 200, status);
  }
  assert.equal((await api(`/api/bookings/${bookingId}/payment`, { method: 'PATCH', token: driverToken, body: { status: 'reported' } })).status, 200);
  // Drivers may not confirm cash themselves.
  assert.equal((await api(`/api/bookings/${bookingId}/payment`, { method: 'PATCH', token: driverToken, body: { status: 'confirmed' } })).status, 403);
  assert.equal((await api(`/api/bookings/${bookingId}/payment`, { method: 'PATCH', token: adminToken, body: { status: 'confirmed' } })).status, 200);

  const list = await api('/api/bookings', { token: studentToken });
  const mine = list.data.bookings.find(x => x.id === bookingId);
  assert.equal(mine.status, 'completed');
  assert.equal(mine.payment_status, 'confirmed');
});

test('fare read returns a positive base fare', async () => {
  const student = await register('student');
  const token = await login(student.email, student.password);
  const res = await api('/api/fares', { token });
  assert.equal(res.status, 200);
  assert.ok(Number(res.data.fare?.base_fare) > 0);
});

test('unauthenticated requests are rejected', async () => {
  assert.equal((await api('/api/bookings')).status, 401);
  assert.equal((await api('/api/locations')).status, 401);
});
