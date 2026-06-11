// ============================================================
// src/services/projectAI.js
// Gemma 4 26B handles all project and roadmap tasks:
//   - Project suggestions based on developer gaps
//   - milestone-based roadmaps
//   - Code reviews assessing historical coding habits
//
// Adzuna API provides real-world demand stats (salaries, vacancy count).
// ============================================================
import { ai } from './aiService';
import { HistoryService } from '../utils/userHistory';

export const ProjectAI = {
  /**
   * Suggests 3 personalized projects based on a topic and developer history gaps.
   * @param {string} topic - The skill/topic (e.g., "React", "Node.js")
   * @returns {Promise<Array<{name: string, description: string, difficulty: string, skillsCovered: string[], whyItHelps: string}>>}
   */
  async suggestProjects(topic) {
    const context = HistoryService.buildContext(topic);

    const prompt = `${context}You are a senior mentor. Suggest exactly 3 projects tailored to the developer's skill level and weak areas.
Focus on bridging the gaps listed in the history context if available.

TOPIC: ${topic}

Return ONLY a JSON array containing exactly 3 project objects in this format (no markdown, no preamble):
[
  {
    "name": "Project Title",
    "description": "Short, clear description of the project and its core functionality.",
    "difficulty": "Beginner | Intermediate | Advanced",
    "skillsCovered": ["Skill A", "Skill B"],
    "whyItHelps": "A brief explanation of how this specific project helps the user practice and overcome their weakness."
  }
]`;

    try {
      const result = await ai.generate(prompt, true);
      if (Array.isArray(result)) return result;
      throw new Error("Result is not an array");
    } catch (e) {
      console.error('[ProjectAI] suggestProjects failed:', e);
      // Fallback suggestions
      return [
        {
          name: `${topic} Portfolio Dashboard`,
          description: `A responsive dashboard application showcasing various advanced features and component patterns in ${topic}.`,
          difficulty: 'Intermediate',
          skillsCovered: [topic, 'CSS/Styling', 'State Management'],
          whyItHelps: `Helps you practice structure, clean component lifecycle hooks, and modular UI patterns in ${topic}.`
        },
        {
          name: `Interactive ${topic} Toolkit`,
          description: `A library of reusable utility components and functions built with ${topic}.`,
          difficulty: 'Advanced',
          skillsCovered: [topic, 'Performance Optimization', 'Unit Testing'],
          whyItHelps: `Forces you to think about edge cases, performance bottlenecks, and best practices.`
        },
        {
          name: `Mini ${topic} Application`,
          description: `A lightweight application featuring CRUD capabilities and external API consumption.`,
          difficulty: 'Beginner',
          skillsCovered: [topic, 'API Integration', 'Form Handling'],
          whyItHelps: `Solidifies the foundational core concepts and state flow of ${topic}.`
        }
      ];
    }
  },

  /**
   * Generates a step-by-step master plan learning roadmap for a specific skill gap.
   * @param {string} skill - The skill/topic to build a roadmap for
   * @returns {Promise<{skill: string, phases: Array<{phaseNumber: number, title: string, duration: string, topics: string[], milestone: string, resources: string[]}>}>}
   */
  async generateRoadmap(skill) {
    const prompt = `Create a step-by-step milestone-based learning roadmap to master the following skill.
SKILL: ${skill}

Return ONLY a JSON object in this format (no markdown, no explanation):
{
  "skill": "${skill}",
  "phases": [
    {
      "phaseNumber": 1,
      "title": "Phase Title",
      "duration": "e.g., 1-2 weeks",
      "topics": ["Key Concept 1", "Key Concept 2"],
      "milestone": "A practical goal or project that proves mastery of this phase.",
      "resources": ["Recommended learning resource or documentation link"]
    }
  ]
}`;

    try {
      const result = await ai.generate(prompt, true);
      if (result && result.phases) return result;
      throw new Error("Invalid roadmap structure");
    } catch (e) {
      console.error('[ProjectAI] generateRoadmap failed:', e);
      // Fallback roadmap
      return {
        skill,
        phases: [
          {
            phaseNumber: 1,
            title: `Foundations of ${skill}`,
            duration: '1 week',
            topics: [`Core syntax and principles of ${skill}`, 'Setup & standard project structure'],
            milestone: `Write a simple, clean hello-world or single-purpose script using ${skill}.`,
            resources: [`Official ${skill} documentation`, `Introductory tutorials`]
          },
          {
            phaseNumber: 2,
            title: `Intermediate concepts in ${skill}`,
            duration: '2 weeks',
            topics: ['Asynchronous patterns / complex states', 'Structuring larger applications', 'API integration / library ecosystems'],
            milestone: `Build a small, multi-feature app using ${skill} that consumes external APIs.`,
            resources: [`Advanced user guides`, `Community-recommended code repos`]
          },
          {
            phaseNumber: 3,
            title: `Advanced optimization & testing`,
            duration: '1 week',
            topics: ['Performance bottlenecks', 'Writing test suites', 'Deployment best practices'],
            milestone: `Write tests for your previous app and optimize its bundle size or execution speed.`,
            resources: [`Testing frameworks docs`, `Performance guidelines`]
          }
        ]
      };
    }
  },

  /**
   * Performs an asynchronous code review on user-provided code for a specific topic, taking history into account.
   * @param {string} code - The code snippet
   * @param {string} topic - The topic category (e.g. "React")
   * @returns {Promise<{overallFeedback: string, score: number, strengths: string[], improvements: Array<{issue: string, suggestion: string, lineReference: string, severity: "High"|"Medium"|"Low"}>, improvedCode: string}>}
   */
  async reviewCode(code, topic) {
    const context = HistoryService.buildContext(topic);

    const prompt = `${context}You are a senior tech lead conducting a code review. Assess the following code block for the topic "${topic}".
Inject warning flags or pay close attention to any chronic weak areas mentioned in the developer history context.

CODE TO REVIEW:
\`\`\`
${code}
\`\`\`

Return ONLY a JSON object in this format (no markdown, no explanation, no backticks):
{
  "overallFeedback": "Summary of overall quality and readability.",
  "score": 85, // 0-100 score
  "strengths": ["Clean structure", "Good naming"],
  "improvements": [
    {
      "issue": "Brief description of the problem",
      "suggestion": "How to fix it",
      "lineReference": "Line X",
      "severity": "High" // High | Medium | Low
    }
  ],
  "improvedCode": "A fully refactored, clean version of the user's code"
}`;

    try {
      const result = await ai.generate(prompt, true);
      if (result && typeof result.score === 'number') return result;
      throw new Error("Invalid review JSON response");
    } catch (e) {
      console.error('[ProjectAI] reviewCode failed:', e);
      return {
        overallFeedback: 'Review could not be fully generated by AI. Here is a baseline assessment.',
        score: 70,
        strengths: ['Code executes and looks readable'],
        improvements: [
          {
            issue: 'AI Code Review temporary fallback',
            suggestion: 'Double-check imports, variable declarations, and syntax rules.',
            lineReference: 'General',
            severity: 'Medium'
          }
        ],
        improvedCode: code
      };
    }
  },

  /**
   * Fetches job market and salary stats for a specific skill from the Adzuna API (India-based).
   * Fallback to mock data if credentials are missing or API fails.
   * @param {string} skill - The skill search query
   * @returns {Promise<{vacancyCount: number, avgSalary: number, salaryCurrency: string, lastUpdated: string, isMock: boolean}>}
   */
  async fetchSkillDemand(skill) {
    const appId = import.meta.env.VITE_ADZUNA_APP_ID;
    const appKey = import.meta.env.VITE_ADZUNA_APP_KEY;

    if (!appId || !appKey) {
      console.warn('[ProjectAI] Missing VITE_ADZUNA_APP_ID or VITE_ADZUNA_APP_KEY. Using regional mock demand data.');
      return getMockDemand(skill);
    }

    const url = `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${appId}&app_key=${appKey}&what=${encodeURIComponent(skill)}&results_per_page=5`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP status ${response.status}`);
      const data = await response.json();

      const vacancyCount = data.count || 0;
      
      // Calculate average salary from results
      let totalSalary = 0;
      let salaryCount = 0;
      if (Array.isArray(data.results)) {
        data.results.forEach(job => {
          if (job.salary_min || job.salary_max) {
            const min = job.salary_min || job.salary_max;
            const max = job.salary_max || job.salary_min;
            totalSalary += (min + max) / 2;
            salaryCount++;
          }
        });
      }

      // Default average salary in India for tech if no salaries are listed in search
      const avgSalary = salaryCount > 0 
        ? Math.round(totalSalary / salaryCount) 
        : getFallbackAvgSalary(skill);

      return {
        vacancyCount,
        avgSalary,
        salaryCurrency: 'INR',
        lastUpdated: new Date().toLocaleDateString(),
        isMock: false
      };
    } catch (e) {
      console.error('[ProjectAI] fetchSkillDemand failed:', e);
      return getMockDemand(skill);
    }
  }
};

// ── Helpers ──────────────────────────────────────────────────

function getFallbackAvgSalary(skill) {
  const s = skill.toLowerCase();
  if (s.includes('react') || s.includes('vue') || s.includes('frontend')) return 750000;
  if (s.includes('node') || s.includes('python') || s.includes('backend') || s.includes('java')) return 900000;
  if (s.includes('cloud') || s.includes('aws') || s.includes('devops')) return 1100000;
  return 600000;
}

function getMockDemand(skill) {
  const s = skill.toLowerCase();
  let vacancyCount = 850;
  let avgSalary = 650000;

  if (s.includes('react') || s.includes('javascript')) {
    vacancyCount = 2450;
    avgSalary = 820000;
  } else if (s.includes('node') || s.includes('backend')) {
    vacancyCount = 1800;
    avgSalary = 950000;
  } else if (s.includes('python') || s.includes('data') || s.includes('ai') || s.includes('ml')) {
    vacancyCount = 3100;
    avgSalary = 1200000;
  } else if (s.includes('css') || s.includes('html') || s.includes('design')) {
    vacancyCount = 620;
    avgSalary = 480000;
  }

  return {
    vacancyCount,
    avgSalary,
    salaryCurrency: 'INR',
    lastUpdated: new Date().toLocaleDateString(),
    isMock: true
  };
}
