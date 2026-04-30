# SkillGap Analyzer

AI-powered skill gap analysis tool that compares your resume against job descriptions to identify missing skills, market demand, ROI scores, and generates personalized learning roadmaps.

## Architecture

```
├── client/          # React + Vite + Tailwind frontend
└── server/          # Node.js + Express backend
```

## Quick Start

### 1. Start the Backend
```bash
cd server
npm install
npm run dev
```

### 2. Start the Frontend
```bash
cd client
npm install
npm run dev
```

### 3. (Optional) Add OpenAI Key
Create `server/.env`:
```
OPENAI_API_KEY=your_key_here
```
Without an API key, the app uses a rule-based analysis engine that still provides comprehensive insights.

## Features

- **PDF Resume Parsing** — Upload any resume PDF
- **Deterministic Skill Extraction** — 150+ curated skills matched against resume & job description
- **Market Demand Analysis** — Based on 70+ job listing dataset
- **Skill ROI Scoring** — Composite score factoring demand, salary, difficulty, and growth
- **Phased Learning Roadmap** — Skills prioritized by ROI with course recommendations
- **AI Insights** — OpenAI-powered (with rule-based fallback) resume tips and interview prep

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React, Vite, Tailwind CSS v4, Recharts, Lucide Icons |
| Backend | Node.js, Express, Multer, pdf-parse |
| AI | OpenAI GPT-4o-mini (optional) |
| Data | Curated JSON datasets (skills, jobs, courses, salaries) |
