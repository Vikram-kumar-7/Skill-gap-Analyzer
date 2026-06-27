import React, { useRef } from 'react';
import { getDSATier, getTierColor } from '../../utils/dsaCalculations';

/**
 * Share Card Component
 * Generates a shareable card image of the user's DSA score
 */
export const ShareCard = ({ easy, medium, hard, score, username = 'Anonymous' }) => {
  const cardRef = useRef(null);
  const tier = getDSATier(score);
  const tierColor = getTierColor(tier);

  const downloadCard = () => {
    if (!cardRef.current) return;

    // Convert SVG to canvas and download as PNG
    const svg = cardRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = 600;
    canvas.height = 400;

    // Fill background
    ctx.fillStyle = '#07090f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render text (simplified version)
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.round(score)}/100`, canvas.width / 2, 80);

    ctx.fillStyle = tierColor;
    ctx.font = '24px sans-serif';
    ctx.fillText(tier, canvas.width / 2, 120);

    ctx.fillStyle = 'rgba(248, 250, 252, 0.7)';
    ctx.font = '16px sans-serif';
    ctx.fillText(username, canvas.width / 2, 160);
    ctx.fillText(`Easy: ${easy} | Medium: ${medium} | Hard: ${hard}`, canvas.width / 2, 200);

    // Download
    const link = document.createElement('a');
    link.href = canvas.toDataURL();
    link.download = `dsa-score-${Date.now()}.png`;
    link.click();
  };

  const copyToClipboard = () => {
    const text = `🚀 My DSA Score: ${Math.round(score)}/100 (${tier}) 
Easy: ${easy} | Medium: ${medium} | Hard: ${hard}
Built with SkillGap Analyzer`;
    navigator.clipboard.writeText(text);
  };

  return (
    <div
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        padding: '20px',
      }}
    >
      <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'rgba(248, 250, 252, 0.9)' }}>
        📱 Share Your Progress
      </h3>

      {/* Share Card Preview */}
      <svg
        ref={cardRef}
        width="100%"
        maxWidth="400"
        viewBox="0 0 400 300"
        style={{
          backgroundColor: 'var(--color-base)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          marginBottom: '16px',
        }}
      >
        {/* Card background with gradient */}
        <defs>
          <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={tierColor} stopOpacity="0.1" />
            <stop offset="100%" stopColor={tierColor} stopOpacity="0.05" />
          </linearGradient>
        </defs>

        <rect width="400" height="300" fill="url(#cardGradient)" />

        {/* Border */}
        <rect width="400" height="300" fill="none" stroke={tierColor} strokeWidth="2" opacity="0.3" />

        {/* Score */}
        <text
          x="200"
          y="80"
          textAnchor="middle"
          style={{
            fontSize: '52px',
            fontWeight: 'bold',
            fill: tierColor,
            textShadow: `0 0 16px ${tierColor}40`,
          }}
        >
          {Math.round(score)}
        </text>

        <text
          x="200"
          y="100"
          textAnchor="middle"
          style={{
            fontSize: '14px',
            fill: 'rgba(248, 250, 252, 0.6)',
          }}
        >
          / 100
        </text>

        {/* Tier */}
        <text
          x="200"
          y="140"
          textAnchor="middle"
          style={{
            fontSize: '24px',
            fontWeight: '600',
            fill: tierColor,
          }}
        >
          {tier}
        </text>

        {/* Username */}
        <text
          x="200"
          y="175"
          textAnchor="middle"
          style={{
            fontSize: '14px',
            fill: 'rgba(248, 250, 252, 0.8)',
            fontWeight: '500',
          }}
        >
          {username}
        </text>

        {/* Stats */}
        <text
          x="200"
          y="220"
          textAnchor="middle"
          style={{
            fontSize: '12px',
            fill: 'rgba(248, 250, 252, 0.6)',
          }}
        >
          Easy: {easy} | Medium: {medium} | Hard: {hard}
        </text>

        {/* Branding */}
        <text
          x="200"
          y="275"
          textAnchor="middle"
          style={{
            fontSize: '11px',
            fill: 'rgba(248, 250, 252, 0.5)',
          }}
        >
          Built with SkillGap Analyzer
        </text>
      </svg>

      {/* Action Buttons */}
      <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: '1fr 1fr' }}>
        <button
          onClick={downloadCard}
          style={{
            padding: '10px 16px',
            backgroundColor: 'var(--accent)',
            color: '#07090f',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.boxShadow = '0 0 16px rgba(16, 185, 129, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = 'none';
          }}
        >
          📥 Download
        </button>

        <button
          onClick={copyToClipboard}
          style={{
            padding: '10px 16px',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            color: 'var(--accent)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '6px',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(16, 185, 129, 0.25)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'rgba(16, 185, 129, 0.15)';
          }}
        >
          📋 Copy Text
        </button>
      </div>
    </div>
  );
};
