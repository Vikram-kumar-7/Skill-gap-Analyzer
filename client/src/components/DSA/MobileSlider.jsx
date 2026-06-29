import React, { useRef, useEffect } from 'react';

/**
 * Mobile-Friendly Touch Slider Component
 * Replaces HTML range input with better touch experience
 */
export const MobileSlider = ({
  value = 0,
  min = 0,
  max = 100,
  onChange,
  label = '',
  unit = '',
}) => {
  const sliderRef = useRef(null);
  const isDragging = useRef(false);

  const percentage = ((value - min) / (max - min)) * 100;

  const handleStart = (e) => {
    isDragging.current = true;
    if (sliderRef.current) {
      const rect = sliderRef.current.getBoundingClientRect();
      const x = (e.touches?.[0]?.clientX || e.clientX) - rect.left;
      const newValue = Math.round(
        (x / rect.width) * (max - min) + min
      );
      onChange?.(Math.max(min, Math.min(max, newValue)));
    }
  };

  const handleEnd = () => {
    isDragging.current = false;
  };

  const handleMove = (e) => {
    if (!isDragging.current || !sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const x = (e.touches?.[0]?.clientX || e.clientX) - rect.left;
    const newValue = Math.round(
      (x / rect.width) * (max - min) + min
    );

    onChange?.(Math.max(min, Math.min(max, newValue)));
  };

  useEffect(() => {
    const onMove = (e) => {
      handleMove(e);
    };
    const onEnd = () => {
      handleEnd();
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchend', onEnd);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchend', onEnd);
    };
  }, [min, max, onChange]);

  return (
    <div style={{ width: '100%' }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <label style={{ fontSize: '14px', fontWeight: 500, color: 'rgba(248, 250, 252, 0.8)' }}>
            {label}
          </label>
          <span
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--accent)',
            }}
          >
            {value}
            {unit}
          </span>
        </div>
      )}

      <div
        ref={sliderRef}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
        style={{
          position: 'relative',
          width: '100%',
          height: '6px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '3px',
          cursor: 'pointer',
          WebkitUserSelect: 'none',
          userSelect: 'none',
        }}
      >
        {/* Progress track */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: `${percentage}%`,
            backgroundColor: 'var(--accent)',
            borderRadius: '3px',
            transition: isDragging.current ? 'none' : 'width 0.2s ease',
          }}
        />

        {/* Thumb */}
        <div
          style={{
            position: 'absolute',
            left: `calc(${percentage}% - 10px)`,
            top: '50%',
            transform: 'translateY(-50%)',
            width: '20px',
            height: '20px',
            backgroundColor: 'var(--accent)',
            borderRadius: '50%',
            boxShadow: '0 0 8px rgba(16, 185, 129, 0.4)',
            cursor: 'grab',
            transition: isDragging.current ? 'none' : 'box-shadow 0.2s ease',
          }}
        />
      </div>

      {/* Input field alternative */}
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onFocus={(e) => e.target.select()}
        onChange={(e) => onChange?.(Math.max(min, Math.min(max, parseInt(e.target.value) || 0)))}
        style={{
          width: '100%',
          marginTop: '10px',
          padding: '8px 12px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '6px',
          color: 'white',
          fontSize: '14px',
          outline: 'none',
        }}
      />
    </div>
  );
};
