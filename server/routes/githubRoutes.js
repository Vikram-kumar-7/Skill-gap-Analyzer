import { Router } from 'express';
import { kickoffAnalysis, getAnalysisResults } from '../controllers/githubController.js';

const router = Router();

// Kick off analysis (support both GET and POST)
router.get('/analyze/:username', kickoffAnalysis);
router.post('/analyze/:username', kickoffAnalysis);

// Get results
router.get('/results/:jobId', getAnalysisResults);

export default router;
