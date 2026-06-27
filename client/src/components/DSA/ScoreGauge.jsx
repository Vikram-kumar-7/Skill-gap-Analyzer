import React from 'react';
import { formatScoreWithStyle } from '../../utils/dsaCalculations';

/**
 * SVG Arc Gauge Component
 * Displays DSA score as an animated circular gauge
 */
export const ScoreGauge = ({ score = 0, size = 200, strokeWidth = 8 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  const formatted = formatScoreWithStyle(score);

  return (
    <div style={{ textAlign: 'center' }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
        />

        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={formatted.color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.5s ease',
            filter: `drop-shadow(0 0 8px ${formatted.color}80)`,
          }}
        />
      </svg>

      <div
        style={{
          position: 'relative',
          marginTop: `-${size * 0.6}px`,
          textAlign: 'center',
          zIndex: 1,
        }}
      >
        <div
          style={{
            fontSize: `${size * 0.25}px`,
            fontWeight: 700,
            color: formatted.color,
            letterSpacing: '-1px',
          }}
        >
          {formatted.score}
        </div>
        <div
          style={{
            fontSize: `${size * 0.1}px`,
            color: 'rgba(248, 250, 252, 0.6)',
            marginTop: `${size * 0.02}px`,
          }}
        >
          / 100
        </div>
      </div>
    </div>
  );
};
