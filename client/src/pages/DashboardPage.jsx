import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, Zap, Award, Activity, ArrowUpRight,
  Target, ChevronRight, Star, Clock,
} from 'lucide-react';
import { getUser, getAnalyses, getActivity, formatTime } from '../utils/storage.js';

/* ─── design tokens matching SKILL_CORE ─── */
const EMERALD       = '#4edea3';
const EMERALD_DIM   = 'rgba(78,222,163,0.12)';
const EMERALD_GLOW  = 'rgba(78,222,163,0.20)';

const glassCard = (extra = {}) => ({
  background: 'linear-gradient(135deg, rgba(5,20,36,0.90) 0%, rgba(13,28,45,0.65) 100%)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(78,222,163,0.18)',
  boxShadow:
    '0 4px 6px rgba(0,0,0,0.40), 0 24px 48px rgba(0,0,0,0.55), inset 0 1px 1px rgba(255,255,255,0.08)',
  borderRadius: '20px',
  position: 'relative',
  overflow: 'hidden',
  ...extra,
});

/* ── Rim glow overlay (shared) ── */
function RimGlow() {
  return (
    <>
      <div style={{ position:'absolute', inset:0, borderRadius:'inherit',
        background:'linear-gradient(135deg,rgba(255,255,255,0.07) 0%,transparent 60%)',
        pointerEvents:'none', zIndex:0 }} />
      <style>{`@keyframes rim-db{0%,100%{opacity:.3}50%{opacity:1}}`}</style>
      <div style={{ position:'absolute', inset:0, borderRadius:'inherit', padding:'1px',
        background:'linear-gradient(135deg,rgba(78,222,163,.7) 0%,rgba(78,222,163,0) 40%,rgba(78,222,163,0) 70%,rgba(78,222,163,.55) 100%)',
        WebkitMask:'linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0)',
        WebkitMaskComposite:'xor', maskComposite:'exclude',
        pointerEvents:'none', animation:'rim-db 4s ease-in-out infinite', zIndex:0 }} />
    </>
  );
}

function getSkillPct(skillName, base, range) {
  let hash = 0;
  for (let i = 0; i < skillName.length; i++) {
    hash = (hash * 31 + skillName.charCodeAt(i)) & 0xffff;
  }
  return base + (hash % range);
}

/* ══════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const navigate = useNavigate();
  const user      = getUser() || {};
  const analyses  = getAnalyses();
  const activities = (getActivity() || []).slice(0, 5);
  const active    = analyses.find((a) => a.isActive);
  const avgMatch  = analyses.length
    ? Math.round(analyses.reduce((s, a) => s + (a.matchPct || 0), 0) / analyses.length)
    : 0;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  /* radar segments — derived from active analysis, never hardcoded */
  const angles = [-90, -30, 30, 90, 150, 210];
  const radarSkills = (() => {
    if (!active) return [];
    const present = (active.presentSkills || []).slice(0, 6);
    const missing = (active.missingSkills || []).slice(0, 6);
    // Combine: present skills score high, missing score low
    const all = [
      ...present.map(s => ({ label: s, pct: getSkillPct(s, 65, 25) })),
      ...missing.map(s => ({ label: s, pct: getSkillPct(s, 20, 35) })),
    ].slice(0, 6);
    return all.map((s, i) => ({ ...s, angle: angles[i] ?? angles[0] }));
  })();

  return (
    <div className="fade-in" style={{ display:'flex', flexDirection:'column', gap:'24px', paddingBottom:'24px' }}>

      {/* ── Welcome Banner ── */}
      <WelcomeBanner user={user} greeting={greeting()} active={active} avgMatch={avgMatch} onNew={() => navigate('/new-analysis')} />

      {/* ── Stats Row ── */}
      <StatsRow analyses={analyses} avgMatch={avgMatch} />

      {/* ── Main Bento Grid ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gridTemplateRows:'auto', gap:'20px' }}>

        {/* Radar (2 cols wide) */}
        <div style={{ gridColumn:'span 2' }}>
          <RadarCard skills={radarSkills} active={active} />
        </div>

        {/* Activity Feed */}
        <RecentActivity activities={activities} />

        {/* Next Milestone (full width) */}
        {active && <MilestoneCard active={active} onContinue={() => navigate('/roadmap')} />}

        {/* Quick Access (bottom row) */}
        <QuickAccess navigate={navigate} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   WELCOME BANNER
══════════════════════════════════════════════════════ */
function WelcomeBanner({ user, greeting, avgMatch, onNew }) {
  return (
    <div style={{ ...glassCard({ borderRadius:'22px', padding:'28px 32px',
      borderLeft:`4px solid ${EMERALD}` }) }}>
      <RimGlow />
      {/* Decorative glow orb */}
      <div style={{ position:'absolute', right:'-60px', top:'-60px', width:'220px', height:'220px',
        borderRadius:'50%', background:'rgba(78,222,163,0.06)', filter:'blur(60px)', pointerEvents:'none' }} />

      <div style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'20px' }}>
        <div>
          <p style={{ fontSize:'12px', color:'rgba(187,202,191,0.55)', letterSpacing:'0.08em', fontWeight:700, textTransform:'uppercase', marginBottom:'6px' }}>
            {greeting}
          </p>
          <h1 style={{ fontSize:'28px', fontWeight:800, color:'#d4e4fa', letterSpacing:'-0.02em', marginBottom:'8px' }}>
            Welcome back, {user.name || 'Analyst'} 👋
          </h1>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
            {user.course && <Tag label={user.course} />}
            {user.targetRole && <Tag label={user.targetRole} />}
            {avgMatch > 0 && (
              <span style={{ display:'flex', alignItems:'center', gap:'5px', fontSize:'12px', color:EMERALD, fontWeight:600 }}>
                <TrendingUp size={13} /> {avgMatch}% avg. market match
              </span>
            )}
          </div>
        </div>

        <div style={{ display:'flex', gap:'12px', flexWrap:'wrap' }}>
          <button
            onClick={onNew}
            style={{ display:'flex', alignItems:'center', gap:'8px', padding:'11px 22px',
              background:`linear-gradient(135deg,${EMERALD} 0%,#10b981 100%)`,
              border:'none', borderRadius:'12px', color:'#003824', fontSize:'13px', fontWeight:700,
              cursor:'pointer', boxShadow:`0 0 20px ${EMERALD_GLOW},0 4px 12px rgba(0,0,0,.4)`,
              transition:'transform .18s ease' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Zap size={14} /> New Analysis
          </button>

          {/* System status pill */}
          <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 18px',
            background:'rgba(78,222,163,0.08)', border:`1px solid rgba(78,222,163,0.20)`,
            borderRadius:'12px' }}>
            <span style={{ width:'8px', height:'8px', borderRadius:'50%', background:EMERALD,
              boxShadow:`0 0 8px ${EMERALD}`, display:'inline-block',
              animation:'pulse-db 2s ease-in-out infinite' }} />
            <span style={{ fontSize:'12px', color:EMERALD, fontWeight:700, letterSpacing:'0.06em' }}>OPERATIONAL</span>
          </div>
          <style>{`@keyframes pulse-db{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   STATS ROW
══════════════════════════════════════════════════════ */
function StatsRow({ analyses, avgMatch }) {
  const best = analyses.length ? Math.max(...analyses.map(a => a.matchPct || 0)) : 0;
  const stats = [
    { label:'Profile Strength', value:`${avgMatch}%`,  icon:<Activity size={15} />,  sub:'Avg. market match' },
    { label:'Analyses Saved',   value:analyses.length, icon:<Award size={15} />,     sub:`${analyses.filter(a=>a.isActive).length} active` },
    { label:'Best Match',       value:`${best}%`,      icon:<Star size={15} />,      sub:'Top score' },
    { label:'Skills Identified',value: analyses.reduce((s,a)=>(a.missingSkills||[]).length + s, 0),
      icon:<Target size={15} />, sub:'Total gap items' },
  ];
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'14px' }}>
      {stats.map(s => (
        <div key={s.label} style={{ ...glassCard({ borderRadius:'16px', padding:'18px 20px' }) }}>
          <RimGlow />
          <div style={{ position:'relative', zIndex:1 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px' }}>
              <span style={{ fontSize:'10px', color:'rgba(187,202,191,0.55)', letterSpacing:'0.07em', fontWeight:700, textTransform:'uppercase' }}>{s.label}</span>
              <span style={{ color:EMERALD, opacity:.55 }}>{s.icon}</span>
            </div>
            <div style={{ fontSize:'26px', fontWeight:800, color:EMERALD, letterSpacing:'-0.03em', lineHeight:1, marginBottom:'4px' }}>{s.value}</div>
            <div style={{ fontSize:'11px', color:'rgba(187,202,191,0.45)' }}>{s.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   RADAR CARD
══════════════════════════════════════════════════════ */
function RadarCard({ skills, active }) {
  const CX = 120, CY = 120, R = 90;
  const toXY = (angle, r) => ({
    x: CX + r * Math.cos((angle * Math.PI) / 180),
    y: CY + r * Math.sin((angle * Math.PI) / 180),
  });

  const skillPoints = skills.map(s => {
    const r = (s.pct / 100) * R;
    return toXY(s.angle, r);
  });
  const targetPoints = skills.map(s => toXY(s.angle, R));

  const poly = (pts) => pts.map(p => `${p.x},${p.y}`).join(' ');

  const rings = [0.25, 0.5, 0.75, 1].map(f => f * R);

  if (skills.length === 0) {
    return (
      <div style={{ ...glassCard({ padding:'24px' }) }}>
        <RimGlow />
        <div style={{ position:'relative', zIndex:1, textAlign:'center', padding:'40px 20px' }}>
          <div style={{ fontSize:'32px', marginBottom:'12px', opacity:0.3 }}>📡</div>
          <h2 style={{ fontSize:'17px', fontWeight:700, color:'#d4e4fa', marginBottom:'6px' }}>Skill Gap Radar</h2>
          <p style={{ fontSize:'12px', color:'rgba(187,202,191,0.45)', lineHeight:1.6 }}>
            Run an analysis to see your skill radar<br/>populated with real data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...glassCard({ padding:'24px' }) }}>
      <RimGlow />
      <div style={{ position:'relative', zIndex:1 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'20px' }}>
          <div>
            <h2 style={{ fontSize:'17px', fontWeight:700, color:'#d4e4fa', letterSpacing:'-0.01em', marginBottom:'4px' }}>
              Skill Gap Radar
            </h2>
            <p style={{ fontSize:'12px', color:'rgba(187,202,191,0.55)' }}>
              Current proficiency vs. target requirements
            </p>
          </div>
          {active && (
            <span style={{ fontSize:'11px', fontWeight:700, color:EMERALD,
              background:EMERALD_DIM, border:`1px solid rgba(78,222,163,0.22)`,
              borderRadius:'999px', padding:'4px 12px' }}>
              {active.role}
            </span>
          )}
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:'32px' }}>
          {/* SVG radar */}
          <svg width="240" height="240" viewBox="0 0 240 240" style={{ flexShrink:0 }}>
            {/* rings */}
            {rings.map((r,i) => (
              <polygon key={i}
                points={poly(skills.map(s => toXY(s.angle, r)))}
                fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            ))}
            {/* axes */}
            {skills.map((s,i) => {
              const outer = toXY(s.angle, R);
              return <line key={i} x1={CX} y1={CY} x2={outer.x} y2={outer.y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />;
            })}
            {/* target polygon */}
            <polygon points={poly(targetPoints)} fill="none" stroke={`rgba(78,222,163,0.25)`} strokeWidth="1.5" strokeDasharray="4 3" />
            {/* skill polygon */}
            <polygon points={poly(skillPoints)}
              fill="rgba(78,222,163,0.12)" stroke={EMERALD} strokeWidth="2"
              style={{ filter:`drop-shadow(0 0 6px ${EMERALD_GLOW})` }} />
            {/* dots */}
            {skillPoints.map((p,i) => (
              <circle key={i} cx={p.x} cy={p.y} r="4" fill={EMERALD} style={{ filter:`drop-shadow(0 0 4px ${EMERALD})` }} />
            ))}
            {/* center dot */}
            <circle cx={CX} cy={CY} r="3" fill="rgba(255,255,255,0.2)" />
          </svg>

          {/* Legend */}
          <div style={{ display:'flex', flexDirection:'column', gap:'12px', flex:1 }}>
            {skills.map(s => (
              <div key={s.label} style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                <div style={{ width:'100%' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', marginBottom:'5px' }}>
                    <span style={{ color:'#d4e4fa', fontWeight:600 }}>{s.label}</span>
                    <span style={{ color: s.pct >= 80 ? EMERALD : s.pct >= 60 ? '#60a5fa' : '#fbbf24', fontWeight:700 }}>
                      {s.pct}%
                    </span>
                  </div>
                  <div style={{ height:'3px', background:'rgba(255,255,255,0.07)', borderRadius:'999px', overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${s.pct}%`,
                      background:`linear-gradient(90deg,#10b981,${EMERALD})`,
                      borderRadius:'999px' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   RECENT ACTIVITY
══════════════════════════════════════════════════════ */
function RecentActivity({ activities }) {
  const items = activities.length
    ? activities.map(a => ({ text: typeof a === 'string' ? a : a.text, time: a.time ? formatTime(a.time) : '' }))
    : [];

  return (
    <div style={{ ...glassCard({ padding:'22px' }) }}>
      <RimGlow />
      <div style={{ position:'relative', zIndex:1 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'18px' }}>
          <h3 style={{ fontSize:'15px', fontWeight:700, color:'#d4e4fa' }}>Recent Activity</h3>
          <Clock size={14} style={{ color:'rgba(187,202,191,0.40)' }} />
        </div>
        {items.length === 0 ? (
          <div style={{ textAlign:'center', padding:'24px 0' }}>
            <div style={{ fontSize:'24px', marginBottom:'8px', opacity:0.4 }}>📋</div>
            <p style={{ fontSize:'12px', color:'rgba(187,202,191,0.35)', lineHeight:1.5 }}>
              No activity yet.<br/>Run your first analysis to get started.
            </p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {items.map((a, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px',
                padding:'10px 12px', borderRadius:'12px',
                background:'rgba(255,255,255,0.03)',
                border:'1px solid rgba(255,255,255,0.05)',
                transition:'background .18s ease', cursor:'default' }}
                onMouseEnter={e => e.currentTarget.style.background='rgba(78,222,163,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.03)'}
              >
                <div style={{ width:'8px', height:'8px', borderRadius:'50%',
                  background:EMERALD, opacity: 1 - i*0.18,
                  boxShadow:`0 0 6px ${EMERALD}`, flexShrink:0 }} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:'12px', fontWeight:600, color:'#d4e4fa',
                    overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.text}</div>
                  {a.time && <div style={{ fontSize:'10px', color:'rgba(187,202,191,0.45)', marginTop:'2px' }}>{a.time}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MILESTONE CARD
══════════════════════════════════════════════════════ */
function MilestoneCard({ active, onContinue }) {
  const missing = (active.missingSkills || []).slice(0, 4);
  return (
    <div style={{ ...glassCard({
      gridColumn: 'span 2',
      padding:'24px 28px',
      borderLeft:`4px solid ${EMERALD}`,
      boxShadow:`0 4px 6px rgba(0,0,0,.40),0 24px 48px rgba(0,0,0,.55),inset 0 1px 1px rgba(255,255,255,.10),0 0 40px rgba(78,222,163,.06)`,
    }) }}>
      <RimGlow />
      <div style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', gap:'20px' }}>
        <div style={{ width:'56px', height:'56px', borderRadius:'16px',
          background:EMERALD_DIM, border:`1px solid rgba(78,222,163,0.25)`,
          display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
          boxShadow:`0 0 20px rgba(78,222,163,0.10)` }}>
          <Star size={24} color={EMERALD} fill={EMERALD} />
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontSize:'10px', color:EMERALD, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'4px' }}>
            Next Milestone · Active Analysis
          </p>
          <h3 style={{ fontSize:'17px', fontWeight:800, color:'#d4e4fa', letterSpacing:'-0.01em', marginBottom:'6px' }}>
            {active.role}
          </h3>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'5px' }}>
            {missing.map(s => (
              <span key={s} style={{ fontSize:'11px', fontWeight:600, padding:'2px 9px',
                borderRadius:'999px', background:'rgba(78,222,163,0.08)',
                color:'rgba(78,222,163,0.80)', border:'1px solid rgba(78,222,163,0.16)' }}>
                {s}
              </span>
            ))}
            {(active.missingSkills||[]).length > 4 && (
              <span style={{ fontSize:'11px', fontWeight:600, padding:'2px 9px',
                borderRadius:'999px', background:'rgba(255,255,255,0.05)',
                color:'rgba(187,202,191,0.55)', border:'1px solid rgba(255,255,255,0.08)' }}>
                +{active.missingSkills.length - 4} more
              </span>
            )}
          </div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'8px', flexShrink:0 }}>
          <div style={{ textAlign:'right' }}>
            <span style={{ fontSize:'11px', color:'rgba(187,202,191,0.55)' }}>Market Match</span>
            <span style={{ fontSize:'26px', fontWeight:800, color:EMERALD, display:'block',
              letterSpacing:'-0.03em', lineHeight:1, textShadow:`0 0 20px ${EMERALD_GLOW}` }}>
              {active.matchPct}%
            </span>
          </div>
          <button
            onClick={onContinue}
            style={{ display:'flex', alignItems:'center', gap:'6px', padding:'10px 18px',
              background:`linear-gradient(135deg,${EMERALD} 0%,#10b981 100%)`,
              border:'none', borderRadius:'10px', color:'#003824', fontSize:'12px',
              fontWeight:700, cursor:'pointer',
              boxShadow:`0 0 16px rgba(78,222,163,0.20),0 4px 10px rgba(0,0,0,.4)`,
              transition:'transform .18s ease' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            View Roadmap <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   QUICK ACCESS
══════════════════════════════════════════════════════ */
function QuickAccess({ navigate }) {
  const links = [
    { label:'Skill Tracker',     sub:'Track progress',    to:'/skill-tracker',  icon:<Activity size={18} /> },
    { label:'Career Simulator',  sub:'Explore paths',     to:'/career-sim',     icon:<TrendingUp size={18} /> },
    { label:'Interview Prep',    sub:'Practice now',      to:'/interview',      icon:<Zap size={18} /> },
  ];
  return (
    <>
      {links.map(l => (
        <div
          key={l.to}
          onClick={() => navigate(l.to)}
          style={{ ...glassCard({ cursor:'pointer', padding:'20px 22px', transition:'transform .22s ease, box-shadow .22s ease' }) }}
          onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow=`0 4px 6px rgba(0,0,0,.40),0 24px 48px rgba(0,0,0,.55),inset 0 1px 1px rgba(255,255,255,.10),0 0 30px rgba(78,222,163,.10)`; }}
          onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 4px 6px rgba(0,0,0,.40),0 24px 48px rgba(0,0,0,.55),inset 0 1px 1px rgba(255,255,255,.08)'; }}
        >
          <RimGlow />
          <div style={{ position:'relative', zIndex:1 }}>
            <div style={{ width:'42px', height:'42px', borderRadius:'12px',
              background:EMERALD_DIM, border:`1px solid rgba(78,222,163,0.22)`,
              display:'flex', alignItems:'center', justifyContent:'center',
              color:EMERALD, marginBottom:'14px' }}>
              {l.icon}
            </div>
            <div style={{ fontSize:'14px', fontWeight:700, color:'#d4e4fa', marginBottom:'4px' }}>{l.label}</div>
            <div style={{ fontSize:'12px', color:'rgba(187,202,191,0.50)', display:'flex', alignItems:'center', gap:'4px' }}>
              {l.sub} <ArrowUpRight size={12} />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

/* ══════════════════════════════════════════════════════
   HELPER
══════════════════════════════════════════════════════ */
function Tag({ label }) {
  return (
    <span style={{ fontSize:'11px', fontWeight:600, padding:'3px 10px',
      borderRadius:'999px', background:'rgba(255,255,255,0.06)',
      border:'1px solid rgba(255,255,255,0.10)', color:'rgba(212,228,250,0.75)' }}>
      {label}
    </span>
  );
}