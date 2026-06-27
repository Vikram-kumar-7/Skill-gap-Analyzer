// ============================================================
// src/pages/InterviewPage.jsx
// Flashcard-style interview prep with:
//   - 60+ questions across Technical, Behavioral, System Design
//   - Shuffles on every refresh/completion — never same order twice
//   - Completion screen with "New Round" button
//   - Progress saved to localStorage
//   - Reveal answer animation
// ============================================================
import { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Sparkles,
  Trophy,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Lightbulb,
  List,
  Bot,
  ArrowRight,
  ChevronsRight,
} from 'lucide-react';
import { HistoryService } from '../utils/userHistory';
import { useAI } from '../services/useAI';
import { aiCache } from '../utils/aiCache';
import { InterviewAI } from '../services/interviewAI';

// Typewriter effect component for premium visual feel
function TypewriterText({ text, speed = 10 }) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let index = 0;
    setDisplayedText('');
    const timer = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(index));
      index++;
      if (index >= text.length) {
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return <span>{displayedText}</span>;
}

// ── Full question bank — 60+ questions ──
const QUESTION_BANK = [
  // ── Technical: JavaScript ──
  {
    id: 1,
    category: 'Technical',
    skill: 'JavaScript',
    difficulty: 'Easy',
    question: 'What is the difference between let, const, and var?',
    answer:
      "var is function-scoped and hoisted. let and const are block-scoped. const can't be reassigned but its properties (if object) can be mutated. Use const by default, let when reassignment is needed, avoid var.",
  },
  {
    id: 2,
    category: 'Technical',
    skill: 'JavaScript',
    difficulty: 'Medium',
    question: 'Explain closures with a real-world example.',
    answer:
      'A closure is a function that remembers its outer scope even after the outer function has returned. Example: a counter factory — makeCounter() returns a function that increments a private `count` variable. Each call to makeCounter() creates a separate closure with its own `count`.',
  },
  {
    id: 3,
    category: 'Technical',
    skill: 'JavaScript',
    difficulty: 'Hard',
    question:
      'How does the JavaScript event loop work? Explain call stack, microtasks, and macrotasks.',
    answer:
      'The call stack executes synchronous code. When empty, the event loop checks microtask queue (Promises, queueMicrotask) first — empties it completely. Then picks one macrotask (setTimeout, setInterval, I/O). Microtasks always run before the next macrotask. This is why Promise.resolve().then() runs before setTimeout(fn, 0).',
  },
  {
    id: 4,
    category: 'Technical',
    skill: 'JavaScript',
    difficulty: 'Medium',
    question: 'What is the difference between == and === in JavaScript?',
    answer:
      "== performs type coercion before comparison (0 == '0' is true). === checks both value AND type without coercion (0 === '0' is false). Always use === unless you explicitly need type coercion.",
  },
  {
    id: 5,
    category: 'Technical',
    skill: 'JavaScript',
    difficulty: 'Hard',
    question: 'Explain prototypal inheritance and how it differs from classical inheritance.',
    answer:
      "In JavaScript, objects inherit directly from other objects via the prototype chain (__proto__). Classical inheritance (like Java) uses classes as blueprints. In JS, every object has a prototype property. When a property isn't found on an object, JS walks up the prototype chain. ES6 classes are syntactic sugar over this.",
  },
  {
    id: 6,
    category: 'Technical',
    skill: 'JavaScript',
    difficulty: 'Medium',
    question: 'What are Promises and how do async/await improve on them?',
    answer:
      'Promises represent eventual completion/failure of async operations, avoiding callback hell. async/await is syntactic sugar — async functions always return a Promise, await pauses execution until the Promise resolves. Error handling becomes try/catch instead of .catch(). Code reads synchronously but runs asynchronously.',
  },

  // ── Technical: React ──
  {
    id: 7,
    category: 'Technical',
    skill: 'React',
    difficulty: 'Easy',
    question: 'What are React hooks and why were they introduced?',
    answer:
      "Hooks (useState, useEffect, etc.) let functional components use state and lifecycle features previously only available in class components. Introduced in React 16.8 to simplify code, avoid 'this' confusion, and enable better logic reuse via custom hooks.",
  },
  {
    id: 8,
    category: 'Technical',
    skill: 'React',
    difficulty: 'Medium',
    question: "Explain the virtual DOM and how React's reconciliation works.",
    answer:
      'React keeps a virtual DOM (lightweight JS object tree) in memory. On state change, it creates a new virtual DOM, diffs it with the previous one (reconciliation), and only updates the real DOM where differences exist. This batching minimizes expensive real DOM operations.',
  },
  {
    id: 9,
    category: 'Technical',
    skill: 'React',
    difficulty: 'Hard',
    question: "How would you optimize a React app that's rendering 10,000 list items?",
    answer:
      '1) Virtualization with react-window/react-virtual — only render visible items. 2) React.memo to prevent unnecessary re-renders. 3) useMemo/useCallback for expensive computations. 4) Key prop optimization. 5) Pagination or infinite scroll. 6) Move state down — avoid top-level re-renders.',
  },
  {
    id: 10,
    category: 'Technical',
    skill: 'React',
    difficulty: 'Medium',
    question: 'What is the difference between useEffect and useLayoutEffect?',
    answer:
      'useEffect runs asynchronously AFTER the browser has painted. useLayoutEffect runs synchronously AFTER DOM mutations but BEFORE painting. Use useLayoutEffect when you need to measure DOM elements or prevent visual flicker. In most cases, useEffect is preferred.',
  },
  {
    id: 11,
    category: 'Technical',
    skill: 'React',
    difficulty: 'Hard',
    question: "Explain React's Context API vs Redux — when would you choose each?",
    answer:
      'Context API: built-in, good for low-frequency updates (theme, auth, locale). Re-renders all consumers on change. Redux: external, better for complex state with frequent updates, DevTools, middleware, time-travel debugging. Use Context for simple global state, Redux when state logic is complex or needs performance optimization.',
  },

  // ── Technical: Node.js ──
  {
    id: 12,
    category: 'Technical',
    skill: 'Node.js',
    difficulty: 'Medium',
    question: "How does Node.js handle concurrent requests if it's single-threaded?",
    answer:
      'Node.js uses an event loop with non-blocking I/O. When a request needs I/O (DB query, file read), Node delegates to libuv (C++ thread pool) and moves on to the next request. The callback runs when I/O completes. This handles thousands of concurrent requests without threads via async operations.',
  },
  {
    id: 13,
    category: 'Technical',
    skill: 'Node.js',
    difficulty: 'Hard',
    question:
      'What is the difference between process.nextTick, setImmediate, and setTimeout(fn, 0)?',
    answer:
      'process.nextTick: runs before the event loop continues — before I/O. setImmediate: runs in the check phase, after I/O callbacks. setTimeout(fn,0): runs in the timers phase, minimum delay ~1ms. Order: nextTick → Promise microtasks → I/O → setImmediate → setTimeout.',
  },
  {
    id: 14,
    category: 'Technical',
    skill: 'Node.js',
    difficulty: 'Medium',
    question: 'How would you handle uncaught exceptions in a Node.js production app?',
    answer:
      "1) process.on('uncaughtException') — log and gracefully shutdown (don't try to resume). 2) process.on('unhandledRejection') for Promise errors. 3) Use domains for request-level error isolation. 4) Let a process manager (PM2, systemd) restart the process. 5) Never swallow errors silently.",
  },

  // ── Technical: Databases ──
  {
    id: 15,
    category: 'Technical',
    skill: 'SQL',
    difficulty: 'Medium',
    question: 'What is the difference between INNER JOIN, LEFT JOIN, and FULL OUTER JOIN?',
    answer:
      'INNER JOIN: only matching rows from both tables. LEFT JOIN: all rows from left table + matching rows from right (nulls for non-matches). RIGHT JOIN: opposite. FULL OUTER JOIN: all rows from both tables, nulls where no match.',
  },
  {
    id: 16,
    category: 'Technical',
    skill: 'Database',
    difficulty: 'Hard',
    question: 'Explain database indexing. When does an index hurt performance?',
    answer:
      "Indexes are B-tree data structures that speed up reads by avoiding full table scans. They hurt performance when: 1) Too many indexes on a write-heavy table (every INSERT/UPDATE must update indexes). 2) Index on low-cardinality column (boolean — DB may ignore it). 3) Composite index column order doesn't match query. 4) Index on small table.",
  },
  {
    id: 17,
    category: 'Technical',
    skill: 'Database',
    difficulty: 'Medium',
    question: 'What is database normalization? Explain 1NF, 2NF, 3NF.',
    answer:
      "Normalization reduces redundancy. 1NF: atomic values, no repeating groups. 2NF: 1NF + no partial dependencies (non-key columns depend on entire PK). 3NF: 2NF + no transitive dependencies (non-key column doesn't depend on another non-key column). Denormalization trades redundancy for read performance.",
  },
  {
    id: 18,
    category: 'Technical',
    skill: 'MongoDB',
    difficulty: 'Medium',
    question: 'When would you choose MongoDB over PostgreSQL?',
    answer:
      'MongoDB: flexible/evolving schema, document-oriented data (nested objects natural), horizontal scaling with sharding, rapid prototyping. PostgreSQL: ACID transactions, complex joins/relations, strict schema enforcement, financial data, reporting queries. Many apps use both — Postgres for core, MongoDB for analytics/logs.',
  },

  // ── Technical: Docker / DevOps ──
  {
    id: 19,
    category: 'Technical',
    skill: 'Docker',
    difficulty: 'Easy',
    question: 'What is the difference between a Docker image and a container?',
    answer:
      'An image is a read-only blueprint (like a class). A container is a running instance of an image (like an object). Multiple containers can run from the same image. Images are built from Dockerfiles and stored in registries.',
  },
  {
    id: 20,
    category: 'Technical',
    skill: 'Docker',
    difficulty: 'Medium',
    question: 'Explain Docker layers and how they affect image size.',
    answer:
      'Each Dockerfile instruction creates a layer. Layers are cached and shared between images. To minimize size: 1) Combine RUN commands with &&. 2) Use .dockerignore. 3) Use multi-stage builds — build in one stage, copy only artifacts to final stage. 4) Use Alpine base images. 5) Remove package manager caches in same RUN layer.',
  },
  {
    id: 21,
    category: 'Technical',
    skill: 'DevOps',
    difficulty: 'Hard',
    question: 'What is the difference between horizontal and vertical scaling? When to use each?',
    answer:
      'Vertical (scale up): bigger machine — more CPU/RAM. Simple, no code changes, limited by hardware ceiling, single point of failure. Horizontal (scale out): more machines, load balanced. Requires stateless apps or distributed state. Better fault tolerance, theoretically unlimited. Use vertical for simple/stateful apps, horizontal for high availability.',
  },

  // ── System Design ──
  {
    id: 22,
    category: 'System Design',
    skill: 'Architecture',
    difficulty: 'Hard',
    question: 'How would you design a URL shortener like bit.ly?',
    answer:
      '1) API: POST /shorten → returns short code. GET /{code} → 301 redirect. 2) Generate code: base62 encoding of auto-increment ID or random + collision check. 3) Storage: Key-value store (Redis for hot URLs, PostgreSQL for persistence). 4) Scale: CDN for redirects, read replicas for DB. 5) Analytics: async write to Kafka → consumer updates click counts.',
  },
  {
    id: 23,
    category: 'System Design',
    skill: 'Architecture',
    difficulty: 'Hard',
    question: 'Design a notification system that needs to handle 10 million users.',
    answer:
      '1) Producer: app services publish events to message queue (Kafka/SQS). 2) Consumer workers per channel (push, email, SMS). 3) User preference service: check if user wants notification, which channel. 4) Rate limiting: max N notifications/hour. 5) Delivery tracking: store notification state. 6) Retry with exponential backoff for failures.',
  },
  {
    id: 24,
    category: 'System Design',
    skill: 'Architecture',
    difficulty: 'Hard',
    question: 'How would you design a real-time collaborative document editor like Google Docs?',
    answer:
      "1) Operational Transformation (OT) or CRDT to handle concurrent edits. 2) WebSocket connections for real-time sync. 3) Operations log stored in order — clients apply missed ops on reconnect. 4) Presence service (who's online, cursor positions) via pub/sub. 5) Periodic snapshots to avoid replaying full history. 6) Redis for session state.",
  },
  {
    id: 25,
    category: 'System Design',
    skill: 'Architecture',
    difficulty: 'Hard',
    question: 'Explain the CAP theorem and its practical implications.',
    answer:
      'CAP: a distributed system can guarantee at most 2 of 3: Consistency (all nodes see same data), Availability (every request gets a response), Partition Tolerance (works despite network splits). Network partitions are inevitable, so you choose CP (consistent, may be unavailable) like MongoDB in strict mode, or AP (available, may be stale) like Cassandra.',
  },
  {
    id: 26,
    category: 'System Design',
    skill: 'Architecture',
    difficulty: 'Medium',
    question: 'What is the difference between REST, GraphQL, and gRPC?',
    answer:
      'REST: resource-based URLs, multiple endpoints, over/under-fetching common. GraphQL: single endpoint, client specifies exact data needed, great for complex UIs. gRPC: binary protocol (protobuf), strongly typed contracts, great for internal service-to-service, not browser-friendly natively. Choose REST for public APIs, GraphQL for complex frontends, gRPC for microservices.',
  },

  // ── Technical: AWS ──
  {
    id: 27,
    category: 'Technical',
    skill: 'AWS',
    difficulty: 'Medium',
    question: 'Explain the difference between EC2, Lambda, and ECS.',
    answer:
      'EC2: virtual machines — full control, always running, you manage OS. Lambda: serverless functions — event-triggered, auto-scale to zero, pay per invocation, 15min limit. ECS: container orchestration — run Docker containers, more control than Lambda, less than EC2. Choose Lambda for event-driven/short tasks, ECS for long-running containers.',
  },

  // ── Technical: TypeScript ──
  {
    id: 28,
    category: 'Technical',
    skill: 'TypeScript',
    difficulty: 'Medium',
    question: 'What are TypeScript generics and when would you use them?',
    answer:
      "Generics let you write reusable code that works with multiple types while maintaining type safety. Example: function identity<T>(arg: T): T returns the same type passed in. Use for collections, API response wrappers, utility functions. Avoid when a simple union type or any would suffice — don't over-engineer.",
  },
  {
    id: 29,
    category: 'Technical',
    skill: 'TypeScript',
    difficulty: 'Hard',
    question: "Explain TypeScript's structural typing vs nominal typing.",
    answer:
      "TypeScript uses structural typing — if two types have the same shape, they're compatible (duck typing). A class Dog with name:string is assignable to interface {name:string} even without explicit implements. Nominal typing (Java) requires explicit declaration. This means TypeScript is flexible but can cause unexpected assignability. Use branded types to simulate nominal typing.",
  },

  // ── Technical: Security ──
  {
    id: 30,
    category: 'Technical',
    skill: 'Security',
    difficulty: 'Medium',
    question: 'What is SQL injection and how do you prevent it?',
    answer:
      'SQL injection: attacker inserts malicious SQL into input fields to manipulate queries. Example: username = "admin\'--" comments out password check. Prevention: 1) Parameterized queries / prepared statements (never concatenate user input). 2) ORM that handles escaping. 3) Input validation. 4) Principle of least privilege on DB user.',
  },

  // ── Behavioral ──
  {
    id: 31,
    category: 'Behavioral',
    skill: 'Communication',
    difficulty: 'Easy',
    question: "Tell me about yourself and why you're interested in this role.",
    answer:
      "Structure: 1) Brief background (education, current status). 2) Relevant technical experience (key projects). 3) What specifically excites you about this role/company. 4) What you're looking to learn/contribute. Keep it under 2 minutes. Tailor the 'why this role' part specifically to the company.",
  },
  {
    id: 32,
    category: 'Behavioral',
    skill: 'Teamwork',
    difficulty: 'Easy',
    question: 'Describe a time you worked in a team and faced a conflict. How did you resolve it?',
    answer:
      'Use STAR format: Situation (set the scene), Task (your responsibility), Action (specific steps you took — focus on communication, empathy, finding common ground), Result (outcome + what you learned). Show you can disagree professionally and prioritize the project over ego.',
  },
  {
    id: 33,
    category: 'Behavioral',
    skill: 'Problem Solving',
    difficulty: 'Medium',
    question: "Tell me about the most challenging technical problem you've solved.",
    answer:
      "Pick a real project challenge. STAR format: explain the technical complexity, your debugging/research process, tradeoffs you considered, solution you chose and why. Emphasize your thought process over the solution itself. End with impact and what you'd do differently.",
  },
  {
    id: 34,
    category: 'Behavioral',
    skill: 'Leadership',
    difficulty: 'Medium',
    question: 'Describe a time you had to learn something quickly under pressure.',
    answer:
      'Show adaptability. STAR: what you needed to learn, timeline pressure, your strategy (official docs, tutorials, asking experts, building small prototypes), how you applied it, outcome. Demonstrates you can ramp up fast — crucial for internships and junior roles.',
  },
  {
    id: 35,
    category: 'Behavioral',
    skill: 'Work Ethic',
    difficulty: 'Easy',
    question: "What's a project you're most proud of and why?",
    answer:
      "Pick your strongest project. Cover: the problem it solves, your technical decisions and why, challenges you overcame, what makes it production-quality. Show genuine enthusiasm. Connect it to skills relevant to the role you're applying for.",
  },
  {
    id: 36,
    category: 'Behavioral',
    skill: 'Growth',
    difficulty: 'Medium',
    question: 'What is your biggest weakness and how are you working on it?',
    answer:
      "Don't say 'I work too hard.' Pick a real, relevant weakness (e.g., 'I sometimes spend too long perfecting code before getting feedback'). Show self-awareness + active improvement steps ('I now timebox tasks and share WIP early'). Avoid weaknesses that are core to the job.",
  },
  {
    id: 37,
    category: 'Behavioral',
    skill: 'Communication',
    difficulty: 'Medium',
    question: 'Where do you see yourself in 3 years?',
    answer:
      "Be specific and realistic. For a developer role: 'I want to go deep on backend systems, contribute to architecture decisions, and eventually mentor junior developers. In 3 years I see myself as a strong mid-level engineer who can own features end-to-end.' Shows ambition without being unrealistic.",
  },
  {
    id: 38,
    category: 'Behavioral',
    skill: 'Teamwork',
    difficulty: 'Easy',
    question: 'How do you handle feedback on your code during code reviews?',
    answer:
      "Show maturity: 'I treat feedback as learning, not criticism. I read every comment carefully, ask clarifying questions if I don't understand the reasoning, and apply the feedback. If I disagree, I discuss it with data/reasoning rather than dismissing it. Good code reviews have made me a better developer.'",
  },
  {
    id: 39,
    category: 'Behavioral',
    skill: 'Problem Solving',
    difficulty: 'Hard',
    question:
      "Tell me about a time you disagreed with your team's technical decision. What happened?",
    answer:
      'STAR: the decision (language choice, architecture, etc.), why you disagreed (technical reasoning), how you raised it (data, alternatives, not emotion), outcome (whether your view prevailed or not), what you did when the team went a different direction. Shows professional maturity.',
  },
  {
    id: 40,
    category: 'Behavioral',
    skill: 'Communication',
    difficulty: 'Easy',
    question: 'How do you prioritize when you have multiple tasks with the same deadline?',
    answer:
      "'I first assess impact and dependencies — what's blocking others goes first. I break tasks into subtasks, estimate rough time, and communicate early if a deadline is at risk. I use a simple priority matrix: urgency × impact. I'd rather deliver 3 things well than 5 things poorly.'",
  },

  // ── More System Design ──
  {
    id: 41,
    category: 'System Design',
    skill: 'Architecture',
    difficulty: 'Hard',
    question: 'How would you design a rate limiter?',
    answer:
      'Algorithms: 1) Fixed window counter — simple but allows 2x burst at window boundaries. 2) Sliding window log — accurate, memory heavy. 3) Token bucket — smooth, allows controlled bursts. 4) Leaky bucket — strict output rate. Implementation: Redis INCR + EXPIRE for distributed rate limiting. Return 429 with Retry-After header when exceeded.',
  },
  {
    id: 42,
    category: 'System Design',
    skill: 'Architecture',
    difficulty: 'Hard',
    question: 'Design a system to handle 1 million concurrent WebSocket connections.',
    answer:
      "1) WebSocket servers are stateful — use sticky sessions or shared pub/sub (Redis). 2) Horizontal scale WebSocket servers behind load balancer (AWS ALB supports WS). 3) Connection manager service tracks which server holds which user's connection. 4) Messages route via Redis pub/sub to correct server. 5) Monitor with heartbeats, handle reconnections gracefully.",
  },
  {
    id: 43,
    category: 'System Design',
    skill: 'Architecture',
    difficulty: 'Medium',
    question: 'Explain eventual consistency and give a real-world example.',
    answer:
      "Eventual consistency: in a distributed system, after an update, all nodes will eventually reflect it — but not immediately. Example: Instagram likes counter. When you like a post, it's written to one node, replicates async to others. You might see 1,203 likes, someone else sees 1,202 for a moment. This is acceptable — strong consistency would require cross-datacenter coordination on every like.",
  },
  {
    id: 44,
    category: 'System Design',
    skill: 'Architecture',
    difficulty: 'Hard',
    question: 'How would you design a distributed job queue?',
    answer:
      '1) Producers push jobs to queue (Redis List, SQS, RabbitMQ). 2) Workers BLPOP jobs (blocking pop), process, acknowledge. 3) If processing fails: retry with exponential backoff, dead letter queue after N retries. 4) Job status stored in Redis/DB for polling. 5) Concurrency: multiple workers, but ensure jobs are idempotent. 6) Priority queues: separate high/low priority lists.',
  },
  {
    id: 45,
    category: 'System Design',
    skill: 'Architecture',
    difficulty: 'Medium',
    question: 'What is a CDN and when should you use one?',
    answer:
      'CDN (Content Delivery Network): geographically distributed servers that cache static assets close to users. Benefits: lower latency, reduced origin server load, DDoS protection. Use for: static assets (JS, CSS, images), video streaming, large file downloads, globally distributed users. Not ideal for: highly personalized content, frequently changing data, small user base in one region.',
  },

  // ── More Technical ──
  {
    id: 46,
    category: 'Technical',
    skill: 'Git',
    difficulty: 'Easy',
    question: 'What is the difference between git merge and git rebase?',
    answer:
      'Merge: creates a merge commit, preserves full history, shows when branches diverged. Rebase: replays your commits on top of target branch, creates linear history, rewrites commit SHAs. Use merge for public/shared branches. Use rebase for cleaning up local feature branch history before merging. Golden rule: never rebase commits that others have pulled.',
  },
  {
    id: 47,
    category: 'Technical',
    skill: 'CSS',
    difficulty: 'Medium',
    question: 'Explain CSS specificity and how the cascade works.',
    answer:
      'Specificity hierarchy: inline styles (1000) > IDs (100) > classes/attributes (10) > elements (1). The browser picks the most specific selector. Equal specificity: last rule wins (cascade). !important overrides all (avoid). BEM naming methodology avoids specificity wars by using only classes.',
  },
  {
    id: 48,
    category: 'Technical',
    skill: 'Testing',
    difficulty: 'Medium',
    question: 'What is the difference between unit, integration, and e2e tests? When to use each?',
    answer:
      "Unit: test a single function/component in isolation with mocks. Fast, cheap, many. Integration: test multiple units together (e.g., API endpoint + DB). Fewer. E2E: test full user flow via browser (Cypress, Playwright). Slowest, most expensive. Follow the testing pyramid: many units, some integration, few e2e. Don't over-mock — test behavior, not implementation.",
  },
  {
    id: 49,
    category: 'Technical',
    skill: 'Microservices',
    difficulty: 'Hard',
    question: 'How would you handle distributed transactions across microservices?',
    answer:
      "ACID transactions don't span services. Options: 1) Saga pattern — chain of local transactions, each publishes event; compensating transactions on failure. 2) Two-phase commit (2PC) — coordinator asks all services to prepare then commit. Slow, coordinator is SPOF. 3) Outbox pattern — write event to DB alongside state change, background worker publishes. Most teams use Sagas.",
  },
  {
    id: 50,
    category: 'Technical',
    skill: 'Python',
    difficulty: 'Medium',
    question: 'What are Python decorators and give a practical use case?',
    answer:
      "Decorators wrap a function to add behavior without modifying it. They're higher-order functions. Syntax: @decorator above function definition. Practical uses: @timer (measure execution time), @retry (retry on failure), @cache (memoization), @require_auth (Flask/Django), @app.route (Flask routing). Understanding them requires knowing closures and *args/**kwargs.",
  },
  {
    id: 51,
    category: 'Technical',
    skill: 'Redis',
    difficulty: 'Medium',
    question: 'What are the main Redis data structures and their use cases?',
    answer:
      'String: counters, caching, sessions. Hash: user profile (field:value pairs). List: message queues, activity feeds (LPUSH/RPOP). Set: unique tags, friend lists, set operations. Sorted Set: leaderboards, rate limiting (ZADD with timestamp as score). Stream: event log, reliable message queue. Choose based on access patterns — Redis shines when data fits in memory.',
  },
  {
    id: 52,
    category: 'Technical',
    skill: 'Security',
    difficulty: 'Hard',
    question: 'Explain JWT tokens — their structure, benefits, and common vulnerabilities.',
    answer:
      "JWT: header.payload.signature, base64-encoded. Header: algorithm. Payload: claims (user data). Signature: ensures integrity. Benefits: stateless, self-contained, works across services. Vulnerabilities: 1) 'none' algorithm attack — always verify alg header. 2) Weak secret — use RS256 in production. 3) No revocation — use short expiry + refresh tokens. 4) Sensitive data in payload — it's encoded, not encrypted.",
  },
  {
    id: 53,
    category: 'Technical',
    skill: 'GraphQL',
    difficulty: 'Medium',
    question: 'What is the N+1 problem in GraphQL and how do you solve it?',
    answer:
      "N+1: fetching a list of N items, then making N additional queries for each item's related data. Example: 10 posts → 10 author queries = 11 total. Solutions: DataLoader — batches and caches requests within a single tick, turning N queries into 1. Alternatively: join at DB level, or use @graphql-tools/batch-execute.",
  },
  {
    id: 54,
    category: 'Technical',
    skill: 'WebSockets',
    difficulty: 'Medium',
    question: 'When would you use WebSockets vs Server-Sent Events vs Long Polling?',
    answer:
      'WebSockets: full-duplex, client and server both send messages. For: chat, gaming, collaborative tools. SSE: server pushes only, simpler, automatic reconnect, HTTP/2 friendly. For: live feeds, notifications, dashboards. Long Polling: client repeatedly asks for updates. Worst performance but works everywhere. Choose SSE for unidirectional, WebSockets for bidirectional real-time.',
  },
  {
    id: 55,
    category: 'Technical',
    skill: 'Kubernetes',
    difficulty: 'Hard',
    question: "What happens when you run 'kubectl apply' for a Deployment?",
    answer:
      '1) kubectl sends manifest to API server. 2) API server validates and stores in etcd. 3) Deployment controller detects desired vs current state. 4) Creates/updates ReplicaSet. 5) ReplicaSet controller creates Pods. 6) Scheduler assigns Pods to nodes. 7) kubelet on each node pulls image, starts container. 8) If rolling update: incrementally replace old pods, health checks before proceeding.',
  },
  {
    id: 56,
    category: 'Technical',
    skill: 'Algorithms',
    difficulty: 'Medium',
    question: 'Explain the time complexity differences between common sorting algorithms.',
    answer:
      'Bubble/Insertion/Selection: O(n²) average. Merge Sort: O(n log n) always, O(n) space. Quick Sort: O(n log n) average, O(n²) worst (bad pivot), O(log n) space. Heap Sort: O(n log n), O(1) space. Counting/Radix Sort: O(n+k) — linear for integer data. In practice: QuickSort fastest in cache (locality), MergeSort for stability, TimSort (Python/Java default) combines both.',
  },
  {
    id: 57,
    category: 'Technical',
    skill: 'Algorithms',
    difficulty: 'Hard',
    question: 'What is dynamic programming? Explain with an example.',
    answer:
      'DP: break problem into overlapping subproblems, solve each once, store results (memoization top-down or tabulation bottom-up). Classic example: Fibonacci — naive recursion O(2^n), DP O(n). Coin change: find minimum coins for amount — dp[amount] = 1 + min(dp[amount - coin] for each coin). Key insight: optimal solution built from optimal subproblem solutions (optimal substructure + overlapping subproblems).',
  },
  {
    id: 58,
    category: 'Technical',
    skill: 'Networking',
    difficulty: 'Medium',
    question: 'What happens when you type a URL in the browser and hit Enter?',
    answer:
      '1) DNS resolution: browser cache → OS cache → DNS resolver → authoritative DNS → IP address. 2) TCP handshake (SYN, SYN-ACK, ACK). 3) TLS handshake if HTTPS. 4) HTTP request sent. 5) Server processes request, sends response. 6) Browser parses HTML, builds DOM. 7) Fetches CSS/JS/images (parallel). 8) CSSOM built, render tree formed, layout, paint, composite.',
  },
  {
    id: 59,
    category: 'Technical',
    skill: 'Design Patterns',
    difficulty: 'Medium',
    question: "Explain the Observer pattern and where you've seen it used.",
    answer:
      "Observer: subject maintains list of observers, notifies them of state changes. Decouples producer from consumers. Examples: EventEmitter in Node.js, addEventListener in browser, RxJS Observables, React's useEffect dependency array (sort of), Vue's reactivity system. Use when: multiple parts of your app need to react to the same event without tight coupling.",
  },
  {
    id: 60,
    category: 'Technical',
    skill: 'Design Patterns',
    difficulty: 'Hard',
    question: 'What is the difference between a monorepo and microservices architecturally?',
    answer:
      'Monorepo: single repo, multiple packages/services. Benefits: atomic commits across services, shared code easy, consistent tooling. Challenges: build times, access control. Microservices: independently deployable services, own DB, communicate via API/events. Benefits: independent scaling, team autonomy, tech flexibility. Challenges: distributed system complexity, network latency, debugging. Not mutually exclusive — you can have a monorepo of microservices.',
  },
];

// ── Seeded shuffle ──
function seededShuffle(arr, seed) {
  const a = [...arr];
  let s = seed >>> 0;
  for (let i = a.length - 1; i > 0; i--) {
    s = Math.imul(s ^ (s >>> 15), s | 1);
    s ^= s + Math.imul(s ^ (s >>> 7), s | 61);
    const j = Math.abs((s ^ (s >>> 14)) >>> 0) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const CATEGORY_STYLE = {
  Technical: { bg: 'rgba(99,102,241,0.12)', color: '#a5b4fc', border: 'rgba(99,102,241,0.25)' },
  Behavioral: { bg: 'rgba(16,185,129,0.12)', color: '#6ee7b7', border: 'rgba(16,185,129,0.25)' },
  'System Design': {
    bg: 'rgba(139,92,246,0.12)',
    color: '#c4b5fd',
    border: 'rgba(139,92,246,0.25)',
  },
};

const DIFF_STYLE = {
  Easy: { bg: 'rgba(16,185,129,0.1)', color: '#10b981', border: 'rgba(16,185,129,0.2)' },
  Medium: { bg: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: 'rgba(251,191,36,0.2)' },
  Hard: { bg: 'rgba(248,113,113,0.1)', color: '#f87171', border: 'rgba(248,113,113,0.2)' },
};

const STORAGE_KEY = 'sga_interview_progress';

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}
function saveProgress(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Derive displayable insights from HistoryService
function getInsights() {
  return {
    weakTopics: HistoryService.getTopicStats().filter((t) => t.avg < 70),
    allTopics: HistoryService.getTopicStats(),
    chronic: HistoryService.getChronicGaps(),
  };
}

export default function InterviewPage() {
  const [seed, setSeed] = useState(() => {
    const saved = loadProgress();
    return saved.seed || Date.now();
  });
  const [questions, setQuestions] = useState([]);
  const [filter, setFilter] = useState('All');
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [practiced, setPracticed] = useState(() => {
    const saved = loadProgress();
    return new Set(saved.practiced || []);
  });
  const [showComplete, setShowComplete] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [insights, setInsights] = useState(() => getInsights());
  const [showInsights, setShowInsights] = useState(true);

  // --- Writing pad & AI States ---
  const [userAnswer, setUserAnswer] = useState('');
  const [hints, setHints] = useState(null);
  const [outline, setOutline] = useState(null);
  const [evaluation, setEvaluation] = useState(null);

  const { loadingStates, error, isWakingUp, evaluateAnswer, generateHints, generateAnswerOutline } = useAI();

  // Reset states when changing question
  useEffect(() => {
    setUserAnswer('');
    setHints(null);
    setOutline(null);
    setEvaluation(null);
  }, [index, filter]);

  const handleFetchHints = async () => {
    try {
      const res = await generateHints(current.question, current.difficulty, current.skill);
      setHints(res);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFetchOutline = async () => {
    try {
      const res = await generateAnswerOutline(current.question, current.difficulty, current.skill);
      setOutline(res);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEvaluate = async () => {
    if (!userAnswer.trim()) return;
    try {
      const res = await evaluateAnswer(current.question, userAnswer, current.answer, current.skill);
      setEvaluation(res);
      setInsights(getInsights());
    } catch (err) {
      console.error(err);
    }
  };

  // Build shuffled question list from seed
  useEffect(() => {
    const shuffled = seededShuffle(QUESTION_BANK, seed);
    setQuestions(shuffled);
  }, [seed]);

  // Save progress whenever practiced set or seed changes
  useEffect(() => {
    saveProgress({ seed, practiced: [...practiced] });
  }, [practiced, seed]);

  // Filtered list based on category filter
  const filtered = filter === 'All' ? questions : questions.filter((q) => q.category === filter);
  const current = filtered[index];

  // 🔥 Zero-Click Latency Prefetch: Start fetching hints and outline in the background immediately
  useEffect(() => {
    if (!current) return;

    const prefetch = async () => {
      const hintsKey = `hints:${current.question}`;
      const outlineKey = `outline:${current.question}`;

      if (!aiCache.get(hintsKey)) {
        console.log(`[Prefetch] Fetching hints for "${current.question.slice(0, 30)}..."`);
        InterviewAI.generateHints(current.question, current.difficulty, current.skill)
          .then((res) => aiCache.set(hintsKey, res))
          .catch((err) => console.warn(`[Prefetch] Hints failed:`, err));
      }

      if (!aiCache.get(outlineKey)) {
        console.log(`[Prefetch] Fetching outline for "${current.question.slice(0, 30)}..."`);
        InterviewAI.generateAnswerOutline(current.question, current.difficulty, current.skill)
          .then((res) => aiCache.set(outlineKey, res))
          .catch((err) => console.warn(`[Prefetch] Outline failed:`, err));
      }
    };

    // UX delay: Wait 1 second before prefetching to avoid hammering the API if the user is skipping quickly
    const timer = setTimeout(prefetch, 1000);
    return () => clearTimeout(timer);
  }, [current]);
  const practicedInFilter = filtered.filter((q) => practiced.has(q.id)).length;
  const progress = filtered.length > 0 ? (practicedInFilter / filtered.length) * 100 : 0;

  // Check completion
  useEffect(() => {
    if (filtered.length > 0 && practicedInFilter === filtered.length) {
      setShowComplete(true);
    }
  }, [practicedInFilter, filtered.length]);

  function handleReveal() {
    setRevealed(true);
  }

  function handleMark() {
    const wasPracticed = practiced.has(current.id);
    setPracticed((prev) => {
      const next = new Set(prev);
      if (next.has(current.id)) next.delete(current.id);
      else next.add(current.id);
      return next;
    });
    // Record to HistoryService only when marking ON, not when un-marking
    if (!wasPracticed) {
      // Difficulty → baseline self-assessed score
      const baseScore =
        current.difficulty === 'Easy' ? 90 : current.difficulty === 'Medium' ? 75 : 60;
      // Dock 15 pts if answer was never revealed (likely skipped)
      const score = revealed ? baseScore : Math.max(0, baseScore - 15);
      HistoryService.recordAnswer(current.skill, score);
      setInsights(getInsights()); // refresh panel instantly
    }
  }

  function handleNext() {
    setRevealed(false);
    setIndex((i) => Math.min(i + 1, filtered.length - 1));
  }

  function handlePrev() {
    setRevealed(false);
    setIndex((i) => Math.max(i - 1, 0));
  }

  function handleNewRound() {
    setSpinning(true);
    setTimeout(() => {
      const next = Date.now();
      setSeed(next);
      setPracticed(new Set());
      setIndex(0);
      setRevealed(false);
      setShowComplete(false);
      setSpinning(false);
    }, 400);
  }

  function handleFilterChange(f) {
    setFilter(f);
    setIndex(0);
    setRevealed(false);
  }

  // Keyboard shortcuts: ← → to navigate, Space to reveal
  useEffect(() => {
    function onKey(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === ' ') {
        e.preventDefault();
        if (!revealed) handleReveal();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, filtered.length, revealed]);

  if (!current && !showComplete) {
    return (
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}
      >
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>Loading questions...</div>
      </div>
    );
  }

  // ── Completion screen ──
  if (showComplete) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          maxWidth: 640,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            background: '#0e1525',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 18,
            padding: '48px 32px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'rgba(16,185,129,0.12)',
              border: '2px solid rgba(16,185,129,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Trophy size={32} color="#10b981" />
          </div>
          <div>
            <div style={{ color: '#f0f4ff', fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
              Round Complete! 🎉
            </div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 1.6 }}>
              You practiced all {filtered.length} questions in this round.
              <br />A new shuffled set is ready when you are.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            <div
              style={{
                background: 'rgba(99,102,241,0.1)',
                border: '1px solid rgba(99,102,241,0.2)',
                borderRadius: 10,
                padding: '12px 24px',
                textAlign: 'center',
              }}
            >
              <div style={{ color: '#a5b4fc', fontSize: 22, fontWeight: 700 }}>
                {filtered.length}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 }}>
                Questions Practiced
              </div>
            </div>
            <div
              style={{
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.2)',
                borderRadius: 10,
                padding: '12px 24px',
                textAlign: 'center',
              }}
            >
              <div style={{ color: '#10b981', fontSize: 22, fontWeight: 700 }}>100%</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 }}>
                Completion
              </div>
            </div>
          </div>
          <button
            onClick={handleNewRound}
            disabled={spinning}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              border: 'none',
              borderRadius: 10,
              padding: '12px 32px',
              color: 'white',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              marginTop: 8,
              fontFamily: 'inherit',
            }}
          >
            <RefreshCw
              size={16}
              style={{ animation: spinning ? 'spin 0.4s linear infinite' : 'none' }}
            />
            {spinning ? 'Shuffling...' : 'Start New Round →'}
          </button>
        </div>
      </div>
    );
  }

  const catStyle = CATEGORY_STYLE[current.category] || CATEGORY_STYLE.Technical;
  const diffStyle = DIFF_STYLE[current.difficulty] || DIFF_STYLE.Medium;
  const isPracticed = practiced.has(current.id);

  // Dot nav window: show up to 9 dots centred on current index
  const windowStart = Math.max(0, Math.min(index - 4, filtered.length - 9));
  const dotWindow = filtered.slice(windowStart, windowStart + 9);

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 720, margin: '0 auto' }}
    >
      {/* ── Header ── */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ color: '#f0f4ff', fontSize: 20, fontWeight: 700 }}>Interview Prep</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 }}>
            {practicedInFilter} / {filtered.length} practiced
          </div>
        </div>
        <button
          onClick={handleNewRound}
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
            color: 'rgba(255,255,255,0.6)',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            flexShrink: 0,
            fontFamily: 'inherit',
            minHeight: '44px',
          }}
        >
          <RefreshCw
            size={13}
            style={{ animation: spinning ? 'spin 0.4s linear infinite' : 'none' }}
          />
          New Shuffle
        </button>
      </div>

      {/* ── Category filter tabs ── */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {['All', 'Technical', 'Behavioral', 'System Design'].map((cat) => (
          <button
            key={cat}
            onClick={() => handleFilterChange(cat)}
            style={{
              padding: '10px 14px',
              borderRadius: 9999,
              fontSize: 12,
              fontWeight: 600,
              border: '1px solid',
              background: filter === cat ? 'rgba(78,222,163,0.14)' : 'transparent',
              borderColor: filter === cat ? 'rgba(78,222,163,0.40)' : 'rgba(255,255,255,0.1)',
              color: filter === cat ? '#4edea3' : 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              transition: 'all 0.15s',
              fontFamily: 'inherit',
              minHeight: '44px',
            }}
          >
            {cat}
            <span style={{ marginLeft: 5, opacity: 0.6, fontSize: 11 }}>
              {cat === 'All'
                ? QUESTION_BANK.length
                : QUESTION_BANK.filter((q) => q.category === cat).length}
            </span>
          </button>
        ))}
      </div>

      {/* ── Progress bar ── */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Session Progress
          </span>
          <span style={{ fontSize: 11, color: '#4edea3' }}>{Math.round(progress)}%</span>
        </div>
        <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 9999, overflow: 'hidden' }}>
          <div style={{
            width: `${progress}%`, height: '100%',
            background: 'linear-gradient(90deg, #10b981, #4edea3)',
            borderRadius: 9999, transition: 'width 0.4s ease',
            boxShadow: '0 0 8px rgba(78,222,163,0.6)',
            minWidth: progress > 0 ? '4px' : '0',
          }} />
        </div>
      </div>

      {/* ── Main Glass Card ── */}
      <div style={{
        background: 'linear-gradient(to bottom, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.50) 100%), rgba(5,20,36,0.85)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(78,222,163,0.18)', borderRadius: 24, padding: '28px',
        display: 'flex', flexDirection: 'column', gap: 24,
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 30px 60px -15px rgba(0,0,0,0.80), 0 8px 16px -4px rgba(0,0,0,0.90), inset 0 1px 2px rgba(255,255,255,0.08)',
        opacity: spinning ? 0.4 : 1, transition: 'opacity 0.2s',
      }}>
        {/* Rim glow */}
        <div style={{ position:'absolute', inset:0, borderRadius:'inherit', background:'linear-gradient(135deg,rgba(255,255,255,0.07) 0%,transparent 60%)', pointerEvents:'none', zIndex:0 }} />
        <style>{`@keyframes rim-ip{0%,100%{opacity:.30}50%{opacity:1}} @keyframes pulse-ip{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
        <div style={{ position:'absolute', inset:0, borderRadius:'inherit', padding:'1px',
          background:'linear-gradient(135deg,rgba(78,222,163,.70) 0%,rgba(78,222,163,0) 40%,rgba(78,222,163,0) 70%,rgba(78,222,163,.55) 100%)',
          WebkitMask:'linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0)',
          WebkitMaskComposite:'xor', maskComposite:'exclude',
          pointerEvents:'none', animation:'rim-ip 4s ease-in-out infinite', zIndex:0 }} />
        <div style={{ position:'absolute', top:'-60px', right:'-60px', width:'220px', height:'220px', borderRadius:'50%', background:'rgba(78,222,163,0.06)', filter:'blur(60px)', pointerEvents:'none', zIndex:0 }} />

        {/* ── Session Active header ── */}
        <div style={{ position:'relative', zIndex:1, display:'flex', flexDirection:'column', gap:8 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ width:8, height:8, borderRadius:'50%', background:'#4edea3', display:'inline-block', boxShadow:'0 0 8px #4edea3', animation:'pulse-ip 2.5s ease-in-out infinite' }} />
            <span style={{ fontSize:10, fontWeight:700, color:'#4edea3', letterSpacing:'0.18em', textTransform:'uppercase' }}>Session Active</span>
          </div>
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
            <div>
              <h2 style={{ fontSize:28, fontWeight:800, color:'#d4e4fa', letterSpacing:'-0.02em', lineHeight:1.1, marginBottom:2 }}>Mock Interview</h2>
              <span style={{ fontSize:20, fontWeight:700, color:'rgba(16,185,129,0.75)' }}>Question {index + 1} / {filtered.length}</span>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:11, color:'rgba(187,202,191,0.50)', marginBottom:4 }}>{practicedInFilter} of {filtered.length} practiced</div>
              <div style={{ width:160, height:4, background:'rgba(255,255,255,0.06)', borderRadius:9999, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${progress}%`, background:'#4edea3', borderRadius:9999, boxShadow:'0 0 6px #4edea3' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Banners */}
        {isWakingUp && (
          <div style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', gap:8, background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.25)', padding:'12px 16px', borderRadius:12, color:'#fbbf24', fontSize:13, fontWeight:500 }}>
            <RefreshCw size={15} style={{ animation:'spin 2s linear infinite', flexShrink:0 }} />
            <span>Waking up server... (~15s)</span>
          </div>
        )}
        {error && (
          <div style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', gap:10, background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.22)', padding:'12px 16px', borderRadius:12, color:'#f87171', fontSize:13, fontWeight:500 }}>
            <AlertTriangle size={16} style={{ flexShrink:0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* ── Question Section ── */}
        <div style={{ position:'relative', zIndex:1, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:18, padding:'24px' }}>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:20 }}>
            <span style={{ background:catStyle.bg, color:catStyle.color, border:`1px solid ${catStyle.border}`, borderRadius:8, padding:'4px 12px', fontSize:10, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase' }}>{current.category}</span>
            <span style={{ background:diffStyle.bg, color:diffStyle.color, border:`1px solid ${diffStyle.border}`, borderRadius:8, padding:'4px 12px', fontSize:10, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase' }}>{current.difficulty}</span>
            <span style={{ background:'rgba(78,222,163,0.08)', color:'rgba(78,222,163,0.75)', border:'1px solid rgba(78,222,163,0.18)', borderRadius:8, padding:'4px 12px', fontSize:10, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase' }}>{current.skill}</span>
          </div>
          <h4 style={{ fontSize:22, fontWeight:700, color:'#d4e4fa', lineHeight:1.55, marginBottom:20, letterSpacing:'-0.01em' }}>{current.question}</h4>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            <button onClick={handleFetchHints} disabled={loadingStates.generateHints} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 18px', borderRadius:12, fontSize:13, fontWeight:600, background: hints ? 'rgba(78,222,163,0.12)' : 'rgba(255,255,255,0.04)', border: hints ? '1px solid rgba(78,222,163,0.30)' : '1px solid rgba(255,255,255,0.08)', color: hints ? '#4edea3' : 'rgba(255,255,255,0.65)', cursor:'pointer', transition:'all 0.15s', fontFamily:'inherit', minHeight:'40px', flex:'1 1 auto' }}>
              <Lightbulb size={14} style={{ color: hints ? '#4edea3' : 'rgba(255,255,255,0.4)' }} />
              {loadingStates.generateHints ? 'Fetching...' : hints ? 'Hints Loaded' : 'AI Hints'}
            </button>
            <button onClick={handleFetchOutline} disabled={loadingStates.generateAnswerOutline} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 18px', borderRadius:12, fontSize:13, fontWeight:600, background: outline ? 'rgba(139,92,246,0.12)' : 'rgba(255,255,255,0.04)', border: outline ? '1px solid rgba(139,92,246,0.30)' : '1px solid rgba(255,255,255,0.08)', color: outline ? '#c4b5fd' : 'rgba(255,255,255,0.65)', cursor:'pointer', transition:'all 0.15s', fontFamily:'inherit', minHeight:'40px', flex:'1 1 auto' }}>
              <List size={14} style={{ color: outline ? '#a78bfa' : 'rgba(255,255,255,0.4)' }} />
              {loadingStates.generateAnswerOutline ? 'Generating...' : outline ? 'Outline Loaded' : 'Answer Outline'}
            </button>
            <button onClick={handleEvaluate} disabled={loadingStates.evaluateAnswer || !userAnswer.trim()} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 18px', borderRadius:12, fontSize:13, fontWeight:700, background: evaluation ? 'rgba(78,222,163,0.12)' : userAnswer.trim() ? 'linear-gradient(135deg, #8b5cf6, #ec4899)' : 'rgba(139,92,246,0.08)', border: evaluation ? '1px solid rgba(78,222,163,0.30)' : userAnswer.trim() ? 'none' : '1px solid rgba(139,92,246,0.18)', color: evaluation ? '#4edea3' : userAnswer.trim() ? 'white' : 'rgba(139,92,246,0.4)', cursor: userAnswer.trim() ? 'pointer' : 'not-allowed', transition:'all 0.15s', fontFamily:'inherit', minHeight:'40px', flex:'1 1 auto', boxShadow: userAnswer.trim() && !evaluation ? '0 0 20px rgba(236,72,153,0.25)' : 'none' }}>
              <Bot size={14} />
              {loadingStates.evaluateAnswer ? 'Evaluating...' : evaluation ? '✓ Done' : '✦ AI Evaluate'}
            </button>
          </div>
        </div>

        {/* Hints */}
        {(loadingStates.generateHints || hints) && (
          <div style={{ position:'relative', zIndex:1, background:'rgba(78,222,163,0.04)', border:'1px solid rgba(78,222,163,0.15)', borderRadius:14, padding:'18px 20px', display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}><Lightbulb size={13} color="#4edea3" /><span style={{ color:'#4edea3', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em' }}>Progressive Hints</span></div>
            {loadingStates.generateHints ? (
              <div style={{ display:'flex', flexDirection:'column', gap:10, padding:'4px 0' }}>
                <div className="skeleton-pulse skeleton-line" style={{ height:'14px', width:'90%' }} />
                <div className="skeleton-pulse skeleton-line" style={{ height:'14px', width:'75%' }} />
                <div className="skeleton-pulse skeleton-line" style={{ height:'14px', width:'85%' }} />
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {hints.map((h, i) => (
                  <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                    <span style={{ fontSize:10, color:'#003824', background:'#4edea3', width:18, height:18, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2, fontWeight:800 }}>{i+1}</span>
                    <p style={{ color:'rgba(255,255,255,0.75)', fontSize:13, margin:0, lineHeight:1.55 }}><TypewriterText text={h} /></p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Outline */}
        {(loadingStates.generateAnswerOutline || outline) && (
          <div style={{ position:'relative', zIndex:1, background:'rgba(139,92,246,0.04)', border:'1px solid rgba(139,92,246,0.15)', borderRadius:14, padding:'18px 20px', display:'flex', flexDirection:'column', gap:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}><List size={13} color="#a78bfa" /><span style={{ color:'#c4b5fd', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em' }}>Structured Answer Outline</span></div>
            {loadingStates.generateAnswerOutline ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '4px 0' }}>
                <div className="skeleton-pulse skeleton-line" style={{ height: '12px', width: '60%', marginBottom: '8px' }} />
                <div className="skeleton-pulse skeleton-line" style={{ height: '14px', width: '90%' }} />
                <div className="skeleton-pulse skeleton-line" style={{ height: '14px', width: '75%' }} />
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {outline.opening && (
                    <div>
                      <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 600 }}>
                        1. Opening Hook
                      </div>
                      <div
                        style={{
                          color: 'rgba(255,255,255,0.75)',
                          fontSize: 13,
                          marginTop: 2,
                          fontStyle: 'italic',
                        }}
                      >
                        "{outline.opening}"
                      </div>
                    </div>
                  )}
                  {outline.coreConcepts && outline.coreConcepts.length > 0 && (
                    <div>
                      <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 600 }}>
                        2. Core Concepts
                      </div>
                      <ul
                        style={{
                          margin: '4px 0 0',
                          paddingLeft: 20,
                          color: 'rgba(255,255,255,0.7)',
                          fontSize: 13,
                        }}
                      >
                        {outline.coreConcepts.map((c, i) => (
                          <li key={i} style={{ marginBottom: 2 }}>
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {outline.steps && outline.steps.length > 0 && (
                    <div>
                      <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 600 }}>
                        3. Step-by-Step Response Flow
                      </div>
                      <ol
                        style={{
                          margin: '4px 0 0',
                          paddingLeft: 20,
                          color: 'rgba(255,255,255,0.7)',
                          fontSize: 13,
                        }}
                      >
                        {outline.steps.map((s, i) => (
                          <li key={i} style={{ marginBottom: 2 }}>
                            {s}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                  {outline.edgeCases && outline.edgeCases.length > 0 && (
                    <div>
                      <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 600 }}>
                        4. Edge Cases & Trade-offs
                      </div>
                      <ul
                        style={{
                          margin: '4px 0 0',
                          paddingLeft: 20,
                          color: 'rgba(255,255,255,0.7)',
                          fontSize: 13,
                        }}
                      >
                        {outline.edgeCases.map((e, i) => (
                          <li key={i} style={{ marginBottom: 2 }}>
                            {e}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {outline.closing && (
                    <div>
                      <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 600 }}>
                        5. Closing Statement
                      </div>
                      <div
                        style={{
                          color: 'rgba(255,255,255,0.75)',
                          fontSize: 13,
                          marginTop: 2,
                          fontStyle: 'italic',
                        }}
                      >
                        "{outline.closing}"
                      </div>
                    </div>
                  )}
                  {outline.complexityNote && (
                    <div
                      style={{
                        background: 'rgba(255,255,255,0.02)',
                        padding: 8,
                        borderRadius: 6,
                        border: '1px dashed rgba(255,255,255,0.05)',
                      }}
                    >
                      <div
                        style={{
                          color: 'rgba(255,255,255,0.3)',
                          fontSize: 10,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                        }}
                      >
                        Complexity & Scale Note
                      </div>
                      <div style={{ color: '#a5b4fc', fontSize: 12, marginTop: 2 }}>
                        {outline.complexityNote}
                      </div>
                    </div>
                  )}
                </div>

                {/* Model Answer (Full Explanation) */}
                <div
                  style={{
                    marginTop: 12,
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    paddingTop: 14,
                  }}
                >
                  <div style={{ color: '#f0f4ff', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                    Model Solution & Full Explanation:
                  </div>
                  <div
                    style={{
                      background: 'rgba(0,0,0,0.15)',
                      border: '1px solid rgba(255,255,255,0.04)',
                      borderRadius: 8,
                      padding: '12px 14px',
                      color: 'rgba(255,255,255,0.6)',
                      fontSize: 13,
                      lineHeight: 1.7,
                    }}
                  >
                    {current.answer}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* AI Evaluation Display */}
        {(loadingStates.evaluateAnswer || evaluation) && (
          <div
            style={{
              background: 'rgba(16,185,129,0.03)',
              border: '1px solid rgba(16,185,129,0.15)',
              borderRadius: 12,
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            {loadingStates.evaluateAnswer ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '4px 0' }}>
                <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div className="skeleton-pulse" style={{ width: 84, height: 84, borderRadius: '50%', flexShrink: 0 }} />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 18px', flex: 1 }}>
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} style={{ minWidth: 140, flex: 1 }}>
                        <div className="skeleton-pulse skeleton-line" style={{ height: '12px', width: '60%', marginBottom: '6px' }} />
                        <div className="skeleton-pulse skeleton-line" style={{ height: '6px', width: '100%' }} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="skeleton-pulse skeleton-line" style={{ height: '14px', width: '100%', marginTop: '12px' }} />
                <div className="skeleton-pulse skeleton-line" style={{ height: '14px', width: '90%' }} />
              </div>
            ) : (
              <>
                {/* Header with Bot and Chronic warning */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 10,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Bot size={13} color="#10b981" />
                    <span
                      style={{
                        color: '#6ee7b7',
                        fontSize: 12,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      AI Evaluation Result
                    </span>
                  </div>
                  {evaluation.chronicGapRepeated && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        background: 'rgba(248,113,113,0.12)',
                        border: '1px solid rgba(248,113,113,0.25)',
                        borderRadius: 6,
                        padding: '3px 10px',
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#f87171',
                      }}
                    >
                      <AlertTriangle size={12} />
                      Chronic Gap Repeated: "{evaluation.chronicGapName}"
                    </div>
                  )}
                </div>

                {/* Score Ring / Bar display */}
                <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div
                    style={{
                      width: 84,
                      height: 84,
                      borderRadius: '50%',
                      background: 'rgba(16,185,129,0.06)',
                      border: '3px solid #10b981',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ fontSize: 24, fontWeight: 800, color: '#10b981' }}>
                      {evaluation.overallScore}
                    </span>
                    <span
                      style={{
                        fontSize: 9,
                        color: 'rgba(255,255,255,0.4)',
                        textTransform: 'uppercase',
                        fontWeight: 700,
                      }}
                    >
                      Overall
                    </span>
                  </div>

                  {/* Subscores gauges */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 18px', flex: 1 }}>
                    {[
                      { label: 'Technical Accuracy (40%)', score: evaluation.technicalAccuracy },
                      { label: 'Completeness (25%)', score: evaluation.completeness },
                      { label: 'Clarity (15%)', score: evaluation.clarity },
                      { label: 'Depth (20%)', score: evaluation.depth },
                    ].map((s, idx) => {
                      const scoreColor =
                        s.score >= 80 ? '#10b981' : s.score >= 55 ? '#fbbf24' : '#f87171';
                      return (
                        <div key={idx} style={{ minWidth: 140, flex: 1 }}>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              marginBottom: 3,
                            }}
                          >
                            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                              {s.label}
                            </span>
                            <span style={{ fontSize: 11, fontWeight: 700, color: scoreColor }}>
                              {s.score}%
                            </span>
                          </div>
                          <div
                            style={{
                              width: '100%',
                              height: 4,
                              background: 'rgba(255,255,255,0.06)',
                              borderRadius: 9999,
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                width: `${s.score}%`,
                                height: '100%',
                                background: scoreColor,
                                borderRadius: 9999,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Critique Feedback & Plan */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    paddingTop: 14,
                  }}
                >
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 600 }}>
                      Critique Feedback
                    </div>
                    <p
                      style={{
                        color: 'rgba(255,255,255,0.85)',
                        fontSize: 13,
                        margin: '3px 0 0',
                        lineHeight: 1.6,
                      }}
                    >
                      {evaluation.feedback}
                    </p>
                  </div>

                  {evaluation.strengths && evaluation.strengths.length > 0 && (
                    <div>
                      <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 600 }}>
                        Strengths
                      </div>
                      <ul
                        style={{ margin: '4px 0 0', paddingLeft: 18, color: '#6ee7b7', fontSize: 13 }}
                      >
                        {evaluation.strengths.map((st, i) => (
                          <li key={i} style={{ marginBottom: 1 }}>
                            {st}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {evaluation.missingPoints && evaluation.missingPoints.length > 0 && (
                    <div>
                      <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 600 }}>
                        Gaps / Missing Points
                      </div>
                      <ul
                        style={{ margin: '4px 0 0', paddingLeft: 18, color: '#f87171', fontSize: 13 }}
                      >
                        {evaluation.missingPoints.map((mp, i) => (
                          <li key={i} style={{ marginBottom: 1 }}>
                            {mp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {evaluation.improvementPlan && (
                    <div
                      style={{
                        background: 'rgba(16,185,129,0.05)',
                        border: '1px dashed rgba(16,185,129,0.2)',
                        padding: '10px 12px',
                        borderRadius: 8,
                      }}
                    >
                      <div
                        style={{
                          color: '#34d399',
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}
                      >
                        Actionable Improvement Plan
                      </div>
                      <div
                        style={{
                          color: 'rgba(255,255,255,0.75)',
                          fontSize: 13,
                          marginTop: 4,
                          lineHeight: 1.5,
                        }}
                      >
                        {evaluation.improvementPlan}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Text Area pad */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: 8,
            }}
          >
            <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, fontWeight: 600 }}>
              Your Answer
            </span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>
              {userAnswer.length > 0 && (
                <>
                  {userAnswer.length} chars
                  {' · '}
                  ~{Math.max(1, Math.round(userAnswer.split(/\s+/).filter(Boolean).length / 130))} min
                </>
              )}
              {userAnswer.length === 0 && 'Start typing your answer'}
            </span>
          </div>
          <textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Type your answer here. Use the AI Evaluate button for instant scoring across 4 axes."
            disabled={loadingStates.evaluateAnswer}
            style={{
              width: '100%',
              height: 160,
              background: '#090d16',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10,
              padding: '12px 14px',
              color: '#f0f4ff',
              fontSize: 14,
              lineHeight: 1.6,
              resize: 'vertical',
              outline: 'none',
              fontFamily: 'inherit',
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
            }}
          />
        </div>
      </div>

      {/* ── Navigation ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
        <div className="flex gap-2 w-full sm:w-auto flex-1">
          {/* Skip — ghost/text style so users aren't trained to skip */}
          <button
            onClick={handleNext}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              padding: '10px 14px',
              background: 'transparent',
              border: 'none',
              borderRadius: 9,
              color: 'rgba(255,255,255,0.3)',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'inherit',
              minHeight: '44px',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
          >
            <ChevronsRight size={13} /> Skip
          </button>

          {/* Mark Complete — green, rewarding checkmark animation */}
          <button
            onClick={handleMark}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '10px 18px',
              background: isPracticed
                ? 'rgba(16,185,129,0.1)'
                : 'linear-gradient(135deg,#10b981,#059669)',
              border: isPracticed ? '1px solid rgba(16,185,129,0.25)' : 'none',
              borderRadius: 9,
              color: isPracticed ? '#10b981' : 'white',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              minHeight: '44px',
              flex: 1,
              boxShadow: isPracticed ? 'none' : '0 4px 12px rgba(16,185,129,0.2)',
              transition: 'all 0.2s',
            }}
          >
            <CheckCircle2
              size={15}
              style={{
                transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                transform: isPracticed ? 'scale(1.25)' : 'scale(1)',
              }}
            />
            {isPracticed ? 'Completed ✓' : 'Mark Complete'}
          </button>
        </div>

        {/* Dot indicators - hidden on mobile */}
        <div className="hidden sm:flex gap-1.5 items-center px-4">
          {dotWindow.map((q, i) => {
            const realIdx = windowStart + i;
            return (
              <button
                key={q.id}
                onClick={() => {
                  setIndex(realIdx);
                }}
                style={{
                  width: realIdx === index ? 20 : 7,
                  height: 7,
                  borderRadius: 9999,
                  border: 'none',
                  padding: 0,
                  background: practiced.has(q.id)
                      ? '#10b981'
                      : realIdx === index
                        ? '#4edea3'
                      : 'rgba(255,255,255,0.15)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              />
            );
          })}
        </div>

        <button
          onClick={handleNext}
          disabled={index === filtered.length - 1}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '10px 24px',
            background:
              index === filtered.length - 1
                ? 'rgba(255,255,255,0.04)'
                : 'linear-gradient(135deg,#10b981,#059669)',
            border: 'none',
            borderRadius: 9,
            color: index === filtered.length - 1 ? 'rgba(255,255,255,0.2)' : '#003824',
            fontSize: 13,
            fontWeight: 600,
            cursor: index === filtered.length - 1 ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            boxShadow: index === filtered.length - 1 ? 'none' : '0 0 14px rgba(16,185,129,0.25)',
            minHeight: '44px',
            width: '100%',
            smWidth: 'auto',
            marginLeft: 'auto',
          }}
          className="w-full sm:w-auto"
        >
          Next Question <ArrowRight size={15} />
        </button>
      </div>

      {/* Keyboard shortcut hint */}
      <p style={{ color: 'rgba(255,255,255,0.15)', fontSize: 11, textAlign: 'center', margin: 0 }}>
        ← → arrow keys to navigate
      </p>

      {/* ── History Insights Panel ── */}
      {(insights.allTopics.length > 0 || insights.chronic.length > 0) && (
        <div
          style={{
            background: '#0e1525',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 14,
            overflow: 'hidden',
          }}
        >
          {/* Collapsible header */}
          <button
            onClick={() => setShowInsights((v) => !v)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              padding: '14px 18px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 7,
                  background: 'rgba(99,102,241,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Sparkles size={12} color="#a5b4fc" />
              </div>
              <span style={{ color: '#f0f4ff', fontSize: 13, fontWeight: 700 }}>
                Your Practice Insights
              </span>
              {insights.weakTopics.length > 0 && (
                <span
                  style={{
                    background: 'rgba(248,113,113,0.12)',
                    color: '#f87171',
                    border: '1px solid rgba(248,113,113,0.25)',
                    borderRadius: 9999,
                    padding: '1px 8px',
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                >
                  {insights.weakTopics.length} weak area
                  {insights.weakTopics.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
              {showInsights ? '▲' : '▼'}
            </span>
          </button>

          {showInsights && (
            <div
              style={{ padding: '0 18px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}
            >
              {/* Topic score bars */}
              {insights.allTopics.length > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      color: 'rgba(255,255,255,0.3)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: 8,
                    }}
                  >
                    Topics Practiced
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {insights.allTopics.slice(0, 8).map((t) => {
                      const barColor =
                        t.avg >= 80 ? '#10b981' : t.avg >= 60 ? '#fbbf24' : '#f87171';
                      const TrendIcon =
                        t.direction === 'improving'
                          ? TrendingUp
                          : t.direction === 'declining'
                            ? TrendingDown
                            : Minus;
                      const trendColor =
                        t.direction === 'improving'
                          ? '#10b981'
                          : t.direction === 'declining'
                            ? '#f87171'
                            : 'rgba(255,255,255,0.25)';
                      return (
                        <div key={t.topic}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginBottom: 4,
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                                {t.topic}
                              </span>
                              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>
                                {t.attempts}×
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                              <TrendIcon size={11} color={trendColor} />
                              <span style={{ fontSize: 11, fontWeight: 600, color: barColor }}>
                                {t.avg}%
                              </span>
                            </div>
                          </div>
                          <div
                            style={{
                              width: '100%',
                              height: 4,
                              background: 'rgba(255,255,255,0.06)',
                              borderRadius: 9999,
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                width: `${t.avg}%`,
                                height: '100%',
                                background: barColor,
                                borderRadius: 9999,
                                transition: 'width 0.4s ease',
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Chronic gaps warning */}
              {insights.chronic.length > 0 && (
                <div
                  style={{
                    background: 'rgba(248,113,113,0.06)',
                    border: '1px solid rgba(248,113,113,0.15)',
                    borderRadius: 10,
                    padding: '12px 14px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <AlertTriangle size={12} color="#f87171" />
                    <span
                      style={{
                        fontSize: 11,
                        color: '#f87171',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      Recurring gaps to focus on
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {insights.chronic.map(({ phrase, count }) => (
                      <div
                        key={phrase}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
                          "{phrase}"
                        </span>
                        <span
                          style={{
                            background: 'rgba(248,113,113,0.12)',
                            color: '#f87171',
                            borderRadius: 9999,
                            padding: '1px 8px',
                            fontSize: 10,
                            fontWeight: 600,
                          }}
                        >
                          {count}×
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Collapsible AI context preview */}
              <details>
                <summary
                  style={{
                    fontSize: 11,
                    color: 'rgba(255,255,255,0.25)',
                    cursor: 'pointer',
                    userSelect: 'none',
                    listStyle: 'none',
                  }}
                >
                  ▸ View AI context string
                </summary>
                <pre
                  style={{
                    marginTop: 8,
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 8,
                    padding: '12px',
                    fontSize: 10,
                    color: 'rgba(255,255,255,0.4)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontFamily: "'Courier New', monospace",
                  }}
                >
                  {HistoryService.buildContext(current?.skill || '') ||
                    '(No history yet — start practicing!)'}
                </pre>
              </details>
            </div>
          )}
        </div>
      )}
      <style>{`
        @media (max-width:768px){
          .iv-header{flex-direction:column!important;gap:12px!important}
          .iv-card{padding:20px!important}
          .iv-title{font-size:18px!important}
          .iv-question{font-size:15px!important}
        }
        @media (max-width:640px){
          .iv-card{padding:16px!important;border-radius:12px!important;gap:12px!important}
          .iv-title{font-size:16px!important;line-height:1.2!important}
          .iv-question{font-size:14px!important;line-height:1.4!important}
          .iv-buttons{gap:8px!important;flex-wrap:wrap!important}
          .iv-btn{padding:10px 12px!important;font-size:11px!important;min-width:auto!important}
          .iv-nav{gap:8px!important}
          .iv-filter{flex-wrap:wrap!important}
          .iv-insights{padding:12px!important}
        }
        @media (max-width:480px){
          .iv-card{padding:12px!important;gap:10px!important}
          .iv-title{font-size:15px!important}
          .iv-question{font-size:12px!important}
          .iv-buttons{flex-direction:column!important}
          .iv-btn{width:100%!important}
        }
      `}</style>
    </div>
  );
}
