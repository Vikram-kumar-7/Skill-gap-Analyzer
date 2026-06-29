import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Score Breakdown Visualization
 * Shows how much each difficulty contributes to the total score
 */
export const ScoreBreakdown = ({ breakdown = { easy: 0, medium: 0, hard: 0 }, score = 0 }) => {
  const [showFormula, setShowFormula] = useState(false);
  const total = breakdown.easy + breakdown.medium + breakdown.hard;

  const getDifficultyInfo = (difficulty) => {
    const info = {
      easy: {
        label: 'Easy',
        color: '#ef4444',
        icon: '🟩',
        formula: 'log(easy+1) × 10',
      },
      medium: {
        label: 'Medium',
        color: '#eab308',
        icon: '🟨',
        formula: 'log(medium+1) × 25',
      },
      hard: {
        label: 'Hard',
        color: '#06b6d4',
        icon: '🟦',
        formula: 'log(hard+1) × 40',
      },
    };
    return info[difficulty];
  };

  return (
    <div
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        padding: '20px',
        maxWidth: '500px',
        width: '100%',
        margin: '0 auto',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'rgba(248, 250, 252, 0.9)', margin: 0 }}>
          Score Breakdown
        </h3>
        <button
          onClick={() => setShowFormula(!showFormula)}
          title="Toggle Formula Details"
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(248, 250, 252, 0.6)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(248, 250, 252, 0.6)'}
        >
          {showFormula ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {/* Formula explanation */}
      {showFormula && (
        <div
          style={{
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px',
            fontSize: '12px',
            color: 'rgba(248, 250, 252, 0.7)',
          }}
        >
          <strong>Formula:</strong> (Easy×1 + Medium×3 + Hard×6) / maxPossible × 100
          <br />
          <strong>Actual:</strong> log(easy+1)×10 + log(medium+1)×25 + log(hard+1)×40
        </div>
      )}

      {/* Breakdown bars */}
      <div style={{ display: 'grid', gap: '12px' }}>
        {['easy', 'medium', 'hard'].map((difficulty) => {
          const info = getDifficultyInfo(difficulty);
          const percentage = total > 0 ? breakdown[difficulty] : 0;

          return (
            <div key={difficulty}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '6px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{info.icon}</span>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(248, 250, 252, 0.8)' }}>
                    {info.label}
                  </label>
                </div>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: info.color,
                  }}
                >
                  {percentage}%
                </span>
              </div>

              {/* Progress bar */}
              <div
                style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${percentage}%`,
                    height: '100%',
                    backgroundColor: info.color,
                    transition: 'width 0.3s ease',
                    boxShadow: `0 0 8px ${info.color}80`,
                  }}
                />
              </div>


            </div>
          );
        })}
      </div>

      {/* Overall score display */}
      <div
        style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderRadius: '8px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '12px', color: 'rgba(248, 250, 252, 0.6)', marginBottom: '4px' }}>
          Overall DSA Score
        </div>
        <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--accent)' }}>
          {Math.round(score * 100) / 100}
        </div>
      </div>
    </div>
  );
};
