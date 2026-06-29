import React from 'react';

/**
 * Actionability Engine Component
 * Shows actionable suggestions for what to solve next to reach targets
 */
export const ActionabilityEngine = ({ suggestions, currentScore, targetScore }) => {
  if (!suggestions) return null;

  if (suggestions.status === 'milestone_reached') {
    return (
      <div
        style={{
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          border: '2px solid rgba(34, 197, 94, 0.3)',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center',
          maxWidth: '500px',
          width: '100%',
          margin: '0 auto',
        }}
      >
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎉</div>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#22c55e', marginBottom: '8px' }}>
          Milestone Reached!
        </h3>
        <p style={{ color: 'rgba(248, 250, 252, 0.7)', marginBottom: '12px' }}>
          {suggestions.message}
        </p>
        <p style={{ fontSize: '14px', color: 'rgba(248, 250, 252, 0.6)' }}>
          Next milestone: {suggestions.nextMilestone}/100
        </p>
      </div>
    );
  }

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
      <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', color: 'rgba(248, 250, 252, 0.9)' }}>
        🎯 Your Path to {targetScore}
      </h3>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', color: 'rgba(248, 250, 252, 0.6)' }}>Current Score</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent)' }}>
            {Math.round(currentScore)}/100
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', color: 'rgba(248, 250, 252, 0.6)' }}>Target Score</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(16, 185, 129, 0.8)' }}>
            {targetScore}/100
          </span>
        </div>

        <div
          style={{
            width: '100%',
            height: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '3px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${Math.min(100, (currentScore / targetScore) * 100)}%`,
              height: '100%',
              backgroundColor: 'var(--accent)',
              boxShadow: '0 0 8px rgba(16, 185, 129, 0.4)',
            }}
          />
        </div>
      </div>

      <div
        style={{
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '16px',
        }}
      >
        <div style={{ fontSize: '13px', color: 'rgba(248, 250, 252, 0.7)' }}>
          <strong>Gap to close:</strong> {Math.round(suggestions.gap * 100) / 100} points
        </div>
      </div>

      {/* Suggestions */}
      <div style={{ display: 'grid', gap: '12px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(248, 250, 252, 0.8)' }}>
          What to solve:
        </h4>

        {suggestions.suggestions.map((suggestion, index) => {
          const difficultyColors = {
            medium: '#eab308',
            hard: '#06b6d4',
          };

          return (
            <div
              key={index}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: `1px solid ${difficultyColors[suggestion.type]}40`,
                borderRadius: '8px',
                padding: '12px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px',
                }}
              >
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'rgba(248, 250, 252, 0.9)',
                    textTransform: 'capitalize',
                  }}
                >
                  {suggestion.type} Problems
                </span>
                <span
                  style={{
                    backgroundColor: difficultyColors[suggestion.type],
                    color: '#07090f',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  {suggestion.count} problems
                </span>
              </div>

              <p style={{ fontSize: '12px', color: 'rgba(248, 250, 252, 0.6)', marginBottom: '8px' }}>
                {suggestion.description}
              </p>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {suggestion.topics.map((topic) => (
                  <span
                    key={topic}
                    style={{
                      fontSize: '11px',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      color: 'rgba(248, 250, 252, 0.7)',
                      padding: '4px 8px',
                      borderRadius: '4px',
                    }}
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderRadius: '8px',
          fontSize: '12px',
          color: 'rgba(248, 250, 252, 0.7)',
        }}
      >
        <strong>💡 Tip:</strong> Focus on Medium problems first—they give the best ROI for score improvement!
      </div>
    </div>
  );
};
