import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import rateLimit from "express-rate-limit";
import { connectDB } from "./utils/db.js";
import { initQueue } from "./services/queueService.js";
import analyzeRoutes from "./routes/analyzeRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import githubRoutes from "./routes/githubRoutes.js";
import placementRoutes from "./routes/placementRoutes.js";

dotenv.config();

// Connect to Database & Initialize Background Task Queue
connectDB();
initQueue();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup
const allowedOrigins = [
  process.env.ALLOWED_ORIGIN,
  "https://skill-gap-analyzer-henna.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000"
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || /^http:\/\/localhost:\d+$/.test(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Rate limiters
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { error: "Too many AI requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const analyzeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: { error: "Too many analysis requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes
app.use("/api/analyze", analyzeLimiter, analyzeRoutes);
app.use("/api/ai", aiLimiter, aiRoutes);
app.use("/api/github", githubRoutes);
app.use("/api/placement", placementRoutes);

// === Static Data Endpoints ===
const dataDir = join(__dirname, "data");

app.get("/api/data/skills-meta", (req, res) => {
  const data = JSON.parse(
    readFileSync(join(dataDir, "skillsMeta.json"), "utf-8"),
  );
  res.json(data);
});

app.get("/api/data/courses", (req, res) => {
  const data = JSON.parse(readFileSync(join(dataDir, "courses.json"), "utf-8"));
  res.json(data);
});

app.get("/api/data/salaries", (req, res) => {
  const data = JSON.parse(
    readFileSync(join(dataDir, "salaries.json"), "utf-8"),
  );
  res.json(data);
});

app.get("/api/data/projects", (req, res) => {
  const data = JSON.parse(
    readFileSync(join(dataDir, "projects.json"), "utf-8"),
  );
  res.json(data);
});

app.get("/api/data/questions", (req, res) => {
  const data = JSON.parse(
    readFileSync(join(dataDir, "questions.json"), "utf-8"),
  );
  res.json(data);
});

app.get("/api/data/tips", (req, res) => {
  const data = JSON.parse(readFileSync(join(dataDir, "tips.json"), "utf-8"));
  res.json(data);
});

app.get("/api/data/benchmarks", (req, res) => {
  const data = JSON.parse(
    readFileSync(join(dataDir, "benchmarks.json"), "utf-8"),
  );
  res.json(data);
});

app.get("/api/data/dependencies", (req, res) => {
  const data = JSON.parse(
    readFileSync(join(dataDir, "dependencies.json"), "utf-8"),
  );
  res.json(data);
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
