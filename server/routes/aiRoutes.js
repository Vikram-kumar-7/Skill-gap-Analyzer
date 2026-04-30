import { Router } from "express";
import axios from "axios";

const router = Router();

/**
 * POST /api/ai/daily-tip — Generate daily personalized tip
 * Body: { week, topMissingCategory, targetRole, matchPercentage, apiKey }
 */
router.post("/daily-tip", async (req, res) => {
  const { week, topMissingCategory, targetRole, matchPercentage, apiKey } = req.body;
  const key = apiKey || process.env.OPENAI_API_KEY;

  if (key && key !== "your_openai_api_key_here") {
    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are a concise career coach. Reply with 2-3 sentences max." },
            { role: "user", content: `Week ${week}/12 of learning roadmap. Target role: ${targetRole}. Current match: ${matchPercentage}%. Biggest gap area: ${topMissingCategory}. Give one specific, actionable tip for today.` }
          ],
          temperature: 0.7,
          max_tokens: 100,
        },
        { headers: { Authorization: `Bearer ${key}` } }
      );
      return res.json({ tip: response.data.choices[0].message.content, source: "ai" });
    } catch (err) {
      console.warn("AI tip failed, using fallback:", err.message);
    }
  }

  // Rule-based fallback
  res.json({ tip: null, source: "fallback" });
});

/**
 * POST /api/ai/score-answer — Score an interview answer
 * Body: { question, answer, idealAnswer, keywords, apiKey }
 */
router.post("/score-answer", async (req, res) => {
  const { question, answer, idealAnswer, keywords, apiKey } = req.body;
  const key = apiKey || process.env.OPENAI_API_KEY;

  if (key && key !== "your_openai_api_key_here") {
    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are a technical interviewer. Score answers 0-100. Return JSON only: {\"score\": number, \"feedback\": {\"accuracy\": string, \"completeness\": string, \"clarity\": string, \"missedConcepts\": [string]}}" },
            { role: "user", content: `Question: ${question}\nCandidate Answer: ${answer}\nIdeal Answer: ${idealAnswer || 'N/A'}\nKey concepts: ${(keywords || []).join(', ')}\n\nScore and provide feedback.` }
          ],
          temperature: 0.3,
          response_format: { type: "json_object" },
        },
        { headers: { Authorization: `Bearer ${key}` } }
      );
      const parsed = JSON.parse(response.data.choices[0].message.content);
      return res.json({ ...parsed, source: "ai" });
    } catch (err) {
      console.warn("AI scoring failed:", err.message);
    }
  }

  // Rule-based scoring
  const answerLower = answer.toLowerCase();
  const kw = keywords || [];
  const matched = kw.filter(k => answerLower.includes(k.toLowerCase()));
  const score = Math.min(100, Math.round((matched.length / Math.max(kw.length, 1)) * 70 + (answer.length > 100 ? 15 : 5) + (answer.length > 250 ? 15 : 0)));
  
  res.json({
    score,
    feedback: {
      accuracy: matched.length >= kw.length * 0.7 ? "Good coverage of key concepts" : "Missing some important concepts",
      completeness: answer.length > 200 ? "Detailed response" : "Could be more thorough",
      clarity: "Provide specific examples for stronger answers",
      missedConcepts: kw.filter(k => !answerLower.includes(k.toLowerCase())),
    },
    source: "rule-based",
  });
});

/**
 * POST /api/ai/improve-bullet — Improve resume bullet point
 * Body: { bullet, role, apiKey }
 */
router.post("/improve-bullet", async (req, res) => {
  const { bullet, role, apiKey } = req.body;
  const key = apiKey || process.env.OPENAI_API_KEY;

  if (key && key !== "your_openai_api_key_here") {
    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are a resume expert. Return JSON: {\"improved\": [string, string, string]}" },
            { role: "user", content: `Improve this resume bullet for a ${role} role. Add metrics, action verbs, and impact. Original: "${bullet}". Return 3 stronger versions.` }
          ],
          temperature: 0.7,
          response_format: { type: "json_object" },
        },
        { headers: { Authorization: `Bearer ${key}` } }
      );
      return res.json(JSON.parse(response.data.choices[0].message.content));
    } catch (err) {
      console.warn("AI bullet improvement failed:", err.message);
    }
  }

  // Rule-based fallback
  const verbs = ["Engineered", "Architected", "Optimized", "Spearheaded"];
  res.json({
    improved: [
      `${verbs[0]} ${bullet.toLowerCase()}, resulting in measurable performance improvements`,
      `${verbs[1]} solution that ${bullet.toLowerCase()}, reducing complexity by 40%`,
      `${verbs[2]} ${bullet.toLowerCase()}, improving efficiency and team velocity by 25%`,
    ],
  });
});

/**
 * POST /api/ai/generate-project — Generate a custom project idea
 * Body: { skills, targetRole, apiKey }
 */
router.post("/generate-project", async (req, res) => {
  const { skills, targetRole, apiKey } = req.body;
  const key = apiKey || process.env.OPENAI_API_KEY;

  if (key && key !== "your_openai_api_key_here") {
    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "Generate a unique project idea. Return JSON: {\"title\": string, \"description\": string, \"features\": [string], \"techStack\": [string], \"milestones\": [string], \"difficulty\": string, \"estimatedHours\": number}" },
            { role: "user", content: `Generate a project for someone who knows [${skills.join(', ')}] and is targeting [${targetRole}]. Make it portfolio-worthy and realistic.` }
          ],
          temperature: 0.8,
          response_format: { type: "json_object" },
        },
        { headers: { Authorization: `Bearer ${key}` } }
      );
      return res.json({ ...JSON.parse(response.data.choices[0].message.content), source: "ai" });
    } catch (err) {
      console.warn("AI project generation failed:", err.message);
    }
  }

  // Rule-based fallback
  const templates = [
    { title: `${targetRole} Portfolio Dashboard`, features: ["Authentication", "Data visualization", "CRUD operations", "Responsive design"], difficulty: "Medium", estimatedHours: 30 },
    { title: `Real-time ${skills[0] || 'Tech'} Tracker`, features: ["WebSocket updates", "Search and filter", "Charts", "Export data"], difficulty: "Hard", estimatedHours: 40 },
  ];
  const tmpl = templates[Math.floor(Math.random() * templates.length)];
  res.json({
    ...tmpl,
    description: `Build a ${tmpl.title} using ${skills.slice(0, 3).join(', ')}. Perfect for demonstrating full-stack capabilities.`,
    techStack: skills.slice(0, 5),
    milestones: ["Set up project scaffold", "Build core features", "Add authentication", "Implement UI/UX polish", "Deploy and document"],
    source: "rule-based",
  });
});

/**
 * POST /api/ai/generate-summary — Generate professional resume summary
 * Body: { role, skills, apiKey }
 */
router.post("/generate-summary", async (req, res) => {
  const { role, skills, apiKey } = req.body;
  const key = apiKey || process.env.OPENAI_API_KEY;

  if (key && key !== "your_openai_api_key_here") {
    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "Write a professional 3-sentence resume summary. Return JSON: {\"summary\": string}" },
            { role: "user", content: `Role: ${role}. Top skills: ${skills.join(', ')}. Write a compelling professional summary.` }
          ],
          temperature: 0.7,
          response_format: { type: "json_object" },
        },
        { headers: { Authorization: `Bearer ${key}` } }
      );
      return res.json(JSON.parse(response.data.choices[0].message.content));
    } catch (err) {
      console.warn("AI summary generation failed:", err.message);
    }
  }

  // Rule-based fallback
  res.json({
    summary: `Results-driven ${role} with expertise in ${skills.slice(0, 3).join(', ')}. Passionate about building scalable, user-centric solutions with modern technologies. Proven track record of delivering high-quality code and collaborating effectively in agile environments.`,
  });
});

export default router;
