import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAnalyses } from '../utils/storage.js';

export default function RoadmapPage() {
  const navigate = useNavigate();

  // State declarations
  const [analyses, setAnalyses] = useState(() => getAnalyses());
  const [showAddModal, setShowAddModal] = useState(false);
  const [customSkillName, setCustomSkillName] = useState('');

  // Listen for storage changes
  useEffect(() => {
    const handler = () => setAnalyses(getAnalyses());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  // Derived data
  const active = analyses.find(a => a.isActive);
  const enriched = active?.enrichedMissing || [];
  const completed = enriched.filter(s => s.completed);
  const total = enriched.length;
  const progressPct = total > 0 ? Math.round((completed.length / total) * 100) : 0;

  // Filter skills into categories
  const highImpact = enriched.filter(s => !s.completed && (s.roi || 0) >= 70);
  const growth = enriched.filter(s => !s.completed && (s.roi || 0) >= 40 && (s.roi || 0) < 70);
  const niceToHave = enriched.filter(s => !s.completed && (s.roi || 0) < 40);

  // Handlers
  const markSkillComplete = (skillName) => {
    if (!active) return;
    const updated = {
      ...active,
      enrichedMissing: active.enrichedMissing.map(s =>
        s.name === skillName ? { ...s, completed: true } : s
      ),
    };
    const all = getAnalyses().map(a => (a.id === updated.id ? updated : a));
    localStorage.setItem('sga_analyses', JSON.stringify(all));
    window.dispatchEvent(new Event('storage'));
  };

  const handleAddCustomSkill = () => {
    if (!customSkillName.trim() || !active) return;
    const newSkill = {
      name: customSkillName.trim(),
      category: 'Other',
      roi: 50,
      timeEstimate: '2-3 wks',
      demand: 3,
      difficulty: 3,
      completed: false,
      tasks: [],
      courses: [],
    };
    const updated = {
      ...active,
      enrichedMissing: [...(active.enrichedMissing || []), newSkill],
    };
    const all = getAnalyses().map(a => (a.id === updated.id ? updated : a));
    localStorage.setItem('sga_analyses', JSON.stringify(all));
    window.dispatchEvent(new Event('storage'));
    setCustomSkillName('');
    setShowAddModal(false);
  };

  if (!active) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div
          className="glass-panel max-w-md p-8 text-center flex flex-col items-center gap-6 rounded-2xl relative z-10"
          style={{
            background: 'rgba(12, 19, 34, 0.4)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 8px 32px rgba(0, 0, 0, 0.2)',
          }}
        >
          <div className="w-16 h-16 bg-primary-container/20 rounded-full flex items-center justify-center border border-primary/20">
            <span className="material-symbols-outlined text-primary text-3xl">map</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-on-surface mb-2">No Active Analysis</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Run an analysis first to see your personalized roadmap.
            </p>
          </div>
          <button
            onClick={() => navigate('/new-analysis')}
            className="bg-primary-container text-white py-3 px-6 rounded-lg font-bold transition-all shadow-[0_4px_15px_rgba(108,93,211,0.4)] hover:shadow-[0_8px_25px_rgba(108,93,211,0.6)] hover:-translate-y-0.5 active:translate-y-0.5"
          >
            Start New Analysis →
          </button>
        </div>
      </div>
    );
  }

  const columns = [
    {
      id: 'highImpact',
      title: 'High-Impact',
      skills: highImpact,
      accentColor: '#6C5DD3',
      accentContainer: '#6C5DD3',
      rgb: '108, 93, 211',
      roiLabel: 'High',
      roiIcon: 'trending_up',
    },
    {
      id: 'growth',
      title: 'Growth Skills',
      skills: growth,
      accentColor: '#8b5cf6',
      accentContainer: '#8b5cf6',
      rgb: '139, 92, 246',
      roiLabel: 'Med',
      roiIcon: 'moving',
    },
    {
      id: 'niceToHave',
      title: 'Nice-to-Have',
      skills: niceToHave,
      accentColor: '#06b6d4',
      accentContainer: '#06b6d4',
      rgb: '6, 182, 212',
      roiLabel: 'Low',
      roiIcon: 'balance',
    },
  ];

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'sans-serif',
      }}
    >
      
      {/* Shimmer animation keyframes */}
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>

      {/* HEADER GLASS PANEL */}
      <div className="glass-panel rounded-2xl p-8 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0 relative z-10">
        
        {/* Left Info */}
        <div>
          <h2 className="font-display-lg text-3xl md:text-4xl text-on-surface mb-2 tracking-tight font-bold">
            System Architecture Path
          </h2>
          <div className="flex items-center gap-4 text-on-surface-variant font-mono text-sm">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-primary text-sm">calendar_month</span>
              <span>Week {total > 0 ? Math.min(12, Math.ceil((completed.length / total) * 12)) : 4}/12</span>
            </span>
            <div className="w-1 h-1 rounded-full bg-outline-variant" />
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-tertiary text-sm">check_circle</span>
              <span>{completed.length}/{total} skills completed</span>
            </span>
          </div>
        </div>

        {/* Right Progress */}
        <div className="w-full md:w-1/3 max-w-md">
          <div className="flex justify-between font-label-caps text-label-caps text-on-surface-variant mb-2 text-xs font-bold tracking-wider">
            <span>Overall Progress</span>
            <span className="text-primary">{progressPct}%</span>
          </div>
          <div className="h-3 w-full bg-surface-container-highest/50 backdrop-blur-sm rounded-full overflow-hidden border border-white/5 relative">
            <div
              className="absolute top-0 left-0 h-full bg-primary-container rounded-full glow-progress"
              style={{
                width: `${progressPct}%`,
                transition: 'width 0.4s ease-out',
                boxShadow: '0 0 10px rgba(108, 93, 211, 0.4)',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] translate-x-[-100%]" />
            </div>
          </div>
        </div>

      </div>

      {/* KANBAN BOARD */}
      <div
        className="kanban-scroll"
        style={{
          flex: 1,
          display: 'flex',
          gap: '24px',
          overflowX: 'auto',
          paddingBottom: '32px',
          height: '100%',
          position: 'relative',
          zIndex: 10,
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {columns.map((col) => (
          <div
            key={col.id}
            style={{
              flex: '0 0 320px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              height: '100%',
              minWidth: 0,
            }}
          >
            
            {/* Column Header */}
            <div
              className="flex items-center justify-between pb-2 border-b-2"
              style={{ borderColor: `${col.accentColor}80` }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: col.accentColor,
                    boxShadow: `0 0 8px rgba(${col.rgb}, 0.6)`,
                  }}
                />
                <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
                  {col.title}
                </h3>
              </div>
              <div className="glass-panel text-on-surface-variant font-mono text-xs px-2 py-1 rounded">
                {col.skills.length}
              </div>
            </div>

            {/* Column Body */}
            <div
              className="kanban-scroll"
              style={{
                flex: 1,
                overflowY: 'auto',
                paddingRight: '8px',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              
              {col.skills.map((skill) => (
                <div
                  key={skill.name}
                  className="glass-panel card-3d-hover rounded-xl p-5 relative group flex flex-col gap-3"
                  style={{
                    background: 'rgba(12, 19, 34, 0.4)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 4px 12px rgba(0,0,0,0.15)',
                  }}
                >
                  {/* Left Accent strip */}
                  <div
                    className="absolute top-0 left-0 w-1 h-full rounded-l-xl opacity-80"
                    style={{ backgroundColor: col.accentColor }}
                  />

                  {/* Top Badges Row */}
                  <div className="flex justify-between items-start mb-1">
                    <div
                      className="backdrop-blur-md font-label-caps text-[10px] px-2 py-1 rounded-full border flex items-center gap-1 font-bold"
                      style={{
                        backgroundColor: `${col.accentContainer}15`,
                        color: col.accentColor,
                        borderColor: `${col.accentColor}30`,
                      }}
                    >
                      <span className="material-symbols-outlined text-[12px]">{col.roiIcon}</span>
                      <span>ROI: {col.roiLabel}</span>
                    </div>
                    <div className="text-on-surface-variant font-mono text-[11px] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      <span>{skill.timeEstimate || '2-3 wks'}</span>
                    </div>
                  </div>

                  {/* Card Main Info */}
                  <div>
                    <h4 className="font-headline-md text-base text-on-surface mb-1 leading-tight font-bold">
                      {skill.name}
                    </h4>
                    <p className="font-body-md text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                      Learn and apply {skill.name} to strengthen your {skill.category || 'Other'} skills.
                    </p>
                  </div>

                  {/* Bottom Row based on Column Type */}
                  {col.id === 'highImpact' && (
                    <div className="flex justify-between items-center mt-auto pt-2">
                      <div className="w-6 h-6 rounded-full border border-white/10 bg-surface-container/50 flex items-center justify-center text-[10px] text-on-surface font-mono">
                        {(skill.category || 'OT').slice(0, 2).toUpperCase()}
                      </div>
                      <button
                        onClick={() => markSkillComplete(skill.name)}
                        className="w-8 h-8 rounded-full bg-surface-variant/50 backdrop-blur-md flex items-center justify-center text-on-surface-variant hover:bg-primary hover:text-white transition-all duration-200 group-hover:shadow-[0_0_10px_rgba(108,93,211,0.5)]"
                      >
                        <span className="material-symbols-outlined text-lg">check</span>
                      </button>
                    </div>
                  )}

                  {col.id === 'growth' && (
                    <div className="flex justify-between items-center mt-auto pt-2">
                      <div className="flex-1 bg-surface-container-highest/50 backdrop-blur-sm rounded-full h-1.5 mr-4">
                        <div
                          className="bg-secondary h-1.5 rounded-full"
                          style={{ width: `${(skill.demand || 3) * 20}%` }}
                        />
                      </div>
                      <span className="font-mono text-[10px] text-secondary">
                        {(skill.demand || 3) * 20}%
                      </span>
                    </div>
                  )}

                  {col.id === 'niceToHave' && (
                    <div className="flex justify-between items-center mt-auto pt-2">
                      <div className="text-[10px] font-mono text-on-surface-variant bg-surface/50 backdrop-blur-md px-2 py-1 rounded border border-white/5 flex items-center gap-1">
                        Locked: Complete higher priority skills first
                      </div>
                      <span className="material-symbols-outlined text-on-surface-variant/50 text-sm">
                        lock
                      </span>
                    </div>
                  )}

                </div>
              ))}

              {/* Add Custom Skill Button (Bottom of High-Impact only) */}
              {col.id === 'highImpact' && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="w-full py-4 border-2 border-dashed border-white/10 rounded-xl text-on-surface-variant font-mono text-sm hover:border-primary/50 hover:text-primary transition-colors flex items-center justify-center gap-2 bg-surface-container/20 backdrop-blur-md cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  <span>Add Custom Skill</span>
                </button>
              )}

            </div>
          </div>
        ))}
      </div>

      {/* ADD CUSTOM SKILL MODAL */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={() => {
            setShowAddModal(false);
            setCustomSkillName('');
          }}
        >
          <div
            className="glass-panel rounded-2xl p-6 w-full max-w-sm mx-4"
            style={{
              background: 'rgba(12, 19, 34, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-on-surface font-bold text-lg mb-4">
              Add Custom Skill
            </h3>
            
            <input
              type="text"
              placeholder="e.g. GraphQL, Terraform..."
              value={customSkillName}
              onChange={(e) => setCustomSkillName(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant rounded-lg py-3 px-4 text-on-surface font-body-md outline-none mb-4"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddCustomSkill();
                }
              }}
              autoFocus
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setCustomSkillName('');
                }}
                className="flex-1 py-3 border border-white/10 rounded-lg text-on-surface-variant hover:text-on-surface transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCustomSkill}
                className="flex-1 py-3 bg-primary-container text-white rounded-lg font-bold transition-all shadow-[0_4px_15px_rgba(108,93,211,0.3)] hover:shadow-[0_8px_25px_rgba(108,93,211,0.5)]"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
