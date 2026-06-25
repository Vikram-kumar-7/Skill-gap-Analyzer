import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { runGitHubAnalysis } from './githubService.js';
import { saveGitHubAnalysis } from '../utils/db.js';

let isQueueFallback = false;
let redisConnection = null;
let analysisQueue = null;
let analysisWorker = null;

// In-memory queue state
const memoryJobs = new Map();

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

export const initQueue = async () => {
  const host = process.env.REDIS_HOST || '127.0.0.1';
  const port = parseInt(process.env.REDIS_PORT || '6379');

  try {
    redisConnection = new IORedis({
      host,
      port,
      maxRetriesPerRequest: null,
      connectTimeout: 2000,
    });

    redisConnection.on('error', (err) => {
      if (!isQueueFallback) {
        console.warn(`⚠️ Redis error: ${err.message}. Falling back to in-memory queue.`);
        isQueueFallback = true;
      }
    });

    // Verify connection
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 2000);

      redisConnection.ping((err) => {
        clearTimeout(timeout);
        if (err) reject(err);
        else resolve();
      });
    });

    analysisQueue = new Queue('github-analysis', { connection: redisConnection });
    
    analysisWorker = new Worker('github-analysis', async (job) => {
      const { username } = job.data;
      console.log(`🤖 [BullMQ] Starting analysis for user: ${username}`);
      const results = await runGitHubAnalysis(username);
      await saveGitHubAnalysis(username, results);
      return results;
    }, { connection: redisConnection });

    analysisWorker.on('completed', (job) => {
      console.log(`✅ [BullMQ] Job ${job.id} completed for user: ${job.data.username}`);
    });

    analysisWorker.on('failed', (job, err) => {
      console.error(`❌ [BullMQ] Job ${job?.id} failed: ${err.message}`);
    });

    console.log('🚀 BullMQ initialized successfully.');
    isQueueFallback = false;
  } catch (error) {
    console.warn(`⚠️ Redis not available: ${error.message}. Running in standalone memory-queue mode.`);
    isQueueFallback = true;
  }
};

export const addGitHubAnalysisJob = async (username) => {
  const normalizedUsername = username.toLowerCase().trim();
  
  if (isQueueFallback) {
    const jobId = 'mem_' + generateId();
    memoryJobs.set(jobId, {
      id: jobId,
      username: normalizedUsername,
      status: 'pending',
      progress: 0,
      result: null,
      error: null,
      createdAt: Date.now(),
    });

    // Run the job in the background asynchronously
    setImmediate(async () => {
      const job = memoryJobs.get(jobId);
      if (!job) return;
      
      try {
        job.status = 'active';
        job.progress = 20;
        console.log(`🤖 [MemoryQueue] Starting analysis for user: ${normalizedUsername}`);
        
        const results = await runGitHubAnalysis(normalizedUsername, (progressPercent) => {
          job.progress = 20 + Math.round(progressPercent * 0.7); // scale 20-90%
        });
        
        job.progress = 100;
        job.status = 'completed';
        job.result = results;
        await saveGitHubAnalysis(normalizedUsername, results);
        console.log(`✅ [MemoryQueue] Completed analysis for user: ${normalizedUsername}`);
      } catch (err) {
        job.status = 'failed';
        job.error = err.message;
        console.error(`❌ [MemoryQueue] Failed analysis for user: ${normalizedUsername}: ${err.message}`);
      }
    });

    return jobId;
  }

  // BullMQ logic
  try {
    const job = await analysisQueue.add('analyze-github', { username: normalizedUsername });
    return job.id;
  } catch (error) {
    console.error('BullMQ add failed, falling back to memory queue:', error.message);
    isQueueFallback = true;
    return addGitHubAnalysisJob(username);
  }
};

export const getGitHubAnalysisJobStatus = async (jobId) => {
  if (jobId.startsWith('mem_') || isQueueFallback) {
    const job = memoryJobs.get(jobId);
    if (!job) return null;
    return {
      id: job.id,
      status: job.status,
      progress: job.progress,
      result: job.result,
      error: job.error,
    };
  }

  try {
    const job = await analysisQueue.getJob(jobId);
    if (!job) return null;

    const state = await job.getState();
    const result = job.returnvalue;
    const progress = job.progress || (state === 'completed' ? 100 : state === 'active' ? 50 : 0);

    return {
      id: job.id,
      status: state, // 'completed' | 'failed' | 'active' | 'delayed' | 'waiting'
      progress: typeof progress === 'number' ? progress : parseInt(progress) || 0,
      result: result || null,
      error: job.failedReason || null,
    };
  } catch (error) {
    console.error('BullMQ getJobStatus failed, checking memory jobs:', error.message);
    const job = memoryJobs.get(jobId);
    if (!job) return null;
    return {
      id: job.id,
      status: job.status,
      progress: job.progress,
      result: job.result,
      error: job.error,
    };
  }
};

export const isQueueUsingFallback = () => isQueueFallback;
