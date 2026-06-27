import React, { useState, useEffect } from 'react';
import { ScoreGauge } from '../components/DSA/ScoreGauge';
import { MobileSlider } from '../components/DSA/MobileSlider';
import { ScoreBreakdown } from '../components/DSA/ScoreBreakdown';
import { ActionabilityEngine } from '../components/DSA/ActionabilityEngine';
import { ShareCard } from '../components/DSA/ShareCard';
import { dsaAPI } from '../services/dsaService';
import { dsaStorage } from '../utils/dsaStorage';
import {
  calculateDSAScore,
  getDSATier,
  getScoreBreakdown,
  generateActionableSuggestions,
  getTierColor,
  BENCHMARK_TIERS,
} from '../utils/dsaCalculations';
import useToast from '../utils/useToast';

/**
 * DSA Tracker Page
 * Comprehensive DSA problem-solving progress tracker with AI-powered insights
 */
export default function DSATrackerPage() {
  const showToast = useToast();

  // Main state
  const [easy, setEasy] = useState(0);
  const [medium, setMedium] = useState(0);
  const [hard, setHard] = useState(0);
  const [leetcodeUsername, setLeetcodeUsername] = useState('');
  const [targetScore, setTargetScore] = useState(70);

  // UI state
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, history, roadmap, benchmarks
  const [roadmap, setRoadmap] = useState(null);
  const [history, setHistory] = useState([]);
  const [showSyncInput, setShowSyncInput] = useState(false);

  // Calculated values
  const score = calculateDSAScore(easy, medium, hard);
  const tier = getDSATier(score);
  const breakdown = getScoreBreakdown(easy, medium, hard);
  const suggestions = generateActionableSuggestions(easy, medium, hard, targetScore);
  const weeklyDelta = dsaStorage.getWeeklyDelta();

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load from localStorage first
        const saved = dsaStorage.getScore();
        const savedUsername = dsaStorage.getLeetcodeUsername();
        const hist = dsaStorage.getHistory();

        if (saved) {
          setEasy(saved.easy);
          setMedium(saved.medium);
          setHard(saved.hard);
        }

        if (savedUsername) {
          setLeetcodeUsername(savedUsername);
        }

        if (hist.length > 0) {
          setHistory(hist);
        }
      } catch (error) {
        console.error('Failed to load DSA data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Auto-save to localStorage whenever values change
  useEffect(() => {
    const timer = setTimeout(() => {
      dsaStorage.saveScore({
        easy,
        medium,
        hard,
        score,
        tier,
        scoreBreakdown: breakdown,
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [easy, medium, hard, score, tier, breakdown]);

  /**
   * Sync with LeetCode API
   */
  const handleSyncLeetCode = async () => {
    if (!leetcodeUsername.trim()) {
      showToast('Please enter your LeetCode username', 'error');
      return;
    }

    try {
      setSyncing(true);
      const response = await dsaAPI.fetchLeetCodeStats(leetcodeUsername);

      if (response.success) {
        const stats = response.data.stats;
        setEasy(stats.easy);
        setMedium(stats.medium);
        setHard(stats.hard);

        // Save to backend
        const userId = 'demo-user'; // TODO: Get from auth context
        await dsaAPI.saveLeetcodeUsername(userId, leetcodeUsername);
        await dsaAPI.saveDSAScore(userId, {
          username: 'Demo User',
          easy: stats.easy,
          medium: stats.medium,
          hard: stats.hard,
        });

        // Add to history
        dsaStorage.addToHistory({
          easy: stats.easy,
          medium: stats.medium,
          hard: stats.hard,
          score: response.data.score,
          tier: response.data.tier,
        });

        setShowSyncInput(false);
        showToast('✅ LeetCode stats synced successfully!', 'success');
      }
    } catch (error) {
      showToast(`Failed to sync: ${error.message}`, 'error');
    } finally {
      setSyncing(false);
    }
  };

  /**
   * Generate AI roadmap
   */
  const handleGenerateRoadmap = async () => {
    try {
      setLoading(true);
      const userId = 'demo-user'; // TODO: Get from auth context

      const response = await dsaAPI.generateRoadmap(
        userId,
        { easy, medium, hard, score },
        `Reach ${targetScore} in 90 days`
      );

      if (response.success) {
        setRoadmap(response.data);
        setActiveTab('roadmap');
        showToast('🎯 AI roadmap generated!', 'success');
      }
    } catch (error) {
      showToast(`Failed to generate roadmap: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Save score to history
   */
  const handleSaveScore = () => {
    dsaStorage.addToHistory({
      easy,
      medium,
      hard,
      score,
      tier,
      scoreBreakdown: breakdown,
    });

    setHistory(dsaStorage.getHistory());
    showToast('📊 Score saved to history!', 'success');
  };

  return (
    <div
      style={{
        padding: 'max(16px, env(safe-area-inset-left))',
        maxWidth: '1200px',
        margin: '0 auto',
      }}
    >
      <style>{`
        .dsa-hero {
          background: linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(16,185,129,0.05) 100%);
          border: 1px solid rgba(16,185,129,0.2);
          border-radius: 16px;
          padding: 28px 24px;
          margin-bottom: 24px;
          animation: fadeIn 0.6s ease-out;
        }

        @media (max-width: 640px) {
          .dsa-hero {
            padding: 20px 16px;
            margin-bottom: 16px;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dsa-grid {
          display: grid;
          grid-template-columns: 200px 1fr;
          gap: 24px;
          margin-bottom: 24px;
        }

        @media (max-width: 768px) {
          .dsa-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }

        .dsa-card {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 20px;
        }

        @media (max-width: 640px) {
          .dsa-card {
            padding: 16px;
          }
        }

        .dsa-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          overflow-x: auto;
          padding-bottom: 12px;
        }

        .dsa-tab {
          padding: 8px 16px;
          border: none;
          background: none;
          color: rgba(248, 250, 252, 0.6);
          cursor: pointer;
          font-weight: 500;
          font-size: 13px;
          border-bottom: 2px solid transparent;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .dsa-tab:hover {
          color: rgba(248, 250, 252, 0.9);
        }

        .dsa-tab.active {
          color: var(--accent);
          border-bottom-color: var(--accent);
        }

        @media (max-width: 640px) {
          .dsa-tab {
            padding: 8px 12px;
            font-size: 12px;
          }
        }
      `}</style>

      {/* Header */}
      <div className="dsa-hero">
        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px', color: 'rgba(248, 250, 252, 0.95)' }}>
          📊 DSA Tracker
        </h1>
        <p style={{ fontSize: '14px', color: 'rgba(248, 250, 252, 0.6)', marginBottom: '16px' }}>
          Track your LeetCode progress and get AI-powered insights to prepare for your next role
        </p>

        {/* Weekly delta */}
        {weeklyDelta && (
          <div
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '8px',
              padding: '10px 14px',
              fontSize: '13px',
              color: 'rgba(248, 250, 252, 0.8)',
            }}
          >
            📈 Last week: {Math.round(weeklyDelta.previousScore)} → Today: {Math.round(weeklyDelta.currentScore)}{' '}
            <span style={{ color: 'var(--accent)' }}>▲{Math.round(weeklyDelta.delta)}</span>
          </div>
        )}
      </div>

      {/* LeetCode Sync Section */}
      {!leetcodeUsername && (
        <div className="dsa-card" style={{ marginBottom: '24px', backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: 'rgba(248, 250, 252, 0.9)' }}>
            🔗 Sync with LeetCode
          </h3>
          <p style={{ fontSize: '13px', color: 'rgba(248, 250, 252, 0.6)', marginBottom: '12px' }}>
            Connect your LeetCode account to automatically track your progress
          </p>

          {!showSyncInput ? (
            <button
              onClick={() => setShowSyncInput(true)}
              style={{
                padding: '8px 16px',
                backgroundColor: 'rgba(59, 130, 246, 0.3)',
                color: 'var(--accent)',
                border: '1px solid rgba(59, 130, 246, 0.5)',
                borderRadius: '6px',
                fontWeight: 500,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              Set LeetCode Username
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Your LeetCode username"
                value={leetcodeUsername}
                onChange={(e) => setLeetcodeUsername(e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '13px',
                }}
              />
              <button
                onClick={handleSyncLeetCode}
                disabled={syncing}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'var(--accent)',
                  color: '#07090f',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: syncing ? 'not-allowed' : 'pointer',
                  opacity: syncing ? 0.6 : 1,
                }}
              >
                {syncing ? '⏳ Syncing...' : '✓ Sync'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main content grid */}
      <div className="dsa-grid">
        {/* Score Gauge */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <ScoreGauge score={score} size={180} />
        </div>

        {/* Input Sliders */}
        <div className="dsa-card">
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'rgba(248, 250, 252, 0.9)' }}>
            Update Your Stats
          </h3>

          <div style={{ display: 'grid', gap: '16px' }}>
            <MobileSlider
              label="Easy Problems"
              value={easy}
              min={0}
              max={500}
              onChange={setEasy}
              unit=""
            />
            <MobileSlider
              label="Medium Problems"
              value={medium}
              min={0}
              max={500}
              onChange={setMedium}
              unit=""
            />
            <MobileSlider
              label="Hard Problems"
              value={hard}
              min={0}
              max={500}
              onChange={setHard}
              unit=""
            />

            <div style={{ marginTop: '8px', padding: '12px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '6px' }}>
              <div style={{ fontSize: '12px', color: 'rgba(248, 250, 252, 0.6)', marginBottom: '4px' }}>
                Current Score
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--accent)' }}>
                {Math.round(score * 100) / 100}
                <span style={{ fontSize: '14px', color: 'rgba(248, 250, 252, 0.6)' }}> / 100</span>
              </div>
            </div>

            <button
              onClick={handleSaveScore}
              style={{
                padding: '10px 16px',
                backgroundColor: 'var(--accent)',
                color: '#07090f',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              💾 Save Score
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="dsa-tabs">
        <button
          className={`dsa-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`dsa-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📈 History
        </button>
        <button
          className={`dsa-tab ${activeTab === 'roadmap' ? 'active' : ''}`}
          onClick={() => setActiveTab('roadmap')}
        >
          🗺️ Roadmap
        </button>
        <button
          className={`dsa-tab ${activeTab === 'benchmarks' ? 'active' : ''}`}
          onClick={() => setActiveTab('benchmarks')}
        >
          🎯 Benchmarks
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gap: '20px' }}>
          <ScoreBreakdown breakdown={breakdown} score={score} />

          <div className="dsa-card">
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'rgba(248, 250, 252, 0.9)' }}>
              📊 Current Tier
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  fontSize: '48px',
                  width: '80px',
                  height: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  border: `2px solid ${getTierColor(tier)}`,
                }}
              >
                {tier === 'Beginner' && '📚'}
                {tier === 'Internship-ready' && '🎓'}
                {tier === 'Startup SDE-1' && '🚀'}
                {tier === 'Product company ready' && '🎯'}
                {tier === 'FAANG interviews' && '✨'}
                {tier === 'Competitive level' && '👑'}
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: getTierColor(tier), marginBottom: '4px' }}>
                  {tier}
                </div>
                <p style={{ fontSize: '13px', color: 'rgba(248, 250, 252, 0.6)' }}>
                  Your current DSA proficiency level
                </p>
              </div>
            </div>
          </div>

          <ActionabilityEngine suggestions={suggestions} currentScore={score} targetScore={targetScore} />

          <ShareCard easy={easy} medium={medium} hard={hard} score={score} />

          {/* Target score selector */}
          <div className="dsa-card">
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'rgba(248, 250, 252, 0.9)' }}>
              🎯 Set Target Score
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '10px' }}>
              {[50, 60, 70, 80, 90, 100].map((target) => (
                <button
                  key={target}
                  onClick={() => setTargetScore(target)}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: targetScore === target ? 'var(--accent)' : 'rgba(255, 255, 255, 0.08)',
                    color: targetScore === target ? '#07090f' : 'rgba(248, 250, 252, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {target}
                </button>
              ))}
            </div>
            <button
              onClick={handleGenerateRoadmap}
              disabled={loading}
              style={{
                width: '100%',
                marginTop: '16px',
                padding: '12px 16px',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                color: 'var(--accent)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? '⏳ Generating...' : '🚀 Generate AI Roadmap'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="dsa-card">
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'rgba(248, 250, 252, 0.9)' }}>
            📈 Score History
          </h3>

          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: 'rgba(248, 250, 252, 0.5)' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📊</div>
              <p>No history yet. Save your first score to get started!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
              {history.map((entry, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    borderRadius: '6px',
                    borderLeft: `3px solid ${getTierColor(entry.tier)}`,
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(248, 250, 252, 0.9)' }}>
                      {Math.round(entry.score * 100) / 100} - {entry.tier}
                    </div>
                    <div style={{ fontSize: '12px', color: 'rgba(248, 250, 252, 0.5)' }}>
                      E:{entry.easy} M:{entry.medium} H:{entry.hard}
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(248, 250, 252, 0.5)' }}>
                    {new Date(entry.savedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'roadmap' && (
        <div className="dsa-card">
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'rgba(248, 250, 252, 0.9)' }}>
            🗺️ AI Roadmap
          </h3>

          {!roadmap ? (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: 'rgba(248, 250, 252, 0.5)' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🚀</div>
              <p>No roadmap yet. Generate one to get personalized guidance!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {roadmap.roadmap.phase_30 && (
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', padding: '12px', borderRadius: '6px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(248, 250, 252, 0.9)', marginBottom: '8px' }}>
                    📅 Phase 1 (30 days): {roadmap.roadmap.phase_30.focus}
                  </h4>
                  <p style={{ fontSize: '12px', color: 'rgba(248, 250, 252, 0.6)', marginBottom: '8px' }}>
                    Topics: {roadmap.roadmap.phase_30.topics?.join(', ') || 'TBD'}
                  </p>
                  <p style={{ fontSize: '12px', color: 'rgba(248, 250, 252, 0.5)' }}>
                    Target: {roadmap.roadmap.phase_30.expected_score} points
                  </p>
                </div>
              )}

              {roadmap.roadmap.phase_60 && (
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', padding: '12px', borderRadius: '6px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(248, 250, 252, 0.9)', marginBottom: '8px' }}>
                    🎯 Phase 2 (60 days): {roadmap.roadmap.phase_60.focus}
                  </h4>
                  <p style={{ fontSize: '12px', color: 'rgba(248, 250, 252, 0.6)', marginBottom: '8px' }}>
                    Topics: {roadmap.roadmap.phase_60.topics?.join(', ') || 'TBD'}
                  </p>
                  <p style={{ fontSize: '12px', color: 'rgba(248, 250, 252, 0.5)' }}>
                    Target: {roadmap.roadmap.phase_60.expected_score} points
                  </p>
                </div>
              )}

              {roadmap.roadmap.phase_90 && (
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', padding: '12px', borderRadius: '6px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(248, 250, 252, 0.9)', marginBottom: '8px' }}>
                    ✨ Phase 3 (90 days): {roadmap.roadmap.phase_90.focus}
                  </h4>
                  <p style={{ fontSize: '12px', color: 'rgba(248, 250, 252, 0.6)', marginBottom: '8px' }}>
                    Topics: {roadmap.roadmap.phase_90.topics?.join(', ') || 'TBD'}
                  </p>
                  <p style={{ fontSize: '12px', color: 'rgba(248, 250, 252, 0.5)' }}>
                    Target: {roadmap.roadmap.phase_90.expected_score} points
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'benchmarks' && (
        <div style={{ display: 'grid', gap: '12px' }}>
          {BENCHMARK_TIERS.map((tier) => (
            <div
              key={tier.name}
              className="dsa-card"
              style={{
                borderLeft: `4px solid ${tier.color}`,
                backgroundColor: score >= parseInt(tier.score) ? `${tier.color}15` : 'rgba(255, 255, 255, 0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '24px' }}>{tier.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: tier.color, marginBottom: '2px' }}>
                    {tier.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(248, 250, 252, 0.6)' }}>
                    Score: {tier.score}
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(248, 250, 252, 0.5)' }}>
                    {tier.description}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
