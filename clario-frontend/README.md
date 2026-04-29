# 🎙️ CLARIO — AI Speech Coaching App

> Built by **Maky Aury Okit, Cholou Bado, Sofia Nadine Soriano** & team  
> Central Mindanao University · Technopreneurship Course · 2025

CLARIO helps students and fresh graduates improve their public speaking by recording their speech, transcribing it with AI, analyzing patterns like filler words and pace, and delivering personalized coaching feedback.

---

## 📁 Project Structure

```
TECHNO/
├── clario-backend/
│   ├── server.js          ← Express API (Groq + Claude)
│   ├── package.json
│   ├── .env               ← Your secret keys (never commit this!)
│   └── uploads/           ← Temp audio files (auto-created)
│
└── clario-frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── App.js          ← Router / page switcher
    │   ├── App.css         ← Global design system
    │   ├── index.js        ← React entry point
    │   ├── pages/
    │   │   ├── LandingPage.js / .css
    │   │   ├── PracticePage.js / .css
    │   │   ├── ResultsPage.js / .css
    │   │   └── DashboardPage.js / .css
    │   └── utils/
    │       ├── firebase.js   ← Save/fetch sessions
    │       └── useRecorder.js ← Microphone hook
    ├── .env                ← Your Firebase + API URL
    └── package.json
```

---

## 🔑 Step 1 — Get Your Free API Keys

### A. Groq API Key (for Whisper transcription)
1. Go to **https://console.groq.com**
2. Sign up for free
3. Click **API Keys** → **Create API Key**
4. Copy the key

### B. Claude API Key (for AI coaching feedback)
1. Go to **https://console.anthropic.com**
2. Sign up → Go to **API Keys**
3. Click **Create Key**
4. Copy the key
> ⚠️ New accounts get free credits — more than enough for your demo!

### C. Firebase (for session history storage)
1. Go to **https://console.firebase.google.com**
2. Click **Add Project** → name it `clario` → Continue
3. Click **Firestore Database** → **Create database** → Start in **test mode**
4. Click the **⚙️ gear icon** → **Project Settings**
5. Scroll to **Your apps** → click `</>` (Web)
6. Register app as `clario-web`
7. Copy the `firebaseConfig` values

---

## ⚙️ Step 2 — Setup the Backend

Open a terminal inside `clario-backend/`:

```bash
# 1. Install dependencies
npm install

# 2. Create your .env file (copy from example)
cp .env.example .env
```

Now open `.env` and fill in your keys:

```env
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxx
CLAUDE_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxx
PORT=5000
```

---

## ⚙️ Step 3 — Setup the Frontend

Open a NEW terminal inside `clario-frontend/`:

```bash
# 1. Install dependencies
npm install

# 2. Create your .env file
cp .env.example .env
```

Open `.env` and fill in your Firebase config + backend URL:

```env
REACT_APP_API_URL=http://localhost:5000

REACT_APP_FIREBASE_API_KEY=AIzaSy...
REACT_APP_FIREBASE_AUTH_DOMAIN=clario-xxxxx.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=clario-xxxxx
REACT_APP_FIREBASE_STORAGE_BUCKET=clario-xxxxx.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123
```

---

## 🚀 Step 4 — Run the App

**Terminal 1 — Backend:**
```bash
cd clario-backend
npm run dev
# ✓ Should show: CLARIO backend listening on port 5000
```

**Terminal 2 — Frontend:**
```bash
cd clario-frontend
npm start
# ✓ Opens http://localhost:3000 automatically
```

---

## 🔄 How It Works (Full Flow)

```
User speaks → Browser records audio (WebM)
     ↓
Audio sent to → clario-backend /api/analyze
     ↓
Backend sends audio to → Groq API (Whisper model)
     ↓
Groq returns → text transcript
     ↓
Backend runs → speech analysis (WPM, fillers, score)
     ↓
Backend sends metrics to → Claude API
     ↓
Claude returns → personalized coaching feedback
     ↓
Results sent back → React frontend displays them
     ↓
Session saved → Firebase Firestore
     ↓
Dashboard → shows progress over time
```

---

## 📊 Features

| Feature | Description |
|---|---|
| 🎙️ Recording | Browser mic recording, no installs needed |
| 📝 Transcription | Groq Whisper (fast, free, accurate) |
| 📊 Analysis | WPM, filler word count & breakdown, score |
| 🤖 AI Coaching | Claude generates personalized feedback |
| 📈 Dashboard | Session history + trend charts |
| 💾 Storage | Firebase Firestore (free tier) |

---

## 🎯 Practice Scenarios

- 🎓 **Thesis Defense** — Research presentation practice
- 💼 **Job Interview** — Answer questions confidently
- 📖 **Recitation** — Pace and clarity for reciting
- 🎤 **General Speaking** — Any speaking situation

---

## 🐛 Common Issues

**"Microphone access denied"**  
→ Click the 🔒 lock icon in your browser URL bar → Allow microphone

**"Analysis failed" error**  
→ Check that your backend is running (`npm run dev` in clario-backend)  
→ Check your GROQ_API_KEY in `.env` is correct

**Firebase not saving**  
→ Make sure Firestore is in **test mode** (allows all reads/writes)  
→ Double-check all Firebase env variables in frontend `.env`

**Sessions not showing in dashboard**  
→ Firebase may take a few seconds — refresh the dashboard

---

## 📦 Tech Stack

| Layer | Tool | Cost |
|---|---|---|
| Frontend | React + CSS | Free |
| Backend | Node.js + Express | Free |
| Speech-to-Text | Groq (Whisper) | Free tier |
| AI Feedback | Claude API | Free credits |
| Database | Firebase Firestore | Free tier |

---

## 👥 Team

Built with ❤️ by CMU BSIT 3rd Year students for Technopreneurship:
- **Rolch Vincent Sanchez**
- **Maky Aury Okit**
- **Cholou Bado**  
- **Sofia Nadine Soriano**
- & the team

---

*CLARIO — Speak with Confidence.*