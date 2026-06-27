import mongoose from 'mongoose';
import { logStructured } from './logger.js';

let isFallbackMode = false;
const memoryDb = new Map();

// Schema definition
const githubAnalysisSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, index: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  last_analyzed_at: { type: Date, default: Date.now },
});

let GitHubAnalysisModel;
try {
  GitHubAnalysisModel = mongoose.model('GitHubAnalysis', githubAnalysisSchema);
} catch {
  GitHubAnalysisModel = mongoose.models.GitHubAnalysis;
}

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/skillgap';
  try {
    // Attempt connection with a short timeout so we don't hang startup if Mongo isn't running
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log('🔌 MongoDB connected successfully.');
    isFallbackMode = false;
  } catch (error) {
    console.warn(`⚠️ MongoDB connection failed: ${error.message}`);
    console.warn('⚠️ Running GitHub Intelligence Engine in standalone memory-fallback mode.');
    isFallbackMode = true;
  }
};

export const saveGitHubAnalysis = async (username, data) => {
  const normalizedUsername = username.toLowerCase().trim();
  if (isFallbackMode) {
    memoryDb.set(normalizedUsername, {
      username: normalizedUsername,
      data,
      last_analyzed_at: new Date(),
    });
    return true;
  }

  try {
    await GitHubAnalysisModel.findOneAndUpdate(
      { username: normalizedUsername },
      { data, last_analyzed_at: new Date() },
      { upsert: true, new: true }
    );
    return true;
  } catch (error) {
    console.error('Failed to save to MongoDB, saving in memory fallback:', error.message);
    memoryDb.set(normalizedUsername, {
      username: normalizedUsername,
      data,
      last_analyzed_at: new Date(),
    });
    return false;
  }
};

export const getGitHubAnalysis = async (username) => {
  const normalizedUsername = username.toLowerCase().trim();
  if (isFallbackMode) {
    return memoryDb.get(normalizedUsername) || null;
  }

  try {
    const record = await GitHubAnalysisModel.findOne({ username: normalizedUsername });
    if (record) {
      return {
        username: record.username,
        data: record.data,
        last_analyzed_at: record.last_analyzed_at,
      };
    }
    // Check fallback just in case
    return memoryDb.get(normalizedUsername) || null;
  } catch (error) {
    console.error('Failed to read from MongoDB, reading from memory fallback:', error.message);
    return memoryDb.get(normalizedUsername) || null;
  }
};

export const isMongoDBFallback = () => isFallbackMode;

// ═══════════════════════════════════════════════
// DSA SCORE SCHEMA & METHODS
// ═══════════════════════════════════════════════

const dsaScoreSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  username: { type: String, required: true },
  leetcodeUsername: { type: String, default: null },
  easy: { type: Number, default: 0 },
  medium: { type: Number, default: 0 },
  hard: { type: Number, default: 0 },
  score: { type: Number, default: 0 },
  tier: { type: String, enum: ['Beginner', 'Internship-ready', 'Startup SDE-1', 'Product company ready', 'FAANG interviews', 'Competitive level'] },
  scoreBreakdown: {
    easy: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    hard: { type: Number, default: 0 },
  },
  savedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  source: { type: String, enum: ['leetcode', 'gfg', 'manual'], default: 'leetcode' },
  acceptanceRate: { type: Number, default: 0 },
  ranking: { type: Number, default: null },
});

let DSAScoreModel;
try {
  DSAScoreModel = mongoose.model('DSAScore', dsaScoreSchema);
} catch {
  DSAScoreModel = mongoose.models.DSAScore;
}

// Memory fallback for DSA scores
const dsaMemoryDb = new Map();

export const saveDSAScore = async (userId, scoreData) => {
  const { username, easy, medium, hard, score, tier, scoreBreakdown } = scoreData;

  if (isFallbackMode) {
    dsaMemoryDb.set(userId, {
      userId,
      username,
      easy,
      medium,
      hard,
      score,
      tier,
      scoreBreakdown,
      savedAt: new Date(),
      updatedAt: new Date(),
    });
    return true;
  }

  try {
    await DSAScoreModel.findOneAndUpdate(
      { userId },
      {
        userId,
        username,
        easy,
        medium,
        hard,
        score,
        tier,
        scoreBreakdown,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );
    return true;
  } catch (error) {
    console.error('Failed to save DSA score to MongoDB:', error.message);
    dsaMemoryDb.set(userId, {
      userId,
      username,
      easy,
      medium,
      hard,
      score,
      tier,
      scoreBreakdown,
      savedAt: new Date(),
      updatedAt: new Date(),
    });
    return false;
  }
};

export const getDSAScore = async (userId) => {
  if (isFallbackMode) {
    return dsaMemoryDb.get(userId) || null;
  }

  try {
    const record = await DSAScoreModel.findOne({ userId });
    if (record) {
      return record.toObject();
    }
    return dsaMemoryDb.get(userId) || null;
  } catch (error) {
    console.error('Failed to get DSA score from MongoDB:', error.message);
    return dsaMemoryDb.get(userId) || null;
  }
};

export const getDSAScoreHistory = async (userId, limit = 30) => {
  if (isFallbackMode) {
    const current = dsaMemoryDb.get(userId);
    return current ? [current] : [];
  }

  try {
    const records = await DSAScoreModel.find({ userId })
      .sort({ savedAt: -1 })
      .limit(limit)
      .lean();
    return records;
  } catch (error) {
    console.error('Failed to get DSA score history:', error.message);
    const current = dsaMemoryDb.get(userId);
    return current ? [current] : [];
  }
};

export const saveLeetcodeUsername = async (userId, leetcodeUsername) => {
  if (isFallbackMode) {
    const current = dsaMemoryDb.get(userId) || {};
    dsaMemoryDb.set(userId, { ...current, userId, leetcodeUsername });
    return true;
  }

  try {
    await DSAScoreModel.findOneAndUpdate(
      { userId },
      { leetcodeUsername, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    return true;
  } catch (error) {
    console.error('Failed to save LeetCode username:', error.message);
    return false;
  }
};
