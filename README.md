# SkillBridge AI — AI-Powered Student Skill Gap Analyzer & Career Roadmap Generator

**SkillBridge AI** is an enterprise-grade, full-stack SaaS platform designed to help students analyze current skills against real-world job roles, parse resumes using AI, generate personalized study roadmaps, and track milestones with gaming elements.

---

## 🚀 Key Features
1. **AI Skill Gap Report**: Direct parsing of uploaded PDF resumes and manual skill checks against desired target roles (using Google Gemini API).
2. **Weekly Personalized Roadmap**: Dynamic learning milestones containing curated article, documentation, and video links.
3. **AI Chat Assistant**: Stream-like interactive chat context-aware of your current roadmap progress.
4. **Platform Gamification**: Level achievements, XP points, and active study streak trackers.
5. **Java DSA Integration**: Standalone module containing priority queues, maps, and graph pathway algorithms.
6. **Fully Managed Admin Portal**: Controls user listings, master skills catalog, resource approval queues, and analytics.

---

## 🛠️ Tech Stack
- **Frontend**: React.js, Vite, Tailwind CSS, React Router V6, Axios, Framer Motion, Recharts, React Hot Toast
- **Backend**: Node.js, Express.js, Helmet, Express Rate Limit, MongoSanitize, Cookie Parser
- **Database**: MongoDB Atlas, Mongoose ODM
- **AI Integration**: Google Gemini API
- **Java Module**: Standard Java JDK 18+

---

## 📁 System Folder Structure
```
skillbridge-ai/
├── backend/
│   ├── config/          # DB, Gemini configurations
│   ├── controllers/     # API request handlers
│   ├── middleware/      # Auth, uploads, errors
│   ├── models/          # Mongoose collections schemas
│   ├── routes/          # API route bindings
│   ├── services/        # AI engines, Email triggers, PDF readers
│   ├── utils/           # Global custom classes, tokens
│   ├── seed/            # Seed script logic
│   └── server.js        # Server execution entry
├── frontend/
│   ├── src/
│   │   ├── api/         # Axios instance, services
│   │   ├── components/  # Layout, Header, Sidebar
│   │   ├── contexts/    # Auth, Theme
│   │   ├── pages/       # Dashboard workspace views
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js
└── dsa-java/
    ├── src/             # Graph, Queue, HashMap classes
    └── README.md
```

---

## 💾 Installation & Local Setup

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (connection URI string)
- Gemini API Key

### 2. Configure Backend `.env`
Create a `.env` file under `backend/` using the template parameters in `.env.example`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/skillbridge
JWT_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_key
GEMINI_API_KEY=your_gemini_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
```

### 3. Run Seeding Script
```bash
cd backend
npm install
npm run seed
```

### 4. Run Backend Server
```bash
npm run dev
```

### 5. Run Frontend Development Server
```bash
cd ../frontend
npm install
npm run dev
```
The client app runs on `http://localhost:5173`.

---

## 🔒 Security Practices
- Set Helmet headers to enforce HTTP security parameters.
- Restrict brute-force requests with customized Express Rate Limit blocks.
- Enforce NoSQL Injection protection via mongo-sanitize filter layers.
- Encrypt passwords before DB storage using bcryptjs hashes.
