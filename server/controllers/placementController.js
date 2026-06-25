import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const weightsPath = join(__dirname, '../data/placementWeights.json');
const quizPath = join(__dirname, '../data/quiz.json');

export const getWeights = (req, res) => {
  try {
    const weights = JSON.parse(readFileSync(weightsPath, 'utf-8'));
    res.json({ success: true, data: weights });
  } catch (error) {
    res.status(500).json({ error: 'Failed to read placement weights.', details: error.message });
  }
};

export const updateWeights = (req, res) => {
  try {
    const { dsa, projects, resume, coreCs } = req.body;

    const nDsa = parseFloat(dsa);
    const nProjects = parseFloat(projects);
    const nResume = parseFloat(resume);
    const nCoreCs = parseFloat(coreCs);

    if (isNaN(nDsa) || isNaN(nProjects) || isNaN(nResume) || isNaN(nCoreCs)) {
      return res.status(400).json({ error: 'All weights must be valid numbers.' });
    }

    const sum = nDsa + nProjects + nResume + nCoreCs;
    if (Math.abs(sum - 1.0) > 0.05) {
      return res.status(400).json({ error: 'Weights must sum up to approximately 1.0 (currently ' + sum.toFixed(2) + ')' });
    }

    const updated = {
      dsa: nDsa,
      projects: nProjects,
      resume: nResume,
      coreCs: nCoreCs,
    };

    writeFileSync(weightsPath, JSON.stringify(updated, null, 2), 'utf-8');
    res.json({ success: true, message: 'Weights updated successfully.', data: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update placement weights.', details: error.message });
  }
};

export const getQuiz = (req, res) => {
  try {
    const quiz = JSON.parse(readFileSync(quizPath, 'utf-8'));
    res.json({ success: true, data: quiz });
  } catch (error) {
    res.status(500).json({ error: 'Failed to read CS quiz questions.', details: error.message });
  }
};
