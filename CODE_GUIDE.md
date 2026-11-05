# SeaSafe – Comprehensive Viva & Architecture Code Guide

This document is prepared for B.Tech third-year engineering students to understand and confidently answer questions during project reviews and vivas.

---

## 1. High-Level Architecture & Request Flow

Every user action follows the classic MERN 5-stage pipeline:

```
[React Component / Page]
        │
        ▼ (1) HTTP Request via Axios instance (src/api.js) with Bearer JWT
[Express Router] (backend/routes/*)
        │
        ▼ (2) Route Middleware (protect, allowRoles) verifies JWT & user role
[Controller Action] (backend/controllers/*)
        │
        ▼ (3) Business Logic & Data validation
[Mongoose Model] (backend/models/*)
        │
        ▼ (4) Query execution via MongoDB Driver
[MongoDB Database] (seasafe)
        │
        ▼ (5) JSON Response sent back to React UI
[React Component] Updates state via useState / UI re-renders
```

### Concrete Example: Recording a Fish Catch
1. **User Action**: The fisherman enters 25 kg of "Pomfret" in `AddCatch.jsx` and clicks "Add Catch to Trip".
2. **Axios Call**: `api.post('/trips/' + selectedTripId + '/catch', { fishType: 'Pomfret', quantityKg: 25 })`.
3. **Interceptor**: `src/api.js` automatically attaches `Authorization: Bearer <token>` from browser `localStorage`.
4. **Route Match**: `backend/routes/tripRoutes.js` matches `POST /:id/catch`.
5. **Middleware**:
   - `protect`: Decodes JWT with `process.env.JWT_SECRET`, loads user object into `req.user`.
   - `allowRoles('fisherman')`: Confirms `req.user.role === 'fisherman'`.
6. **Controller**: `addCatch(req, res)` in `backend/controllers/tripController.js`:
   - Checks if trip belongs to `req.user._id`.
   - Validates `quantityKg > 0`.
   - Pushes `{ fishType, quantityKg }` into `trip.catches` subdocument array.
   - Saves document with `await trip.save()`.
7. **Populate & Respond**: Returns populated trip document with HTTP status `200`.
8. **UI State Update**: `AddCatch.jsx` receives updated trip, appends item to table, displays success alert.

---

## 2. Authentication & JWT Security

### How Passwords are Protected
- Passwords are never stored in plain text.
- During registration (`authController.js`), `bcryptjs.genSalt(10)` creates a cryptographic salt.
- `bcryptjs.hash(password, salt)` computes a one-way secure hash stored in MongoDB.
- During login, `bcryptjs.compare(password, user.password)` verifies credentials without decrypting.

### How JWT Works
- On successful login or registration, the server issues a signed token:
  ```javascript
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  ```
- The frontend stores this token in `localStorage`.
- Subsequent requests send the token in the `Authorization` header:
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsIn...
  ```

### How Role-Based Access Control (RBAC) Works
- **Backend Protection**:
  ```javascript
  router.get('/all', protect, allowRoles('officer', 'admin'), getAllBoats);
  ```
  If a fisherman tries to access `/api/boats/all` directly using Postman or curl, `allowRoles` returns `403 Forbidden` (`{ "message": "Access denied. You do not have permission for this action." }`).
- **Frontend Protection**:
  `<ProtectedRoute allowedRoles={['admin']}>` checks the current user's role from `AuthContext`. If unauthorized, it redirects to the user's home screen.

---

## 3. The Overdue Trip Safety Mechanism

### Why No GPS?
Commercial trawlers and artisanal boats in developing coastal regions often lack expensive satellite GPS transponders. SeaSafe uses **Schedule-Based Departure Assurance**:
- Fishermen declare their boat, departure time, and expected return time before sailing.
- If a vessel does not return by its declared expected return time, the system flags it as **Overdue**.

### The Overdue Algorithm: `markOverdueTrips()`
Implemented in `backend/controllers/tripController.js`:
```javascript
async function markOverdueTrips() {
  await Trip.updateMany(
    { status: 'At Sea', expectedReturnTime: { $lt: new Date() } },
    { status: 'Overdue', alertStatus: 'Open' }
  );
}
```

### When is it Executed?
1. **Server Startup**: Run once immediately after database connection.
2. **Background Cron/Interval**: Run automatically every 60 seconds (`setInterval`) in `server.js`.
3. **Real-Time Route Hook**: Called at the beginning of every trip-fetching route (`/trips/my`, `/trips/at-sea`, `/trips/overdue`, `/trips/all`) to guarantee zero stale data.

---

## 4. Date and Time Handling (Avoiding Timezone Bugs)

- **MongoDB Storage**: Always stored in standard UTC timestamps via `Date` objects.
- **Frontend Inputs**: Forms use HTML5 `<input type="datetime-local">` which accepts local user time. Before sending to backend, converted with `new Date(value).toISOString()`.
- **Display Formatting**: `src/utils/formatDate.js` enforces Indian Standard Time (IST):
  ```javascript
  d.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', ... })
  ```
  This ensures timestamps appear uniformly in Indian Standard Time regardless of operating system configuration.

---

## 5. Third-Party Weather Integration

- Located in `src/components/WeatherCard.jsx`.
- Uses the free Open-Meteo REST API (`https://api.open-meteo.com/v1/forecast`).
- Query parameters set for Visakhapatnam Fishing Harbour (`latitude=17.6868`, `longitude=83.2185`, `current_weather=true`).
- Requires no secret API key.
- Weather code lookup maps numerical WMO codes to clear plain text descriptions and emojis (e.g. `0` = ☀️ Clear Sky, `95` = ⛈️ Thunderstorm).
- Wrapped in try/catch with fallback text so weather service outages never break portal functionality.

---

## 6. Viva Questions & Model Answers

### Q1: What happens if a fisherman tries to delete a boat that is currently at sea?
**Answer**: The backend rejects the request with HTTP status 400 and returns a clear message: `"Cannot delete this boat because it has an active trip (status: At Sea). End the trip first."` This prevents orphaned active voyage records in the database.

### Q2: Why did you not use MongoDB Aggregation Pipelines for admin statistics?
**Answer**: Aggregation pipelines (`$group`, `$unwind`) can be complex to debug and explain in an undergraduate viva. Instead, we fetch the documents and process sums and groupings using plain, readable JavaScript loops (`for` loops and standard key-value maps).

### Q3: How do you prevent route collision between `/api/trips/:id` and `/api/trips/all`?
**Answer**: In Express.js, routes are evaluated in the order they are defined. Fixed endpoints such as `/my`, `/at-sea`, `/overdue`, and `/all` are registered **before** wildcard parameterized routes like `/:id`. This prevents Express from mistaking strings like `"all"` for a MongoDB ObjectId.

### Q4: Why is state managed with React Context instead of Redux?
**Answer**: SeaSafe only requires global persistence for user session credentials (`user` and `token`). A lightweight React Context (`AuthContext`) combined with `localStorage` achieves persistent authentication cleanly without the boilerplate and dependency weight of Redux.

