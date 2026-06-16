// ============================================================
// src/components/ProjectRecommendations.jsx
// Drop this component into your ProjectsPage
// Usage: <ProjectRecommendations userSkills={["react","nodejs","mongodb"]} />
// ============================================================
import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Zap, ExternalLink, Plus, ChevronRight, Sparkles } from 'lucide-react';

// ── Full project database — 80+ projects across stacks ──
const PROJECT_DB = [
  // ── React + Node ──
  {
    id: 1,
    title: 'Dev Blog Platform',
    stack: ['react', 'nodejs', 'mongodb', 'express'],
    difficulty: 'Intermediate',
    time: '2-3 weeks',
    idea: 'Full markdown blog with auth, comments, tags, and RSS feed.',
    tags: ['fullstack', 'content'],
  },
  {
    id: 2,
    title: 'Real-time Chat App',
    stack: ['react', 'nodejs', 'socket.io', 'mongodb'],
    difficulty: 'Intermediate',
    time: '1-2 weeks',
    idea: 'WhatsApp-style chat with rooms, typing indicators, and read receipts.',
    tags: ['realtime', 'messaging'],
  },
  {
    id: 3,
    title: 'Job Board Aggregator',
    stack: ['react', 'nodejs', 'puppeteer', 'redis'],
    difficulty: 'Advanced',
    time: '3-4 weeks',
    idea: 'Scrape 5 job sites, deduplicate, filter by skills, email digest daily.',
    tags: ['scraping', 'productivity'],
  },
  {
    id: 4,
    title: 'URL Shortener with Analytics',
    stack: ['react', 'nodejs', 'redis', 'postgresql'],
    difficulty: 'Beginner',
    time: '3-5 days',
    idea: 'Bit.ly clone with click maps, referrer tracking, and QR code export.',
    tags: ['tools', 'analytics'],
  },
  {
    id: 5,
    title: 'Code Snippet Manager',
    stack: ['react', 'nodejs', 'mongodb', 'highlight.js'],
    difficulty: 'Beginner',
    time: '1 week',
    idea: 'GitHub Gists alternative with folders, tags, and syntax highlighting for 40+ languages.',
    tags: ['tools', 'developer'],
  },
  {
    id: 6,
    title: 'Invoice Generator',
    stack: ['react', 'nodejs', 'pdf-lib', 'mongodb'],
    difficulty: 'Intermediate',
    time: '1-2 weeks',
    idea: 'Create, send, and track invoices. Auto-PDF export, payment status, client portal.',
    tags: ['business', 'tools'],
  },
  {
    id: 7,
    title: 'Habit Tracker',
    stack: ['react', 'nodejs', 'mongodb', 'recharts'],
    difficulty: 'Beginner',
    time: '1 week',
    idea: 'Daily habit streaks with heatmap calendar, reminder emails, and weekly reports.',
    tags: ['productivity', 'health'],
  },
  {
    id: 8,
    title: 'Portfolio CMS',
    stack: ['react', 'nodejs', 'mongodb', 'cloudinary'],
    difficulty: 'Intermediate',
    time: '2 weeks',
    idea: 'Admin panel to manage your portfolio projects, skills, blog. Deploy as your actual site.',
    tags: ['meta', 'portfolio'],
  },
  {
    id: 9,
    title: 'Recipe Sharing App',
    stack: ['react', 'nodejs', 'mongodb', 'cloudinary'],
    difficulty: 'Beginner',
    time: '1-2 weeks',
    idea: 'Upload recipes with photos, nutrition auto-calc, shopping list export.',
    tags: ['food', 'social'],
  },
  {
    id: 10,
    title: 'Event Management System',
    stack: ['react', 'nodejs', 'mongodb', 'stripe'],
    difficulty: 'Advanced',
    time: '3-4 weeks',
    idea: 'Create events, sell tickets via Stripe, QR check-in, attendee dashboard.',
    tags: ['events', 'fullstack'],
  },

  // ── Next.js ──
  {
    id: 11,
    title: 'E-commerce Storefront',
    stack: ['nextjs', 'typescript', 'stripe', 'prisma'],
    difficulty: 'Advanced',
    time: '4-5 weeks',
    idea: 'Full shop with cart, Stripe checkout, order history, and admin inventory panel.',
    tags: ['ecommerce', 'fullstack'],
  },
  {
    id: 12,
    title: 'SaaS Landing Page Builder',
    stack: ['nextjs', 'typescript', 'tailwind'],
    difficulty: 'Intermediate',
    time: '2 weeks',
    idea: 'Drag-drop sections to build landing pages. Export as static HTML.',
    tags: ['saas', 'builder'],
  },
  {
    id: 13,
    title: 'Newsletter Platform',
    stack: ['nextjs', 'postgresql', 'resend', 'prisma'],
    difficulty: 'Intermediate',
    time: '2-3 weeks',
    idea: 'Write + send newsletters. Subscriber list, open-rate tracking, unsubscribe handling.',
    tags: ['email', 'content'],
  },
  {
    id: 14,
    title: 'Multi-tenant SaaS Starter',
    stack: ['nextjs', 'prisma', 'stripe', 'postgresql'],
    difficulty: 'Advanced',
    time: '5-6 weeks',
    idea: 'Org-based auth, per-tenant data isolation, subscription billing, usage limits.',
    tags: ['saas', 'architecture'],
  },
  {
    id: 15,
    title: 'Documentation Site',
    stack: ['nextjs', 'mdx', 'tailwind', 'algolia'],
    difficulty: 'Beginner',
    time: '1 week',
    idea: 'MDX-powered docs with search, versioning, dark mode, and auto-generated sidebar.',
    tags: ['docs', 'content'],
  },

  // ── Python / FastAPI / Django ──
  {
    id: 16,
    title: 'REST API with Auth',
    stack: ['python', 'fastapi', 'postgresql', 'jwt'],
    difficulty: 'Beginner',
    time: '4-6 days',
    idea: 'Complete CRUD API with JWT auth, rate limiting, Swagger docs, and Docker setup.',
    tags: ['backend', 'api'],
  },
  {
    id: 17,
    title: 'Expense Tracker API',
    stack: ['python', 'fastapi', 'postgresql', 'pandas'],
    difficulty: 'Intermediate',
    time: '1-2 weeks',
    idea: 'Track expenses, categorize automatically with ML, export CSV/PDF reports.',
    tags: ['finance', 'api'],
  },
  {
    id: 18,
    title: 'Web Scraper Dashboard',
    stack: ['python', 'scrapy', 'fastapi', 'react'],
    difficulty: 'Intermediate',
    time: '2 weeks',
    idea: 'Schedule scrapers via UI, visualize results, export data, handle anti-bot detection.',
    tags: ['scraping', 'data'],
  },
  {
    id: 19,
    title: 'Discord Bot',
    stack: ['python', 'discord.py', 'postgresql'],
    difficulty: 'Beginner',
    time: '3-5 days',
    idea: 'Moderation bot with custom commands, leveling system, welcome cards, and slash commands.',
    tags: ['bot', 'automation'],
  },
  {
    id: 20,
    title: 'Data Pipeline Dashboard',
    stack: ['python', 'airflow', 'postgresql', 'react'],
    difficulty: 'Advanced',
    time: '3-4 weeks',
    idea: 'Visual ETL pipeline builder. Schedule jobs, monitor runs, alert on failures.',
    tags: ['data', 'pipeline'],
  },

  // ── AI / ML ──
  {
    id: 21,
    title: 'Resume Parser',
    stack: ['python', 'openai api', 'fastapi', 'react'],
    difficulty: 'Intermediate',
    time: '1-2 weeks',
    idea: 'Upload PDF resume → structured JSON. Extract skills, experience, education automatically.',
    tags: ['ai', 'hr'],
  },
  {
    id: 22,
    title: 'AI Study Notes Generator',
    stack: ['python', 'openai api', 'react', 'mongodb'],
    difficulty: 'Intermediate',
    time: '1-2 weeks',
    idea: 'Paste any text → AI generates flashcards, summaries, quiz questions.',
    tags: ['ai', 'education'],
  },
  {
    id: 23,
    title: 'Sentiment Analysis Dashboard',
    stack: ['python', 'scikit-learn', 'fastapi', 'react'],
    difficulty: 'Intermediate',
    time: '2 weeks',
    idea: 'Analyze Twitter/product reviews. Real-time chart of sentiment over time.',
    tags: ['ml', 'analytics'],
  },
  {
    id: 24,
    title: 'Image Caption Generator',
    stack: ['python', 'pytorch', 'fastapi', 'react'],
    difficulty: 'Advanced',
    time: '3 weeks',
    idea: 'Upload image → AI generates caption + hashtags. Batch processing + clipboard copy.',
    tags: ['ml', 'vision'],
  },
  {
    id: 25,
    title: 'Chat with Your PDF',
    stack: ['python', 'langchain', 'openai api', 'react'],
    difficulty: 'Advanced',
    time: '2-3 weeks',
    idea: 'Upload any PDF, ask questions in natural language, get cited answers.',
    tags: ['ai', 'rag'],
  },
  {
    id: 26,
    title: 'Code Review Bot',
    stack: ['python', 'openai api', 'github api', 'fastapi'],
    difficulty: 'Advanced',
    time: '3 weeks',
    idea: 'GitHub webhook → AI reviews every PR. Posts inline comments, suggests improvements.',
    tags: ['ai', 'devtools'],
  },
  {
    id: 27,
    title: 'Fake News Detector',
    stack: ['python', 'scikit-learn', 'fastapi', 'react'],
    difficulty: 'Intermediate',
    time: '2 weeks',
    idea: 'Classify articles as real/fake. Confidence score, source analysis, bias indicators.',
    tags: ['ml', 'nlp'],
  },
  {
    id: 28,
    title: 'AI Mock Interviewer',
    stack: ['python', 'openai api', 'react', 'fastapi'],
    difficulty: 'Advanced',
    time: '3-4 weeks',
    idea: 'Paste JD → AI asks relevant questions → evaluates answers → score report.',
    tags: ['ai', 'career'],
  },

  // ── DevOps / Docker ──
  {
    id: 29,
    title: 'CI/CD Pipeline Visualizer',
    stack: ['docker', 'nodejs', 'react', 'github actions'],
    difficulty: 'Advanced',
    time: '3 weeks',
    idea: 'Visual graph of your pipeline stages. Status badges, logs, deploy history.',
    tags: ['devops', 'visualization'],
  },
  {
    id: 30,
    title: 'Container Health Monitor',
    stack: ['docker', 'nodejs', 'react', 'prometheus'],
    difficulty: 'Advanced',
    time: '2-3 weeks',
    idea: 'Monitor all running containers. CPU/memory charts, restart alerts, log streaming.',
    tags: ['devops', 'monitoring'],
  },
  {
    id: 31,
    title: 'Self-hosted Uptime Monitor',
    stack: ['docker', 'nodejs', 'react', 'postgresql'],
    difficulty: 'Intermediate',
    time: '1-2 weeks',
    idea: 'Ping your services every minute. Status page, incident history, SMS/email alerts.',
    tags: ['devops', 'tools'],
  },

  // ── Database heavy ──
  {
    id: 32,
    title: 'Analytics Platform',
    stack: ['postgresql', 'nodejs', 'react', 'recharts'],
    difficulty: 'Advanced',
    time: '4 weeks',
    idea: 'Custom event tracking (like Mixpanel). Funnel analysis, retention charts, cohorts.',
    tags: ['analytics', 'saas'],
  },
  {
    id: 33,
    title: 'Search Engine (Mini)',
    stack: ['elasticsearch', 'nodejs', 'react'],
    difficulty: 'Advanced',
    time: '3-4 weeks',
    idea: 'Index any website. Full-text search with filters, facets, typo tolerance.',
    tags: ['search', 'infrastructure'],
  },
  {
    id: 34,
    title: 'Database Query Builder UI',
    stack: ['react', 'nodejs', 'postgresql', 'mongodb'],
    difficulty: 'Intermediate',
    time: '2 weeks',
    idea: 'Visual query builder. No SQL needed. Export results as CSV/JSON.',
    tags: ['devtools', 'database'],
  },

  // ── Vue / Angular ──
  {
    id: 35,
    title: 'Finance Dashboard',
    stack: ['vue', 'nodejs', 'postgresql', 'recharts'],
    difficulty: 'Intermediate',
    time: '2-3 weeks',
    idea: 'Connect bank accounts (mock), track spending, budget goals, monthly trends.',
    tags: ['finance', 'dashboard'],
  },
  {
    id: 36,
    title: 'Project Management Tool',
    stack: ['vue', 'nodejs', 'mongodb', 'socket.io'],
    difficulty: 'Advanced',
    time: '4 weeks',
    idea: 'Trello-like boards with drag-drop, deadlines, assignees, and real-time updates.',
    tags: ['productivity', 'realtime'],
  },
  {
    id: 37,
    title: 'Admin Dashboard Template',
    stack: ['angular', 'typescript', 'nodejs', 'postgresql'],
    difficulty: 'Intermediate',
    time: '2 weeks',
    idea: 'Reusable admin UI. CRUD tables, charts, user management, permission roles.',
    tags: ['template', 'fullstack'],
  },

  // ── Mobile-adjacent ──
  {
    id: 38,
    title: 'Progressive Web App (PWA)',
    stack: ['react', 'typescript', 'service workers'],
    difficulty: 'Intermediate',
    time: '2 weeks',
    idea: 'Offline-first PWA. Push notifications, installable, background sync.',
    tags: ['mobile', 'pwa'],
  },
  {
    id: 39,
    title: 'QR Code Generator App',
    stack: ['react', 'nodejs'],
    difficulty: 'Beginner',
    time: '2-3 days',
    idea: 'Generate QR codes for URLs, vCards, WiFi, events. Download PNG/SVG.',
    tags: ['tools', 'beginner'],
  },
  {
    id: 40,
    title: 'Browser Extension',
    stack: ['javascript', 'chrome extension api'],
    difficulty: 'Intermediate',
    time: '1-2 weeks',
    idea: 'Tab manager / productivity tracker / custom new-tab. Publish to Chrome Store.',
    tags: ['browser', 'tools'],
  },

  // ── Cloud / AWS ──
  {
    id: 41,
    title: 'Serverless Image Optimizer',
    stack: ['aws', 'nodejs', 'react'],
    difficulty: 'Intermediate',
    time: '1-2 weeks',
    idea: 'Upload image → Lambda resizes/compresses → S3 stores → CDN serves. Cost dashboard.',
    tags: ['aws', 'serverless'],
  },
  {
    id: 42,
    title: 'Cloud Cost Analyzer',
    stack: ['aws', 'python', 'react'],
    difficulty: 'Advanced',
    time: '2-3 weeks',
    idea: 'Fetch AWS bills, visualize per-service costs, forecast next month, alert on spikes.',
    tags: ['aws', 'finops'],
  },

  // ── Redis ──
  {
    id: 43,
    title: 'Rate Limiter Service',
    stack: ['redis', 'nodejs', 'express'],
    difficulty: 'Intermediate',
    time: '3-5 days',
    idea: 'Reusable rate-limiting middleware. Sliding window algorithm. Dashboard to monitor.',
    tags: ['backend', 'infrastructure'],
  },
  {
    id: 44,
    title: 'Leaderboard System',
    stack: ['redis', 'nodejs', 'react'],
    difficulty: 'Beginner',
    time: '3-5 days',
    idea: 'Real-time leaderboard with scores, ranks, and history. Handles 10k+ concurrent users.',
    tags: ['gaming', 'realtime'],
  },

  // ── Stripe / payments ──
  {
    id: 45,
    title: 'Subscription Billing System',
    stack: ['nodejs', 'stripe', 'react', 'postgresql'],
    difficulty: 'Advanced',
    time: '3-4 weeks',
    idea: 'Plan management, upgrade/downgrade, proration, invoice history, webhook events.',
    tags: ['saas', 'billing'],
  },
  {
    id: 46,
    title: 'Digital Product Marketplace',
    stack: ['nextjs', 'stripe', 'prisma', 'cloudinary'],
    difficulty: 'Advanced',
    time: '4-5 weeks',
    idea: 'Sell digital files (PDFs, templates, code). Instant delivery on payment.',
    tags: ['ecommerce', 'marketplace'],
  },

  // ── GraphQL ──
  {
    id: 47,
    title: 'Social Feed API',
    stack: ['graphql', 'nodejs', 'postgresql', 'redis'],
    difficulty: 'Advanced',
    time: '3 weeks',
    idea: 'Twitter-like API in GraphQL. Subscriptions for live feed, N+1 solved with DataLoader.',
    tags: ['api', 'social'],
  },
  {
    id: 48,
    title: 'Headless CMS',
    stack: ['graphql', 'nodejs', 'mongodb', 'react'],
    difficulty: 'Advanced',
    time: '4 weeks',
    idea: 'Define content types, manage entries, query via GraphQL. Like Contentful, self-hosted.',
    tags: ['cms', 'api'],
  },

  // ── TypeScript focused ──
  {
    id: 49,
    title: 'CLI Tool',
    stack: ['typescript', 'nodejs'],
    difficulty: 'Intermediate',
    time: '1-2 weeks',
    idea: 'Build a useful dev CLI (scaffolder, file converter, API tester). Publish to npm.',
    tags: ['cli', 'tools'],
  },
  {
    id: 50,
    title: 'Type-Safe ORM from Scratch',
    stack: ['typescript', 'postgresql'],
    difficulty: 'Advanced',
    time: '3-4 weeks',
    idea: 'Build a mini-Prisma. Query builder with full type inference. Good for interviews.',
    tags: ['typescript', 'deep-dive'],
  },
];

// ── Skill matching engine ──
function matchScore(project, userSkills) {
  if (!userSkills?.length) return Math.random(); // random if no skills
  const norm = (s) => s.toLowerCase().replace(/[.\s-]/g, '');
  const userNorm = userSkills.map(norm);
  const matched = project.stack.filter((s) =>
    userNorm.some((u) => norm(s).includes(u) || u.includes(norm(s)))
  ).length;
  const partial = project.stack.filter((s) =>
    userNorm.some((u) => norm(s).slice(0, 4) === u.slice(0, 4))
  ).length;
  return (matched * 2 + partial) / project.stack.length;
}

// ── Seeded shuffle — different every page load, never same order twice ──
function seededShuffle(arr, seed) {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getRecommendations(userSkills, seed, count = 6) {
  const scored = PROJECT_DB.map((p) => ({
    ...p,
    score: matchScore(p, userSkills) + Math.random() * 0.3, // blend match + randomness
  }));

  // Shuffle with seed for variety, then sort by score within shuffle
  const shuffled = seededShuffle(scored, seed);

  // Pick diverse set — no more than 3 from same difficulty
  const picks = [];
  const diffCount = { Beginner: 0, Intermediate: 0, Advanced: 0 };

  for (const p of shuffled) {
    if (picks.length >= count) break;
    if (diffCount[p.difficulty] >= 3) continue;
    picks.push(p);
    diffCount[p.difficulty]++;
  }

  // Fill remaining if needed
  for (const p of shuffled) {
    if (picks.length >= count) break;
    if (!picks.find((x) => x.id === p.id)) picks.push(p);
  }

  return picks.slice(0, count);
}

const DIFF_STYLE = {
  Beginner: { bg: 'rgba(16,185,129,0.12)', color: '#10b981', border: 'rgba(16,185,129,0.25)' },
  Intermediate: { bg: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: 'rgba(251,191,36,0.25)' },
  Advanced: { bg: 'rgba(248,113,113,0.12)', color: '#f87171', border: 'rgba(248,113,113,0.25)' },
};

const STACK_COLORS = {
  react: '#61dafb',
  nextjs: '#fff',
  vue: '#42b883',
  angular: '#dd0031',
  nodejs: '#68a063',
  python: '#3572a5',
  typescript: '#3178c6',
  javascript: '#f7df1e',
  mongodb: '#47a248',
  postgresql: '#336791',
  redis: '#dc382d',
  docker: '#2496ed',
  aws: '#ff9900',
  stripe: '#635bff',
  graphql: '#e10098',
  fastapi: '#009688',
  default: '#6366f1',
};

function stackColor(tech) {
  const key = Object.keys(STACK_COLORS).find((k) => tech.toLowerCase().includes(k));
  return STACK_COLORS[key] || STACK_COLORS.default;
}

export default function ProjectRecommendations({ userSkills = [], onAddToProjects }) {
  const [seed, setSeed] = useState(() => Date.now());
  const [recs, setRecs] = useState([]);
  const [spinning, setSpinning] = useState(false);
  const [addedIds, setAddedIds] = useState(new Set());

  const refresh = useCallback(
    (newSeed) => {
      setSpinning(true);
      setTimeout(() => {
        setRecs(getRecommendations(userSkills, newSeed));
        setSpinning(false);
      }, 350);
    },
    [userSkills]
  );

  useEffect(() => {
    setRecs(getRecommendations(userSkills, seed));
  }, []);

  function handleRefresh() {
    const next = Date.now();
    setSeed(next);
    refresh(next);
  }

  function handleAdd(project) {
    setAddedIds((prev) => new Set([...prev, project.id]));
    onAddToProjects?.({
      id: Date.now(),
      name: project.title,
      description: project.idea,
      techStack: project.stack,
      skills: project.stack.slice(0, 3),
      status: 'In Progress',
      github: '',
      createdAt: Date.now(),
      fromRecommendation: true,
    });
  }

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* ── Header ── */}
      <div
        className="flex flex-col xs:flex-row xs:items-center justify-between gap-4"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: 'rgba(99,102,241,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Sparkles size={14} color="#a5b4fc" />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: '#f0f4ff', fontSize: 15, fontWeight: 700, lineHeight: 1.2 }}>
              Project Ideas for You
            </div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 1 }}>
              Based on your tech stack · refreshes every time
            </div>
          </div>
        </div>

        {/* Refresh button */}
        <button
          onClick={handleRefresh}
          disabled={spinning}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 9,
            padding: '7px 14px',
            color: spinning ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.7)',
            fontSize: 12,
            fontWeight: 600,
            cursor: spinning ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s',
            flexShrink: 0,
            minHeight: '44px', // ensure 44px tap target
          }}
        >
          <RefreshCw
            size={13}
            style={{
              transform: spinning ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.35s ease',
            }}
          />
          New Ideas
        </button>
      </div>

      {/* ── Cards grid ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 12,
          opacity: spinning ? 0.4 : 1,
          transition: 'opacity 0.2s',
        }}
      >
        {recs.map((project) => {
          const diff = DIFF_STYLE[project.difficulty];
          const added = addedIds.has(project.id);
          return (
            <div
              key={project.id}
              style={{
                background: '#0e1525',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 14,
                padding: '18px 18px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                overflow: 'hidden',
                minWidth: 0,
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}
            >
              {/* Row 1: title + difficulty */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  justifyContent: 'space-between',
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    color: '#f0f4ff',
                    fontSize: 13,
                    fontWeight: 700,
                    flex: 1,
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {project.title}
                </div>
                <span
                  style={{
                    background: diff.bg,
                    color: diff.color,
                    border: `1px solid ${diff.border}`,
                    borderRadius: 9999,
                    padding: '2px 8px',
                    fontSize: 10,
                    fontWeight: 600,
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {project.difficulty}
                </span>
              </div>

              {/* Row 2: idea description */}
              <div
                style={{
                  color: 'rgba(255,255,255,0.45)',
                  fontSize: 12,
                  lineHeight: 1.6,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {project.idea}
              </div>

              {/* Row 3: tech stack pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {project.stack.slice(0, 5).map((tech) => (
                  <span
                    key={tech}
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: `1px solid ${stackColor(tech)}33`,
                      color: stackColor(tech),
                      borderRadius: 9999,
                      padding: '2px 8px',
                      fontSize: 10,
                      fontWeight: 500,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {tech}
                  </span>
                ))}
                {project.stack.length > 5 && (
                  <span
                    style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, padding: '2px 4px' }}
                  >
                    +{project.stack.length - 5}
                  </span>
                )}
              </div>

              {/* Row 4: time estimate + add button */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 2,
                  paddingTop: 10,
                  borderTop: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>
                  ⏱ {project.time}
                </span>
                <button
                  onClick={() => !added && handleAdd(project)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 5,
                    background: added ? 'rgba(16,185,129,0.12)' : 'rgba(99,102,241,0.15)',
                    border: `1px solid ${added ? 'rgba(16,185,129,0.25)' : 'rgba(99,102,241,0.3)'}`,
                    borderRadius: 8,
                    padding: '5px 12px',
                    color: added ? '#10b981' : '#a5b4fc',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: added ? 'default' : 'pointer',
                    transition: 'all 0.15s',
                    flexShrink: 0,
                    minHeight: '44px', // ensure 44px tap target
                  }}
                >
                  {added ? (
                    <>
                      <span>✓</span> Added
                    </>
                  ) : (
                    <>
                      <Plus size={11} /> Add to Projects
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <p style={{ color: 'rgba(255,255,255,0.18)', fontSize: 11, textAlign: 'center', margin: 0 }}>
        {PROJECT_DB.length}+ project ideas in the database · Click "New Ideas" for a completely
        different set
      </p>
    </section>
  );
}
