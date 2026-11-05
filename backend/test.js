// ============================================================
// test.js  –  SeaSafe API route tests
// Run AFTER the server is running: node test.js
// Uses Node 18+ native fetch (no extra libraries needed).
// ============================================================

const BASE = 'http://localhost:5000';

// Store tokens and IDs between test steps
var adminToken    = '';
var officerToken  = '';
var rameshToken   = '';
var newBoatId     = '';
var newTripId     = '';
var catchId       = '';
var overdueTripId = '';

// Results table
var results = [];

// Make a JSON request and return { status, body }
async function req(method, path, body, token) {
  var opts = {
    method: method,
    headers: { 'Content-Type': 'application/json' }
  };
  if (token) opts.headers['Authorization'] = 'Bearer ' + token;
  if (body)  opts.body = JSON.stringify(body);

  var res  = await fetch(BASE + path, opts);
  var json = await res.json().catch(function () { return {}; });
  return { status: res.status, body: json };
}

// Log a test result
function log(name, passed, detail) {
  var icon = passed ? '✅' : '❌';
  results.push({ name: name, passed: passed, detail: detail || '' });
  console.log(icon + '  ' + name + (detail ? '  (' + detail + ')' : ''));
}

async function runTests() {
  console.log('\n========================================');
  console.log('  SeaSafe API – Route Test Suite');
  console.log('========================================\n');

  var r;

  // ---- 1. Health check ----
  r = await req('GET', '/');
  log('GET / health check', r.status === 200 && r.body.message === 'SeaSafe API is running', 'status ' + r.status);

  // ---- 2. Register a new user ----
  r = await req('POST', '/api/auth/register', { name: 'Test User', email: 'testuser@seasafe.com', password: 'test123', role: 'fisherman' });
  log('POST /api/auth/register (new user)', r.status === 201 && r.body.token, 'status ' + r.status);

  // ---- 3. Register with admin role (must be rejected) ----
  r = await req('POST', '/api/auth/register', { name: 'Bad Admin', email: 'badmin@seasafe.com', password: 'test123', role: 'admin' });
  log('POST /api/auth/register (admin role rejected)', r.status === 400, 'status ' + r.status);

  // ---- 4. Login as admin ----
  r = await req('POST', '/api/auth/login', { email: 'admin@seasafe.com', password: 'admin123' });
  adminToken = r.body.token || '';
  log('POST /api/auth/login (admin)', r.status === 200 && adminToken, 'status ' + r.status);

  // ---- 5. Login as officer ----
  r = await req('POST', '/api/auth/login', { email: 'officer@seasafe.com', password: 'officer123' });
  officerToken = r.body.token || '';
  log('POST /api/auth/login (officer)', r.status === 200 && officerToken, 'status ' + r.status);

  // ---- 6. Login as fisherman Ramesh ----
  r = await req('POST', '/api/auth/login', { email: 'ramesh@seasafe.com', password: 'ramesh123' });
  rameshToken = r.body.token || '';
  log('POST /api/auth/login (fisherman – Ramesh)', r.status === 200 && rameshToken, 'status ' + r.status);

  // ---- 7. GET /api/auth/me ----
  r = await req('GET', '/api/auth/me', null, rameshToken);
  log('GET /api/auth/me', r.status === 200 && r.body.email === 'ramesh@seasafe.com', 'role=' + r.body.role);

  // ---- 8. Add a new boat as fisherman ----
  r = await req('POST', '/api/boats', {
    boatName: 'Nellore Star',
    registrationNumber: 'AP-NL-099',
    harbour: 'Nellore',
    emergencyContactName: 'Venkata Subbaiah',
    emergencyContactPhone: '+91 91234 56789',
    crew: [{ name: 'Raju', age: 30, phone: '+91 98712 34567' }]
  }, rameshToken);
  newBoatId = r.body._id || '';
  log('POST /api/boats (add boat)', r.status === 201 && newBoatId, 'boatId=' + newBoatId);

  // ---- 9. Duplicate registration number rejected ----
  r = await req('POST', '/api/boats', {
    boatName: 'Fake Boat',
    registrationNumber: 'AP-NL-099',
    harbour: 'Nellore',
    emergencyContactName: 'Nobody',
    emergencyContactPhone: '+91 00000 00000'
  }, rameshToken);
  log('POST /api/boats (duplicate regNum rejected)', r.status === 400, 'status ' + r.status);

  // ---- 10. Start a trip ----
  var departure     = new Date(Date.now() - 30 * 60 * 1000).toISOString(); // 30 min ago
  var expectedReturn = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(); // 3 hours from now

  r = await req('POST', '/api/trips', {
    boat: newBoatId,
    departureTime: departure,
    expectedReturnTime: expectedReturn
  }, rameshToken);
  newTripId = r.body._id || '';
  log('POST /api/trips (start trip)', r.status === 201 && newTripId, 'tripId=' + newTripId);

  // ---- 11. Duplicate active trip must be rejected ----
  r = await req('POST', '/api/trips', {
    boat: newBoatId,
    departureTime: departure,
    expectedReturnTime: expectedReturn
  }, rameshToken);
  log('POST /api/trips (duplicate active trip rejected)', r.status === 400, 'status ' + r.status);

  // ---- 12. Add a catch ----
  r = await req('POST', '/api/trips/' + newTripId + '/catch', { fishType: 'Pomfret', quantityKg: 25 }, rameshToken);
  catchId = (r.body.catches && r.body.catches[0]) ? r.body.catches[0]._id : '';
  log('POST /api/trips/:id/catch (add catch)', r.status === 200 && catchId, 'catchId=' + catchId);

  // ---- 13. Delete the catch ----
  r = await req('DELETE', '/api/trips/' + newTripId + '/catch/' + catchId, null, rameshToken);
  var catchesLeft = r.body.catches ? r.body.catches.length : -1;
  log('DELETE /api/trips/:id/catch/:catchId', r.status === 200 && catchesLeft === 0, 'catches left=' + catchesLeft);

  // ---- 14. Mark trip as returned ----
  r = await req('PUT', '/api/trips/' + newTripId + '/return', null, rameshToken);
  log('PUT /api/trips/:id/return', r.status === 200 && r.body.status === 'Returned', 'status=' + r.body.status);

  // ---- 15. Get fisherman's trips ----
  r = await req('GET', '/api/trips/my', null, rameshToken);
  log('GET /api/trips/my', r.status === 200 && Array.isArray(r.body), 'count=' + (r.body.length || 0));

  // ---- 16. Officer gets at-sea trips ----
  r = await req('GET', '/api/trips/at-sea', null, officerToken);
  log('GET /api/trips/at-sea (officer)', r.status === 200 && Array.isArray(r.body), 'count=' + (r.body.length || 0));

  // ---- 17. Officer gets overdue trips (expect at least 1 from seed) ----
  r = await req('GET', '/api/trips/overdue', null, officerToken);
  var overdueList = r.body;
  overdueTripId = Array.isArray(overdueList) && overdueList.length > 0 ? overdueList[0]._id : '';
  log('GET /api/trips/overdue (officer)', r.status === 200 && overdueList.length > 0, 'count=' + overdueList.length);

  // ---- 18. Officer updates alert ----
  if (overdueTripId) {
    r = await req('PUT', '/api/trips/' + overdueTripId + '/alert', {
      alertStatus: 'Verified',
      officerNote: 'Called emergency contact. Awaiting confirmation.'
    }, officerToken);
    log('PUT /api/trips/:id/alert (officer verifies)', r.status === 200 && r.body.alertStatus === 'Verified', 'alertStatus=' + r.body.alertStatus);
  } else {
    log('PUT /api/trips/:id/alert (officer verifies)', false, 'no overdue trip found');
  }

  // ---- 19. Admin gets all trips ----
  r = await req('GET', '/api/trips/all', null, adminToken);
  log('GET /api/trips/all (admin)', r.status === 200 && Array.isArray(r.body), 'count=' + (r.body.length || 0));

  // ---- 20. Admin adds a price ----
  r = await req('POST', '/api/prices', { fishType: 'Lobster', pricePerKg: 800 }, adminToken);
  log('POST /api/prices (admin adds price)', r.status === 201 && r.body.fishType === 'Lobster', 'fishType=' + r.body.fishType);

  // ---- 21. Fisherman cannot access admin route (must get 403) ----
  r = await req('GET', '/api/admin/stats', null, rameshToken);
  log('GET /api/admin/stats (fisherman gets 403)', r.status === 403, 'status ' + r.status);

  // ---- 22. Officer cannot access admin route (must get 403) ----
  r = await req('GET', '/api/admin/stats', null, officerToken);
  log('GET /api/admin/stats (officer gets 403)', r.status === 403, 'status ' + r.status);

  // ---- 23. Admin gets stats ----
  r = await req('GET', '/api/admin/stats', null, adminToken);
  var s = r.body;
  log('GET /api/admin/stats (admin)', r.status === 200 && s.totalUsers > 0,
    'users=' + s.totalUsers + ' boats=' + s.totalBoats + ' trips=' + s.totalTrips + ' overdue=' + s.overdueTrips);

  // ---- 24. Alert history ----
  r = await req('GET', '/api/trips/alerts', null, officerToken);
  log('GET /api/trips/alerts (officer)', r.status === 200 && Array.isArray(r.body), 'count=' + (r.body.length || 0));

  // ---- 25. Fisherman cannot see all boats ----
  r = await req('GET', '/api/boats/all', null, rameshToken);
  log('GET /api/boats/all (fisherman gets 403)', r.status === 403, 'status ' + r.status);

  // ---- 26. Officer can see all boats ----
  r = await req('GET', '/api/boats/all', null, officerToken);
  log('GET /api/boats/all (officer)', r.status === 200 && Array.isArray(r.body), 'count=' + (r.body.length || 0));

  // ---- 27. Admin can see all users ----
  r = await req('GET', '/api/admin/users', null, adminToken);
  log('GET /api/admin/users', r.status === 200 && Array.isArray(r.body), 'count=' + (r.body.length || 0));

  // ---- Summary ----
  var passed = results.filter(function (x) { return x.passed; }).length;
  var failed = results.filter(function (x) { return !x.passed; }).length;

  console.log('\n========================================');
  console.log('  Results: ' + passed + ' passed  |  ' + failed + ' failed  |  ' + results.length + ' total');
  console.log('========================================\n');

  if (failed > 0) {
    console.log('Failed tests:');
    results.filter(function (x) { return !x.passed; }).forEach(function (x) {
      console.log('  ❌ ' + x.name + '  ' + x.detail);
    });
    console.log('');
  }
}

runTests().catch(function (err) {
  console.error('Test runner error: ' + err.message);
});

