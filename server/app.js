import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import analyzeRoutes from "./routes/analyzeRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/analyze", analyzeRoutes);
app.use("/api/ai", aiRoutes);

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
