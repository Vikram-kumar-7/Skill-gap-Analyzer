import axios from 'axios';

export const API_BASE_URL = (import.meta.env.VITE_API_URL || import.meta.env.VITE_APP_URL || '') + '/api';

/**
 * Send resume + job description to the backend for analysis.
 * @param {FormData} formData - Contains resume file and jobDescription text
 * @returns {Promise<object>} - Analysis results
 */
export const analyzeResume = async (formData) => {
  const response = await axios.post(`${API_BASE_URL}/analyze`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000,
  });
  return response.data;
};

/**
 * Health check for the API
 */
export const checkHealth = async () => {
  const response = await axios.get(`${API_BASE_URL}/health`);
  return response.data;
};
