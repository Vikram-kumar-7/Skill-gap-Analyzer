# SkillGap Analyzer

SkillGap Analyzer Banner
<img width="220" height="85" alt="image" src="https://github.com/user-attachments/assets/6e058e24-f2e2-4b21-83d9-8b3d0679e706" />
DashBoard :- <img width="1280" height="625" alt="image" src="https://github.com/user-attachments/assets/570a372a-55f9-4df5-a005-505232ac37c8" />
projects page :- <img width="1578" height="888" alt="{3E4727EA-51AC-4EF0-9A19-2C1DD0F594BE}" src="https://github.com/user-attachments/assets/064bd1cb-6969-4e0d-a66a-f07544287377" />
new analysis page :- <img width="1568" height="876" alt="{DC14C11A-4429-47CE-8876-BFE43029B733}" src="https://github.com/user-attachments/assets/a598e7f1-2745-4ceb-aeae-293a3acb7795" />
learning roadmap page :- <img width="1553" height="890" alt="{11C15B9D-5501-413A-9029-B05AB4505F09}" src="https://github.com/user-attachments/assets/74f9907f-ac50-404b-a4b5-8a93b318b411" />
# SkillGap Analyzer

<div align="center">

![SkillGap Analyzer Banner](https://img.shields.io/badge/SkillGap-Analyzer-6366f1?style=for-the-badge&logo=lightning&logoColor=white)

# SkillGap Analyzer

**The career intelligence platform that tells you exactly what to learn next — and why.**

[![Live Demo](https://img.shields.io/badge/Live_Demo-Visit_App-6366f1?style=for-the-badge)](https://skill-gap-analyzer-henna.vercel.app)
[![React](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com)

---

## What is this?

SkillGap Analyzer is a full-stack career intelligence platform for developers and CS students. Upload your resume, paste a job description, and instantly get:

- Skill match percentage against your target role
- 12-week personalized roadmap with ROI-ranked skills
- AI mock interviews with 4-axis scoring and follow-up questions
- Salary projection showing exactly how much each skill is worth learning
- Project recommendations matched to your skill gaps

> Built by a B.Tech CSE student targeting backend engineering roles at Microsoft.

---

## Features

### Resume Parser and Skill Gap Analysis
- Upload PDF resume or paste raw text
- Compares your skillset against 150+ skills and their aliases
- Generates exact match percentage vs benchmark role or custom job description
- Identifies present vs missing skills with market demand data

### ROI-Ranked Learning Roadmap
- 3-phase Kanban board: High-Impact, Growth, Nice-to-Have
- Each skill ranked by ROI formula: demand x salary_boost / difficulty
- Embedded course links (Coursera, Udemy, freeCodeCamp, YouTube)
- Progress tracking with milestone check-offs

### AI Mock Interviewer
- 60+ questions across Technical, Behavioral, System Design
- Flashcard interface with answer reveal and keyboard navigation
- 4-axis scoring rubric (client-side formula, not AI-guessed):
  - Accuracy 40% + Completeness 25% + Clarity 15% + Depth 20%
- Developer history context injection — AI remembers your weak areas across sessions
- Zero-click prefetching: hints load in background before you click
- LRU cache with 60-minute TTL prevents redundant API calls

### Career Simulator
- Salary projection before vs after learning roadmap skills
- Side-by-side role comparison (e.g. Frontend vs DevOps)
- ROI bar chart per missing skill
- Indian market salary data (LPA) from curated dataset (Based on a snapshot of 400 job postings analyzed in June 2026)

### Project Tracker and Recommendations
- Track your portfolio projects with status, tech stack, GitHub links
- 80+ AI-recommended project ideas matched to your skill gaps
- Seeded shuffle — completely different 6 projects on every refresh
- One-click Add to Projects from recommendations

### Auth and Sync
- Magic link login via Supabase (no password needed)
- Cross-device data sync via Supabase PostgreSQL
- Offline-first: full app works without login via localStorage
- Row Level Security — users never see each other's data

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, Tailwind CSS v4 |
| Routing | React Router DOM v7 |
| Charts | Recharts |
| Backend | Node.js, Express |
| PDF Parsing | Multer, pdf-parse |
| Auth + DB | Supabase (Magic Link + PostgreSQL) |
| AI Primary | OpenRouter (Gemma-4-31b-it:free) |
| AI Fallback | OpenAI GPT-4o-mini |
| AI Failsafe | Rule-based engine (no API key needed) |
| Deployment | Vercel (frontend), Render (backend) |

---

## Architecture

```
Client (React/Vite)
    |
    | /api/*
    |
Server (Node/Express)
    |
    |-----> pdfService -> skillExtractor -> comparisonEngine
    |-----> marketAnalyzer -> roadmapGenerator
    |-----> aiService (OpenRouter -> OpenAI -> Rule-based fallback)
    |
    |-----> Supabase (Auth + PostgreSQL)
```

### AI Failover Chain

```
UI Request
    |
    v
[1] Backend proxy /api/ai/chat  -- success --> Response
    | fails or timeout 12s
    v
[2] OpenRouter direct (Gemma-4-31b-it:free)  -- success --> Response
    | fails or timeout 25s
    v
[3] Rule-based fallback engine  -----------------------------> Response
```

### Interview Scoring Formula

The final score is mathematically computed on the client — not guessed by AI:

```
Score = (Accuracy x 0.40) + (Completeness x 0.25) + (Clarity x 0.15) + (Depth x 0.20)
```

The AI evaluates each axis independently. The math runs client-side for consistency.

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm
- Supabase account (free)
- OpenRouter API key (free — 200 requests/day at openrouter.ai)

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

```
PORT=5000
OPENROUTER_API_KEY=your-openrouter-key
OPENAI_API_KEY=your-openai-key-optional
```

```bash
npm run dev
```

Server runs at http://localhost:5000

### 3. Setup the Frontend

```bash
cd client
npm install
cp .env.example .env.local
```

Edit `client/.env.local`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:5000
```

```bash
npm run dev
```

App runs at http://localhost:5173

### 4. Setup Supabase

Run this in your Supabase SQL Editor:

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

Set Site URL in Supabase Authentication settings:

```
http://localhost:5173
```

---

## Deployment

### Frontend on Vercel

```
Root Directory: client
Build Command: npm run build
Output Directory: dist

Environment Variables:
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=https://your-render-app.onrender.com
```

### Backend on Render

```
Root Directory: server
Build Command: npm install
Start Command: node app.js

Environment Variables:
PORT=5000
OPENROUTER_API_KEY=your-key
OPENAI_API_KEY=your-key-optional
```

---

## Project Structure

```
Skill-gap-Analyzer/
|
|-- client/
|   |-- src/
|   |   |-- pages/
|   |   |   |-- LoginPage.jsx
|   |   |   |-- DashboardPage.jsx
|   |   |   |-- NewAnalysisPage.jsx
|   |   |   |-- AnalysesPage.jsx
|   |   |   |-- RoadmapPage.jsx
|   |   |   |-- SkillTrackerPage.jsx
|   |   |   |-- CareerSimPage.jsx
|   |   |   |-- InterviewPage.jsx
|   |   |   |-- ProjectsPage.jsx
|   |   |   `-- SettingsPage.jsx
|   |   |-- components/
|   |   |   |-- Sidebar.jsx
|   |   |   |-- TopBar.jsx
|   |   |   `-- ProjectRecommendations.jsx
|   |   |-- services/
|   |   |   |-- aiService.js
|   |   |   `-- interviewAI.js
|   |   `-- utils/
|   |       |-- analysisEngine.js
|   |       |-- userHistory.js
|   |       |-- aiCache.js
|   |       |-- storage.js
|   |       `-- supabase.js
|   |-- .env.example
|   `-- package.json
|
`-- server/
    |-- routes/
    |   |-- analyzeRoutes.js
    |   `-- aiRoutes.js
    |-- controllers/
    |   `-- analyzeController.js
    |-- services/
    |   |-- pdfService.js
    |   |-- skillExtractor.js
    |   |-- comparisonEngine.js
    |   |-- marketAnalyzer.js
    |   |-- roadmapGenerator.js
    |   `-- aiService.js
    |-- data/
    |   |-- skills.json
    |   |-- aliases.json
    |   |-- benchmarks.json
    |   |-- salaries.json
    |   |-- courses.json
    |   `-- jobs.json
    |-- .env.example
    `-- package.json
```

---

## Environment Variables

### Client (client/.env.local)

| Variable | Required | Description |
|----------|----------|-------------|
| VITE_SUPABASE_URL | Yes | Your Supabase project URL |
| VITE_SUPABASE_ANON_KEY | Yes | Supabase anon public key |
| VITE_API_URL | Yes | Backend URL |
| VITE_ADZUNA_APP_ID | No | Optional live job market data |
| VITE_ADZUNA_APP_KEY | No | Optional live job market data |

### Server (server/.env)

| Variable | Required | Description |
|----------|----------|-------------|
| PORT | Yes | Server port (default 5000) |
| OPENROUTER_API_KEY | Yes | Free at openrouter.ai |
| OPENAI_API_KEY | No | Optional GPT-4o-mini for resume summaries |

---

## Key Technical Decisions

**Why localStorage + Supabase and not just a database?**
Offline-first design means the app works without any backend or internet. Supabase syncs data across devices when the user is logged in. Deliberate architectural choice, not a limitation.

**Why rule-based fallback instead of requiring an API key?**
The app is fully functional without any API keys. The rule-based engine matches skills against 150+ skills with aliases, computes ROI scores, and generates roadmaps deterministically. AI is an enhancement, not a dependency.

**Why client-side scoring formula for interviews?**
Letting an LLM guess a composite score leads to inconsistent results. The final score is mathematically computed on the client across 4 axes. The AI evaluates each axis independently — the math runs client-side.

**Why prefetch interview hints?**
When a flashcard displays, the app silently fetches hints in the background after a 1-second debounce. When the user clicks Show Hint, it renders instantly from the LRU cache — zero network wait.

**Why is there a Mongoose and Redis/BullMQ in-memory fallback?**
To keep development and setup lightweight, the backend features a graceful database and task queue fallback. If local MongoDB or Redis instances are not running, the server automatically transitions to an in-memory map cache and asynchronous queue.
*Note on Persistence:* This fallback is designed strictly as a **development convenience** to facilitate rapid local prototyping and offline demos. Because in-memory states are ephemeral and clear on server restart, a persistent MongoDB and Redis instance are required in production to support durable caching of parsed profile metrics.

---

## Roadmap

- [ ] Company-specific interview question sets (Google, Microsoft, Amazon)
- [x] MongoDB persistence for full backend data storage (with graceful local memory fallback)
- [x] GitHub integration to auto-import your repos as projects (via GitHub Intelligence Engine)
- [ ] Resume bullet point AI improver
- [ ] Daily AI coaching tip via email

---

## Author

**Vikram Kumar**

B.Tech Computer Science, Shobhit University Meerut (2024-2028)
Targeting backend engineering roles at Microsoft and top product companies.
Building in public from a tier-3 college.

- LinkedIn: https://linkedin.com/in/kumar-vikram-aditya-225031309
- GitHub: https://github.com/Vikram-kumar-7

---

## License

MIT License — free to use, modify, and distribute.

---

If this helped you, give it a star. It means a lot from a tier-2 college student building in public.
