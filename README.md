# EduTech AI Tutor

MERN-stack educational platform with AI tutoring and a unique **Reverse Tutor** mode.

## Quick Start

```bash
# 1. Backend
cd server
npm install
cp .env.example .env   # Fill in MONGO_URI and GEMINI_API_KEY
node src/seed/seed.js  # Seed demo data (run once)
npm run dev            # Starts on :5000

# 2. Frontend (new terminal)
cd client
npm install
cp .env.example .env
npm run dev            # Starts on :5173
```

## Demo Login

Open `http://localhost:5173` and use any quick-login button:
- **Alex Demo** — fresh start
- **Sarah Chen** — DSA nearly complete (great for certificate demo)
- **Jordan Park** — fresh start

## Tech Stack

- Frontend: React 18 + Vite + MUI v5 (Vercel)
- Backend: Node.js + Express + Mongoose (Render)
- Database: MongoDB Atlas
- AI: Google Gemini `gemini-2.5-flash`

## Environment Variables

See `server/.env.example` and `client/.env.example`.
