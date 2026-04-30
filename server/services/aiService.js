import axios from "axios";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const staticProjects = JSON.parse(
  readFileSync(join(__dirname, "../data/projects.json"), "utf-8")
);

export const generateInsights = async (
  resumeText,
  jobText,
  missingSkills,
  matchedSkills,
  useAiMode = true
) => {
  if (useAiMode && process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "your_openai_api_key_here") {
    try {
      return await generateAIInsights(resumeText, jobText, missingSkills);
    } catch (error) {
      console.warn("AI service unavailable, using rule-based fallback:", error.message);
    }
  }

  return generateRuleBasedInsights(resumeText, jobText, missingSkills, matchedSkills);
};

async function generateAIInsights(resumeText, jobText, missingSkills) {
  const missingStr = missingSkills.slice(0, 5).join(", ");
  
  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a career advisor and technical interviewer. Return valid JSON only.`,
        },
        {
          role: "user",
          content: `Analyze this based on the job description and resume.
Focus on missing skills: ${missingStr}

Return JSON exact format:
{
  "summary": "2 sentence summary",
  "strengths": ["...", "..."],
  "improvements": ["...", "..."],
  "resumeTips": ["...", "..."],
  "interviewPrep": [
    {"question": "...", "reason": "Because they lack X"}
  ],
  "recommendedProjects": [
    {"title": "...", "desc": "...", "focusSkills": ["..."]}
  ]
}

Resume: ${resumeText.substring(0, 1500)}
Job: ${jobText.substring(0, 1500)}`,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    },
    {
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    }
  );

  const content = response.data.choices[0].message.content;
  try {
    return { ...JSON.parse(content), source: "ai" };
  } catch {
    return generateRuleBasedInsights(resumeText, jobText, missingSkills, []);
  }
}

function generateRuleBasedInsights(resumeText, jobText, missingSkills, matchedSkills) {
  const matchRatio = matchedSkills.length / (matchedSkills.length + missingSkills.length || 1);
  let summary = matchRatio >= 0.8 ? "Excellent match!" : "Significant skill gaps detected.";

  // Generate Projects based on missing skills
  const recommendedProjects = [];
  missingSkills.forEach(skill => {
    const projList = staticProjects[skill.toLowerCase()];
    if (projList) {
      recommendedProjects.push({
        title: projList[0].title,
        desc: projList[0].desc,
        focusSkills: [skill]
      });
    }
  });

  if (recommendedProjects.length === 0) {
    recommendedProjects.push({
      title: "Full Stack Task Manager",
      desc: `Build a comprehensive app utilizing: ${missingSkills.slice(0,3).join(', ')}`,
      focusSkills: missingSkills.slice(0,3)
    });
  }

  // Generate Interview Prep based on missing skills
  const interviewPrep = missingSkills.slice(0, 3).map(skill => ({
    question: `How would you handle a scenario requiring ${skill}?`,
    reason: `You lack direct experience in ${skill}, so expect theoretical questions.`
  }));

  matchedSkills.slice(0, 2).forEach(skill => {
    interviewPrep.push({
      question: `Describe a complex problem you solved using ${skill}.`,
      reason: `You listed ${skill}, so expect deep-dive questions to verify expertise.`
    });
  });

  return {
    summary,
    strengths: matchedSkills.slice(0, 4).map(s => `Strong background in ${s}`),
    improvements: missingSkills.slice(0, 4).map(s => `Need to learn ${s}`),
    resumeTips: [
      "Quantify your achievements (e.g., 'Improved load time by 40%')",
      "Tailor your summary to match the job description keywords"
    ],
    interviewPrep,
    recommendedProjects: recommendedProjects.slice(0, 3),
    source: "rule-based",
  };
}
