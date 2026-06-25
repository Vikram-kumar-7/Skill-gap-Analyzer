import { runGitHubAnalysis } from '../services/githubService.js';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  console.log('Starting live GitHub analysis for Vikram-kumar-7 (after fix)...');
  try {
    const result = await runGitHubAnalysis('Vikram-kumar-7', (progress) => {
      console.log(`Progress: ${progress}%`);
    });
    console.log('\n--- Analysis Results ---');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Analysis failed:', error);
  }
}

run();
