# 📚 NoteSphere — Full-Stack Notes Publishing Platform

A full-featured notes sharing platform where users can publish, discover, rate notes, and subscribe to authors. Built with **React + Vite**, **Node.js/Express**, and **MongoDB**.

---

## ✨ Features

- 🔐 **Authentication** — JWT-based login & signup
- 📝 **Publish Notes** — Rich note creation with categories, tags, thumbnails
- ⭐ **Rating System** — 1–5 star ratings with written reviews
- 🔔 **Subscribe** — Follow authors and track their notes
- 🔖 **Save Notes** — Bookmark notes for later
- 🔍 **Explore & Search** — Filter by category, sort by rating/views/date, paginated
- 📊 **Dashboard** — View your stats, manage published notes
- 👤 **Profile Pages** — Public author profiles with subscriber counts
- 💎 **Premium Badges** — Mark high-quality content

---

## 🏗 Project Structure

```
notesphere/
├── backend/           # Node.js + Express API
│   ├── controllers/   # Route logic
│   ├── middleware/    # Auth middleware
│   ├── models/        # Mongoose schemas
│   ├── routes/        # API routes
│   ├── server.js      # Entry point
│   └── .env.example   # Environment config template
│
└── frontend/          # React + Vite app
    ├── src/
    │   ├── components/  # Reusable UI
    │   ├── context/     # Auth context
    │   ├── pages/       # Route pages
    │   └── utils/       # API client
    └── vite.config.js
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

---

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/notesphere
JWT_SECRET=your_super_secret_key_here_make_it_long
JWT_EXPIRES_IN=30d
CLIENT_URL=http://localhost:5173
```

Start the backend:
```bash
npm run dev      # development (nodemon)
npm start        # production
```

The API runs on **http://localhost:5000**

---

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app runs on **http://localhost:5173**

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user (protected) |
| PUT | `/api/auth/profile` | Update profile (protected) |

### Notes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notes` | List notes (search, filter, paginate) |
| GET | `/api/notes/:id` | Get single note |
| POST | `/api/notes` | Create note (protected) |
| PUT | `/api/notes/:id` | Update note (protected) |
| DELETE | `/api/notes/:id` | Delete note (protected) |
| POST | `/api/notes/:id/rate` | Rate a note (protected) |
| POST | `/api/notes/:id/save` | Save/unsave note (protected) |
| GET | `/api/notes/saved` | Get saved notes (protected) |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Top authors |
| GET | `/api/users/:id` | User profile |
| GET | `/api/users/:id/notes` | User's notes |
| POST | `/api/users/:id/subscribe` | Toggle subscribe (protected) |

---

## 🌐 Deploying to Production

### Backend (Railway / Render / Fly.io)
1. Set environment variables in your hosting dashboard
2. Set `NODE_ENV=production`
3. Update `CLIENT_URL` to your frontend's domain
4. Use a MongoDB Atlas connection string for `MONGO_URI`

### Frontend (Vercel / Netlify)
1. Build: `npm run build`
2. Set environment variable: `VITE_API_URL=https://your-backend-url.com`
3. Update `vite.config.js` proxy or use `VITE_API_URL` in axios base URL for production

### MongoDB Atlas (Free Tier)
1. Create account at mongodb.com/atlas
2. Create a free M0 cluster
3. Whitelist your server's IP (or 0.0.0.0/0 for all)
4. Copy connection string to `MONGO_URI`

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6 |
| Styling | Pure CSS with CSS variables |
| HTTP | Axios |
| Backend | Node.js, Express 4 |
| Database | MongoDB, Mongoose 7 |
| Auth | JWT, bcryptjs |
| Icons | Lucide React |

---

## 📄 License

MIT
