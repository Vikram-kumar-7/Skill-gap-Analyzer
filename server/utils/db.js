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
