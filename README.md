# SkillGap Analyzer

SkillGap Analyzer Banner
<img width="220" height="85" alt="image" src="https://github.com/user-attachments/assets/6e058e24-f2e2-4b21-83d9-8b3d0679e706" />
DashBoard :- <img width="1280" height="625" alt="image" src="https://github.com/user-attachments/assets/570a372a-55f9-4df5-a005-505232ac37c8" />
projects page :- <img width="1578" height="888" alt="{3E4727EA-51AC-4EF0-9A19-2C1DD0F594BE}" src="https://github.com/user-attachments/assets/064bd1cb-6969-4e0d-a66a-f07544287377" />
new analysis page :- <img width="1568" height="876" alt="{DC14C11A-4429-47CE-8876-BFE43029B733}" src="https://github.com/user-attachments/assets/a598e7f1-2745-4ceb-aeae-293a3acb7795" />
learning roadmap page :- <img width="1553" height="890" alt="{11C15B9D-5501-413A-9029-B05AB4505F09}" src="https://github.com/user-attachments/assets/74f9907f-ac50-404b-a4b5-8a93b318b411" />

[![React](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![OpenRouter](https://img.shields.io/badge/OpenRouter-6366f1?style=flat-square&logo=openai&logoColor=white)](https://openrouter.ai)
 
[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Visit_App-6366f1?style=for-the-badge)](https://skillgap-analyzer.vercel.app)
[![GitHub Stars](https://img.shields.io/github/stars/Vikram-kumar-7/Skill-gap-Analyzer?style=for-the-badge&color=fbbf24)](https://github.com/Vikram-kumar-7/Skill-gap-Analyzer/stargazers)
 
**The career intelligence platform that tells you exactly what to learn next — and why.**

React :- https://react.dev
Vite :- https://vitejs.dev
Tailwind CSS :- https://tailwindcss.com
Node.js :- https://nodejs.org
Express :- https://expressjs.com
Supabase :- https://supabase.com
OpenRouter :- https://openrouter.ai

Live Demo :- skill-gap-analyzer-henna.vercel.app
GitHub Stars :- https://github.com/Vikram-kumar-7/Skill-gap-Analyzer/stargazers)

</div>

---

## What is this?

SkillGap Analyzer is a **full-stack career intelligence platform** for developers and CS students. Upload your resume, paste a job description, and instantly get:

- 📊 **Skill match percentage** against your target role
- 🗺️ **12-week personalized roadmap** with ROI-ranked skills
- 🤖 **AI mock interviews** with 4-axis scoring and follow-up questions
- 💰 **Salary projection** showing exactly how much each skill is worth learning
- 📈 **GitHub-style activity heatmap** tracking your daily learning streak

> Built by a B.Tech CSE student — every feature solves a real placement preparation problem.

---

## ✨ Features

### 🔍 Resume Parser & Skill Gap Analysis
- Upload PDF resume **or** paste raw text
- Compares your skillset against 150+ skills and their aliases
- Generates exact match percentage vs benchmark role or custom JD
- Identifies present vs missing skills with market demand data

### 🗺️ ROI-Ranked Learning Roadmap
- 3-phase Kanban board (High-Impact → Growth → Nice-to-Have)
- Each skill ranked by ROI formula: `demand × salary_boost ÷ difficulty`
- Embedded course links (Coursera, Udemy, freeCodeCamp, YouTube)
- Progress tracking with milestone check-offs

### 🤖 AI Mock Interviewer
- 60+ questions across Technical, Behavioral, System Design
- Flashcard interface with answer reveal and keyboard navigation
- **4-axis scoring rubric** (client-side formula, not AI-guessed):
  - Accuracy: 40% · Completeness: 25% · Clarity: 15% · Depth: 20%
- Developer history context injection — AI remembers your weak areas across sessions
- Zero-click prefetching: hints load in background before you click
- LRU cache (60-min TTL) prevents redundant API calls

### 💰 Career Simulator
- Salary projection before vs after learning roadmap skills
- Side-by-side role comparison (e.g. Frontend vs DevOps)
- ROI bar chart per missing skill (Recharts)
- Indian market salary data (LPA) from curated dataset

### 📁 Project Tracker + Recommendations
- Track your portfolio projects with status, tech stack, GitHub links
- **80+ AI-recommended project ideas** matched to your skill gaps
- Seeded shuffle — completely different 6 projects on every refresh
- One-click "Add to Projects" from recommendations

### 🎯 Skill Tracker
- Manual skill progress tracking (Learning / Learned)
- Progress bars per skill with category tagging
- Add/remove skills with modal form

### 🔐 Auth & Sync
- **Magic link login** via Supabase (no password needed)
- Cross-device data sync via Supabase PostgreSQL
- Offline-first: full app works without login via localStorage
- Row Level Security — users never see each other's data

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (React/Vite)                   │
│                                                          │
│  Pages          Services           Utils                 │
│  ────────       ────────────       ──────────────        │
│  Login          aiService.js       analysisEngine.js     │
│  Dashboard      interviewAI.js     userHistory.js        │
│  NewAnalysis    projectAI.js       aiCache.js (LRU)      │
│  Roadmap                           storage.js            │
│  InterviewPrep                     supabase.js           │
│  CareerSim                                               │
│  Projects                                                │
│  SkillTracker                                            │
│  Settings                                                │
└────────────────────────┬────────────────────────────────┘
                         │ /api/*
┌────────────────────────▼────────────────────────────────┐
│                   SERVER (Node/Express)                   │
│                                                          │
│  Routes              Services                            │
│  ──────────          ──────────────────────────────      │
│  /api/analyze   →    pdfService → skillExtractor         │
│  /api/ai/chat   →         → comparisonEngine             │
│  /api/ai/score  →         → marketAnalyzer               │
│  /api/ai/tip    →         → roadmapGenerator             │
│                           → aiService (GPT-4o-mini)      │
└────────────────────────┬────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
   Supabase         OpenRouter        OpenAI
   (Auth + DB)    (Gemma-4-31B)    (GPT-4o-mini)
```

### AI Failover Chain
```
UI Request
    │
    ▼
[1] Backend proxy /api/ai/chat  ──(success)──▶ Response
    │ (fails or timeout 12s)
    ▼
[2] OpenRouter direct (Gemma-4-31b-it:free)  ──(success)──▶ Response
    │ (fails or timeout 25s)
    ▼
[3] Rule-based fallback engine  ──────────────────────────▶ Response
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (free)
- OpenRouter API key (free — 200 req/day)

### 1. Clone the repository
```bash
git clone https://github.com/Vikram-kumar-7/Skill-gap-Analyzer.git
cd Skill-gap-Analyzer
```

### 2. Setup the Backend
```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env`:
```env
PORT=5000
OPENAI_API_KEY=your-openai-key-optional
OPENROUTER_API_KEY=your-openrouter-key
```

```bash
npm run dev
# Server runs at http://localhost:5000
```

### 3. Setup the Frontend
```bash
cd client
npm install
cp .env.example .env.local
```

Edit `client/.env.local`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:5000
```

```bash
npm run dev
# App runs at http://localhost:5173
```

### 4. Setup Supabase

Run this SQL in your Supabase SQL Editor:

```sql
create table users (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  course text,
  target_role text,
  created_at timestamp default now()
);

create table analyses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete cascade,
  role_name text,
  match_pct integer,
  missing_skills jsonb,
  present_skills jsonb,
  is_active boolean default false,
  created_at timestamp default now()
);

alter table users enable row level security;
alter table analyses enable row level security;
```

Set Site URL in Supabase → Authentication → URL Configuration:
```
http://localhost:5173
```

---

## 🌐 Deployment

### Frontend → Vercel
```bash
# In Vercel dashboard:
# Root Directory: client
# Build Command: npm run build
# Output Directory: dist
#
# Environment Variables:
# VITE_SUPABASE_URL=your-supabase-url
# VITE_SUPABASE_ANON_KEY=your-anon-key
# VITE_API_URL=https://your-render-app.onrender.com
```

### Backend → Render
```bash
# In Render dashboard:
# Root Directory: server
# Build Command: npm install
# Start Command: node app.js
#
# Environment Variables:
# PORT=5000
# OPENROUTER_API_KEY=your-key
# OPENAI_API_KEY=your-key (optional)
```

---

## 📁 Project Structure

```
Skill-gap-Analyzer/
│
├── client/                          # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx        # Magic link auth + onboarding
│   │   │   ├── DashboardPage.jsx    # Stats, radar chart, activity
│   │   │   ├── NewAnalysisPage.jsx  # PDF upload + JD paste
│   │   │   ├── AnalysesPage.jsx     # History of analyses
│   │   │   ├── RoadmapPage.jsx      # 3-phase Kanban roadmap
│   │   │   ├── SkillTrackerPage.jsx # Skill progress cards
│   │   │   ├── CareerSimPage.jsx    # Salary simulator + charts
│   │   │   ├── InterviewPage.jsx    # AI flashcard mock interviews
│   │   │   ├── ProjectsPage.jsx     # Project tracker
│   │   │   └── SettingsPage.jsx     # Profile + API keys + export
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── TopBar.jsx
│   │   │   └── ProjectRecommendations.jsx  # 80+ seeded project ideas
│   │   ├── services/
│   │   │   ├── aiService.js         # OpenRouter + failover chain
│   │   │   └── interviewAI.js       # Scoring prompts + rubrics
│   │   └── utils/
│   │       ├── analysisEngine.js    # Client-side skill matching
│   │       ├── userHistory.js       # Interview history + context injection
│   │       ├── aiCache.js           # LRU cache (50 entries, 60min TTL)
│   │       ├── storage.js           # localStorage helper (sga_ namespace)
│   │       └── supabase.js          # Supabase client config
│   ├── .env.example
│   └── package.json
│
├── server/                          # Express backend
│   ├── routes/
│   │   ├── analyzeRoutes.js         # PDF upload endpoint
│   │   └── aiRoutes.js              # AI proxy endpoints
│   ├── controllers/
│   │   └── analyzeController.js     # Resume pipeline orchestrator
│   ├── services/
│   │   ├── pdfService.js            # pdf-parse text extraction
│   │   ├── skillExtractor.js        # 150+ skill alias matching
│   │   ├── comparisonEngine.js      # Present vs missing skills
│   │   ├── marketAnalyzer.js        # ROI = demand × salary ÷ difficulty
│   │   ├── roadmapGenerator.js      # 3-phase skill grouping
│   │   └── aiService.js             # OpenAI GPT-4o-mini integration
│   ├── data/
│   │   ├── skills.json              # 150+ skill definitions
│   │   ├── aliases.json             # Skill aliases (react → reactjs)
│   │   ├── benchmarks.json          # Role requirement maps
│   │   ├── salaries.json            # Indian market salary data (LPA)
│   │   ├── courses.json             # Course recommendations per skill
│   │   └── jobs.json                # Mock job market demand data
│   ├── .env.example
│   └── package.json
│
└── README.md
```

---

## 🔑 Environment Variables

### Client (`client/.env.local`)
| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | ✅ | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Supabase anon public key |
| `VITE_API_URL` | ✅ | Backend URL (Render in prod, localhost:5000 in dev) |
| `VITE_ADZUNA_APP_ID` | ❌ | Optional: Live job market data |
| `VITE_ADZUNA_APP_KEY` | ❌ | Optional: Live job market data |

### Server (`server/.env`)
| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | ✅ | Server port (default: 5000) |
| `OPENROUTER_API_KEY` | ✅ | Free at openrouter.ai — 200 req/day |
| `OPENAI_API_KEY` | ❌ | Optional: Enables GPT-4o-mini for resume summaries |

---

## 🧠 Key Technical Decisions

### Why localStorage + Supabase (not just a database)?
Offline-first design means the app works without any backend or internet. Supabase syncs data across devices when the user is logged in. This is a deliberate architectural choice — not a limitation.

### Why rule-based fallback instead of requiring an API key?
The app is fully functional without any API keys. The rule-based engine matches skills against a static dataset of 150+ skills with aliases, computes ROI scores, and generates roadmaps deterministically. AI features are an enhancement, not a dependency.

### Why client-side scoring formula for interviews?
Letting an LLM guess a composite score leads to inconsistent, inflated results. The final score is mathematically computed:
```
Score = (Accuracy × 0.40) + (Completeness × 0.25) + (Clarity × 0.15) + (Depth × 0.20)
```
The AI evaluates each axis independently. The math runs on the client.

### Why prefetch interview hints?
When a flashcard displays, the app silently fetches hints and answer outlines in the background (after a 1-second debounce). When the user clicks "Show Hint", it's instant — loaded from the LRU cache.

---

## 🛣️ Roadmap

- [ ] Company-specific interview question sets (Google, Microsoft, Amazon)
- [ ] MongoDB persistence layer for full backend data storage
- [ ] GitHub integration — auto-import projects from your repos
- [ ] Resume bullet point AI improver
- [ ] Daily AI coaching tip via email (Resend API)
- [ ] Mobile app (React Native)

---

## 🤝 Contributing

Contributions are welcome. Please open an issue first to discuss what you'd like to change.

```bash
# Fork the repo
# Create your feature branch
git checkout -b feature/your-feature-name

# Commit your changes
git commit -m 'feat: add your feature'

# Push and open a Pull Request
git push origin feature/your-feature-name
```

---

## 👨‍💻 Author

**Vikram Kumar**
- B.Tech Computer Science · Shobhit University, Meerut (2024–2028)
- Targeting backend engineering roles at Microsoft and top product companies
- Building in public from a tier-3 college

LinkedIn :- https://linkedin.com/in/kumar-vikram-aditya-225031309
GitHub :- https://github.com/Vikram-kumar-7

---

## 📄 License

MIT License — free to use, modify, and distribute.

**If this helped you, give it a ⭐ — it means a lot from a tier-2 college student building in public.**

EOF
