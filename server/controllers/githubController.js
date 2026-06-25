import { addGitHubAnalysisJob, getGitHubAnalysisJobStatus } from '../services/queueService.js';
import { getGitHubAnalysis } from '../utils/db.js';

export const kickoffAnalysis = async (req, res) => {
  try {
    const { username } = req.params;
    if (!username || typeof username !== 'string') {
      return res.status(400).json({ error: 'GitHub username is required.' });
    }

    const cleanUsername = username.trim().toLowerCase();
    
    // Check MongoDB for cached results (24h TTL cache)
    const cached = await getGitHubAnalysis(cleanUsername);
    if (cached) {
      const cacheAgeMs = Date.now() - new Date(cached.last_analyzed_at).getTime();
      const cacheTtlMs = 24 * 60 * 60 * 1000; // 24 hours

      if (cacheAgeMs < cacheTtlMs) {
        console.log(`🎯 Serving cached GitHub analysis for: ${cleanUsername}`);
        return res.json({
          success: true,
          jobId: 'cached',
          username: cleanUsername,
          cached: true,
          result: cached.data,
        });
      }
    }

    // Queue new analysis job
    const jobId = await addGitHubAnalysisJob(cleanUsername);
    return res.json({
      success: true,
      jobId,
      username: cleanUsername,
      cached: false,
    });
  } catch (error) {
    console.error('GitHub analysis kickoff error:', error);
    res.status(500).json({ error: 'Failed to initiate GitHub analysis.', details: error.message });
  }
};

export const getAnalysisResults = async (req, res) => {
  try {
    const { jobId } = req.params;
    if (!jobId) {
      return res.status(400).json({ error: 'Job ID is required.' });
    }

    const job = await getGitHubAnalysisJobStatus(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found or expired.' });
    }

    return res.json({
      success: true,
      jobId,
      status: job.status,
      progress: job.progress,
      result: job.result,
      error: job.error,
    });
  } catch (error) {
    console.error('GitHub analysis fetch error:', error);
    res.status(500).json({ error: 'Failed to retrieve analysis results.', details: error.message });
  }
};
