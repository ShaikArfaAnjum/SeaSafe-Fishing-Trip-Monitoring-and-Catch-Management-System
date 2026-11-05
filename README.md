# SeaSafe – Fishing Trip Monitoring and Catch Management System

**Developed by Team AlphaCore**

A specialized coastal harbour monitoring and fishery catch management system. SeaSafe provides automated overdue trip detection, emergency contact resolution, and marine harvest tracking for fishermen, harbour officers, and port authorities.

---

## 📌 Project Objectives

1. **Trip Safety Monitoring**: Enable fishermen to declare trip departure and expected return times.
2. **Automated Overdue Detection**: Automatically identify and flag trips whose scheduled return window has passed without relying on complex GPS hardware.
3. **Emergency Contact Preparedness**: Provide harbour officers instant, centralized access to boat owner and emergency relative contact numbers when trips become overdue.
4. **Catch & Harvest Management**: Record marine catch weights by species to maintain transparent landing records and track daily market valuation against published harbour prices.
5. **Port Fleet Administration**: Give administrators high-level oversight of registered users, harbour vessel quotas, and fishery harvest analytics.

---

## 🛠️ Technologies Used

- **Database**: MongoDB with Mongoose ODM
- **Backend API**: Node.js, Express.js (CommonJS, RESTful architecture)
- **Frontend UI**: React.js (Vite), React Router DOM v6, Axios, Plain CSS (no bulky UI libraries)
- **Authentication**: JSON Web Tokens (JWT), bcryptjs password hashing
- **Weather Integration**: Open-Meteo Marine API (Visakhapatnam Harbour)

---

## ✨ Features and Functionalities

### 1. ⚓ Fisherman Portal
- **Dashboard**: Hero welcome banner, live summary statistics (My Boats, Active Trips, Overdue Alerts, Total Catch), recent trips table, and price board preview.
- **My Boats**: Register, edit, and delete fishing vessels; manage crew member rosters and primary emergency contacts.
- **Start New Trip**: Schedule departure and expected return times with live weather status check.
- **Active Trips at Sea**: Track ongoing trips with clear visual indicators and one-click "Mark as Returned".
- **Record Fish Catch**: Log landed fish species and quantities (kg) with autocomplete assistance from the price board.
- **Trip History**: Complete log of all past voyages, return times, and catch records.
- **Price Board**: Real-time reference of standard harbour rates per kilogram.

### 2. 🛡️ Harbour Officer Portal
- **Dashboard**: Prominent "Overdue Trip Alert" banners, live list of active vessels at sea, and rapid emergency contact card.
- **Boats at Sea**: Monitor all craft currently operating offshore, ordered by earliest expected return.
- **Overdue Boats**: Focused operational view of all delayed vessels with emergency contact numbers and alert resolution workflows (`Verified` / `Resolved`).
- **Emergency Directory**: Searchable contact book across all registered boats and vessel owners.
- **Trip Monitoring**: Full visibility into all historical, active, overdue, and returned fishing trips with status filtering.
- **Alert History**: Audit log of officer notes and resolution history.

### 3. 👑 Administrator Portal
- **Admin Dashboard**: System metrics (Total Users, Registered Boats, Expeditions, Active Overdue Alerts).
- **User Management**: Promote or change user roles (`fisherman`, `officer`, `admin`) and safely decommission accounts.
- **Boats & Harbours**: Manage harbour allocations (Visakhapatnam, Kakinada, Machilipatnam) and fleet quotas.
- **Fish Price Management**: Add, update, and remove fish species and market rates per kilogram.
- **All Trips**: Global table of all fishing voyages with status filters.
- **Landing Reports**: Visual progress bars summarizing harvest distribution by fish species.

---

## 📂 Folder Structure

```
SeaSafe/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection logic
│   ├── controllers/
│   │   ├── adminController.js    # User, fleet, and stats logic
│   │   ├── authController.js     # Register, login, and me endpoints
│   │   ├── boatController.js     # Boat registration and CRUD
│   │   ├── priceController.js    # Market price board management
│   │   └── tripController.js     # Overdue logic and trip handling
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT verification and allowRoles()
│   ├── models/
│   │   ├── Boat.js               # Boat and crew schema
│   │   ├── Price.js              # Fish price schema
│   │   ├── Trip.js               # Trip, catch, and alert schema
│   │   └── User.js               # User authentication schema
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── boatRoutes.js
│   │   ├── priceRoutes.js
│   │   └── tripRoutes.js
│   ├── .env                      # Local environment configuration
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── seed.js                   # Realistic sample data populator
│   ├── server.js                 # Express server & background timer
│   └── test.js                   # Automated 27-route test suite
│
├── frontend/
│   ├── public/
│   │   ├── images/               # Visual reference photography
│   │   └── _redirects            # Netlify routing configuration
│   ├── src/
│   │   ├── components/           # Navbar, Sidebar, StatCard, WeatherCard, etc.
│   │   ├── context/              # AuthContext for session management
│   │   ├── pages/
│   │   │   ├── admin/            # Admin dashboard and management screens
│   │   │   ├── fisherman/        # Fisherman portal views
│   │   │   ├── officer/          # Harbour officer monitoring views
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── styles/               # global.css, layout.css, pages.css
│   │   ├── utils/                # formatDate.js (en-IN, Asia/Kolkata)
│   │   ├── api.js                # Axios interceptor instance
│   │   ├── App.jsx               # Route definitions
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vercel.json               # Vercel SPA rewrite configuration
│   └── vite.config.js
│
├── CODE_GUIDE.md                 # Student Viva & Code Explanation Guide
└── README.md
```

---

## 🚀 Installation & Local Execution

### Step 1: Start the Backend Server

```powershell
# Open terminal and navigate to backend
cd backend

# Install dependencies
npm install

# (Optional) Seed initial data
npm run seed

# Start server in development mode
npm run dev
# Server will run on: http://localhost:5000
```

### Step 2: Start the Frontend Application

```powershell
# Open a new terminal and navigate to frontend
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
# Frontend will run on: http://localhost:5173
```

---

## 🔑 Demo Login Credentials

All passwords have been pre-hashed with bcrypt in `seed.js`:

| Role | Email | Password | Assigned Permissions |
|---|---|---|---|
| **Administrator** | `admin@seasafe.com` | `admin123` | Full system control, users, prices, reports |
| **Harbour Officer** | `officer@seasafe.com` | `officer123` | Overdue alerts, monitoring, emergency contact directory |
| **Fisherman (Owner)** | `ramesh@seasafe.com` | `ramesh123` | Boats (Sea Star, Ocean King), trips, catches |
| **Fisherman (Owner)** | `suresh@seasafe.com` | `suresh123` | Boats (Blue Wave, Sagar Mitra), trips, catches |

---

## ☁️ Deployment Guide

### 1. Database: MongoDB Atlas
1. Create a free M0 cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a Database User with read/write privileges.
3. In **Network Access**, add IP `0.0.0.0/0` (Allow Access from Anywhere).
4. Copy the connection string (e.g. `mongodb+srv://<user>:<password>@cluster.mongodb.net/seasafe?retryWrites=true&w=majority`).

### 2. Backend: Render
1. Create a new **Web Service** on [Render](https://render.com) connected to the repository.
2. Set **Root Directory** to `backend`.
3. Set **Build Command** to `npm install`.
4. Set **Start Command** to `npm start`.
5. Add Environment Variables:
   - `MONGO_URI`: Your MongoDB Atlas URI
   - `JWT_SECRET`: A secure random secret string
   - `CLIENT_URL`: Your frontend URL (e.g. `https://seasafe.vercel.app`)
   - `PORT`: `5000`

### 3. Frontend: Vercel / Netlify
1. Create a new project on [Vercel](https://vercel.com) or [Netlify](https://netlify.com).
2. Set **Root Directory** to `frontend`.
3. Set **Build Command** to `npm run build`.
4. Set **Output Directory** to `dist`.
5. Add Environment Variable:
   - `VITE_API_URL`: Your Render backend URL + `/api` (e.g. `https://seasafe-backend.onrender.com/api`).

---

## 👥 Team AlphaCore

| Name | Registration Number | Department | Role |
|---|---|---|---|
| Student Name 1 | 21BCE0001 | Computer Science & Engineering | Frontend Lead |
| Student Name 2 | 21BCE0002 | Computer Science & Engineering | Backend Lead |
| Student Name 3 | 21BCE0003 | Computer Science & Engineering | Database & QA |
| Student Name 4 | 21BCE0004 | Computer Science & Engineering | Documentation |

