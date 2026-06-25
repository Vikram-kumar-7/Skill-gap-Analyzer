import axios from 'axios';

const API_BASE = (import.meta.env.VITE_API_URL || import.meta.env.VITE_APP_URL || '') + '/api';

/**
 * Start GitHub analysis for a specific username.
 */
export const analyzeGitHub = async (username) => {
  const response = await axios.get(`${API_BASE}/github/analyze/${username}`);
  return response.data;
};

/**
 * Retrieve current background analysis status/results.
 */
export const getGitHubJobStatus = async (jobId) => {
  const response = await axios.get(`${API_BASE}/github/results/${jobId}`);
  return response.data;
};

/**
 * Retrieve configured placement weights.
 */
export const getPlacementWeights = async () => {
  const response = await axios.get(`${API_BASE}/placement/weights`);
  return response.data;
};

/**
 * Save updated weights.
 */
export const updatePlacementWeights = async (weights) => {
  const response = await axios.post(`${API_BASE}/placement/weights`, weights);
  return response.data;
};

/**
 * Retrieve CS core MCQ quiz questions.
 */
export const getCSQuiz = async () => {
  const response = await axios.get(`${API_BASE}/placement/quiz`);
  return response.data;
};
