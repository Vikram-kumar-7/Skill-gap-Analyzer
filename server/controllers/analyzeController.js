import { extractTextFromPDF } from '../services/pdfService.js';
import { extractSkills } from '../services/skillExtractor.js';
import { analyzeMarket } from '../services/marketAnalyzer.js';
import { generateRoadmap } from '../services/roadmapGenerator.js';
import { generateInsights, extractSkillsWithAI } from '../services/aiService.js';
import { getGitHubAnalysis } from '../utils/db.js';
import { normalizeSkills, findGaps, findMatches, matchScore } from '../utils/skillAliases.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const benchmarks = JSON.parse(readFileSync(join(__dirname, '../data/benchmarks.json'), 'utf-8'));

export const analyze = async (req, res) => {
  try {
    const { jobDescription, targetRole, aiMode } = req.body;
    const useAiMode = aiMode === 'true' || aiMode === true;

    if (!jobDescription) {
      return res.status(400).json({ error: 'Job description is required.' });
    }

    if (typeof jobDescription !== 'string' || jobDescription.length > 50000) {
      return res.status(400).json({ error: 'Job description must be a string under 50,000 characters.' });
    }

    if (targetRole && (typeof targetRole !== 'string' || targetRole.length > 200)) {
      return res.status(400).json({ error: 'Target role must be a string under 200 characters.' });
    }

    let resumeText = '';
    if (req.file) {
      resumeText = await extractTextFromPDF(req.file.buffer);
    } else if (req.body.resumeText) {
      resumeText = req.body.resumeText;
    } else {
      return res.status(400).json({ error: 'Please upload a resume PDF or provide resume text.' });
    }

    if (typeof resumeText !== 'string' || resumeText.length > 50000) {
      return res.status(400).json({ error: 'Resume text must be a string under 50,000 characters.' });
    }

    // ── AI extraction (with rule-based fallback) ──
    const rawResumeSkillsAi = useAiMode ? await extractSkillsWithAI(resumeText) : [];
    const resumeSkillsArr = rawResumeSkillsAi.length > 0
      ? rawResumeSkillsAi
      : extractSkills(resumeText).map(s => s.skill);

    const rawJdSkillsAi = useAiMode ? await extractSkillsWithAI(jobDescription) : [];
    const jdSkillsArr = rawJdSkillsAi.length > 0
      ? rawJdSkillsAi
      : extractSkills(jobDescription).map(s => s.skill);

    // ── Merge GitHub Intelligence ──
    const githubUsername = req.body.githubUsername || req.query.githubUsername;
    if (githubUsername) {
      try {
        const cached = await getGitHubAnalysis(githubUsername);
        if (cached && cached.data && cached.data.skillConfidence) {
          const confidenceThreshold = 3.0;
          const gitSkills = Object.entries(cached.data.skillConfidence)
            .filter(([_, conf]) => conf >= confidenceThreshold)
            .map(([skill]) => skill.toLowerCase());

          const existingSkills = new Set(normalizeSkills(resumeSkillsArr));
          for (const gs of gitSkills) {
            if (!existingSkills.has(gs.toLowerCase())) {
              resumeSkillsArr.push(gs);
            }
          }
        }
      } catch (err) {
        console.warn('Failed to merge GitHub skills in resume analysis:', err.message);
      }
    }

    // ── Debug: raw vs normalized skill lists ──
    console.log('=== RAW RESUME SKILLS ===', resumeSkillsArr);
    console.log('=== RAW JD SKILLS ===', jdSkillsArr);

    // ── Normalize both sides via alias map ──
    const resumeSkills = normalizeSkills(resumeSkillsArr);
    const jdSkills = normalizeSkills(jdSkillsArr);

    console.log('=== NORMALIZED RESUME ===', resumeSkills);
    console.log('=== NORMALIZED JD ===', jdSkills);

    // ── Alias-aware comparison ──
    const missing = findGaps(resumeSkills, jdSkills);
    const matched = findMatches(resumeSkills, jdSkills);
    const matchPercentage = matchScore(resumeSkills, jdSkills);
    const marketData = analyzeMarket(missing);
    const roadmap = generateRoadmap(marketData);
    const insights = await generateInsights(
      resumeText,
      jobDescription,
      missing,
      matched,
      useAiMode
    );

    // Get benchmark if targetRole provided or guess it
    const benchmarkRole = targetRole || 'Full Stack Engineer';
    const benchmarkData = benchmarks[benchmarkRole] || benchmarks['Full Stack Engineer'];

    res.json({
      success: true,
      data: {
        resumeSkills,
        jobSkills: jdSkills,
        matched,
        missing,
        matchPercentage,
        marketData,
        roadmap,
        insights,
        benchmark: { role: benchmarkRole, ...benchmarkData },
        summary: {
          totalResumeSkills: resumeSkills.length,
          totalJobSkills: jdSkills.length,
          matchedCount: matched.length,
          missingCount: missing.length,
          matchPercentage,
        },
      },
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Analysis failed. Please try again.', details: error.message });
  }
};
