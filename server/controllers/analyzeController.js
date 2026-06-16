import { extractTextFromPDF } from '../services/pdfService.js';
import { extractSkills } from '../services/skillExtractor.js';
import { compareSkills } from '../services/comparisonEngine.js';
import { analyzeMarket } from '../services/marketAnalyzer.js';
import { generateRoadmap } from '../services/roadmapGenerator.js';
import { generateInsights } from '../services/aiService.js';
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

    let resumeText = '';
    if (req.file) {
      resumeText = await extractTextFromPDF(req.file.buffer);
    } else if (req.body.resumeText) {
      resumeText = req.body.resumeText;
    } else {
      return res.status(400).json({ error: 'Please upload a resume PDF or provide resume text.' });
    }

    const resumeSkillsObj = extractSkills(resumeText);
    const jobSkillsObj = extractSkills(jobDescription);
    const { missing, matched, matchPercentage } = compareSkills(resumeSkillsObj, jobSkillsObj);
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

    const resumeSkillsStr = resumeSkillsObj.map((s) => s.skill);
    const jobSkillsStr = jobSkillsObj.map((s) => s.skill);

    res.json({
      success: true,
      data: {
        resumeSkills: resumeSkillsStr,
        jobSkills: jobSkillsStr,
        matched,
        missing,
        matchPercentage,
        marketData,
        roadmap,
        insights,
        benchmark: { role: benchmarkRole, ...benchmarkData },
        summary: {
          totalResumeSkills: resumeSkillsStr.length,
          totalJobSkills: jobSkillsStr.length,
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
