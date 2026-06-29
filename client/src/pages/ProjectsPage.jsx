import { useState } from 'react';
import { Plus, Trash2, Edit2, FolderOpen, ExternalLink, Layers, Cpu, Search, Code2, Server, Database, Cloud, Brain, Smartphone } from 'lucide-react';
import { getProjects, saveProjects, addActivity, getSkills, saveSkills } from '../utils/storage.js';
import ProjectRecommendations from '../components/ProjectRecommendations';
import { useSearchParams } from 'react-router-dom';

/* ─── Design tokens ─── */
const EMERALD = '#4edea3';
const glass = (extra = {}) => ({
  background: 'linear-gradient(135deg, rgba(5,20,36,0.88) 0%, rgba(13,28,45,0.60) 100%)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(78,222,163,0.14)',
  boxShadow: '0 4px 6px rgba(0,0,0,0.40), 0 24px 48px rgba(0,0,0,0.55), inset 0 1px 1px rgba(255,255,255,0.06)',
  borderRadius: '18px',
  position: 'relative',
  overflow: 'hidden',
  ...extra,
});

function RimGlow() {
  return (
    <>
      <div style={{ position:'absolute', inset:0, borderRadius:'inherit', background:'linear-gradient(135deg,rgba(255,255,255,0.06) 0%,transparent 60%)', pointerEvents:'none', zIndex:0 }} />
      <style>{`@keyframes rim-pj{0%,100%{opacity:.28}50%{opacity:.85}}`}</style>
      <div style={{ position:'absolute', inset:0, borderRadius:'inherit', padding:'1px',
        background:'linear-gradient(135deg,rgba(78,222,163,.65) 0%,rgba(78,222,163,0) 40%,rgba(78,222,163,0) 70%,rgba(78,222,163,.50) 100%)',
        WebkitMask:'linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0)',
        WebkitMaskComposite:'xor', maskComposite:'exclude',
        pointerEvents:'none', animation:'rim-pj 4s ease-in-out infinite', zIndex:0 }} />
    </>
  );
}

const STATUS_CONFIG = {
  'In Progress': { bg: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: 'rgba(251,191,36,0.28)' },
  Done:          { bg: 'rgba(78,222,163,0.12)',  color: '#4edea3', border: 'rgba(78,222,163,0.28)' },
  Paused:        { bg: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.40)', border: 'rgba(255,255,255,0.10)' },
};

const EMPTY_FORM = { name:'', description:'', techStack:[], skills:[], status:'In Progress', github:'' };

const inputStyle = {
  width:'100%', background:'rgba(5,7,10,0.70)', border:'1px solid rgba(255,255,255,0.08)',
  borderRadius:'12px', padding:'11px 15px', color:'#d4e4fa', fontSize:'13px',
  fontFamily:'inherit', outline:'none', marginBottom:'14px', boxSizing:'border-box',
  transition:'border-color 0.18s ease, box-shadow 0.18s ease',
};

const CATEGORIES = ['Frontend', 'Backend', 'DevOps', 'Database', 'AI-ML', 'Mobile', 'Other'];

const CAT_META = {
  Frontend: { icon: <Code2 size={14} />,     color: '#6C5DD3' },
  Backend:  { icon: <Server size={14} />,     color: '#8b5cf6' },
  DevOps:   { icon: <Cloud size={14} />,      color: '#06b6d4' },
  Database: { icon: <Database size={14} />,   color: '#10b981' },
  'AI-ML':  { icon: <Brain size={14} />,      color: '#f59e0b' },
  Mobile:   { icon: <Smartphone size={14} />, color: '#ec4899' },
  Other:    { icon: <Layers size={14} />,     color: '#6b7280' },
};

function SkillTrackerCard({ skill, onDelete, onProgress }) {
  const meta = CAT_META[skill.category] || CAT_META['Other'];

  return (
    <div
      style={{
        borderRadius: '16px',
        padding: '18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
        background: 'linear-gradient(135deg, rgba(5,20,36,0.88) 0%, rgba(13,28,45,0.65) 100%)',
        border: '1px solid rgba(78,222,163,0.14)',
        boxShadow: '0 4px 6px rgba(0,0,0,0.35), 0 16px 32px rgba(0,0,0,0.50)',
      }}
    >
      {/* Row 1 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '9px',
              flexShrink: 0,
              background: `${meta.color}18`,
              border: `1px solid ${meta.color}28`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: meta.color,
            }}
          >
            {meta.icon}
          </div>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {skill.name}
          </div>
        </div>
        <span
          style={{
            fontSize: '10px',
            fontWeight: 700,
            borderRadius: '6px',
            padding: '3px 9px',
            whiteSpace: 'nowrap',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            background: skill.status === 'Learned' ? 'rgba(78,222,163,0.12)' : 'rgba(251,191,36,0.12)',
            color: skill.status === 'Learned' ? '#4edea3' : '#fbbf24',
            border: skill.status === 'Learned' ? '1px solid rgba(78,222,163,0.28)' : '1px solid rgba(251,191,36,0.28)',
          }}
        >
          {skill.status}
        </span>
      </div>

      {/* Progress */}
      <div style={{ marginTop: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-faint)' }}>Progress</span>
          <span style={{ fontSize: '11px', color: 'var(--accent-bright)', fontWeight: 700 }}>
            {skill.progress}%
          </span>
        </div>
        <div
          style={{ padding: '6px 0', cursor: 'pointer' }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = Math.min(100, Math.max(0, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
            onProgress(pct);
          }}
        >
          <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '9999px', overflow: 'hidden' }}>
            <div style={{ width: `${skill.progress}%`, height: '100%', background: '#4edea3', borderRadius: '9999px', transition: 'width 0.3s' }} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          style={{
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--text-faint)',
            fontWeight: 600,
          }}
        >
          {skill.category}
        </span>
        <button
          onClick={onDelete}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-faint)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '36px',
            minWidth: '36px',
            margin: '-8px -8px -8px 0',
            borderRadius: '8px',
            transition: 'color var(--dur-med) ease, background var(--dur-med) ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--red)';
            e.currentTarget.style.background = 'rgba(248,113,113,0.10)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-faint)';
            e.currentTarget.style.background = 'none';
          }}
          aria-label="Delete skill"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

function SkillTrackerContent() {
  const [skills, setSkills] = useState(() => getSkills());
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [modal, setModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCat, setNewCat] = useState('Frontend');
  const [newStat, setNewStat] = useState('Learning');

  const sync = (arr) => { saveSkills(arr); setSkills(arr); };

  const addSkill = () => {
    if (!newName.trim()) return;
    const skill = {
      id: Date.now(),
      name: newName.trim(),
      category: newCat,
      status: newStat,
      progress: newStat === 'Learned' ? 100 : 10,
      addedAt: Date.now(),
    };
    sync([...skills, skill]);
    addActivity(`Added skill: ${skill.name}`);
    setNewName(''); setNewCat('Frontend'); setNewStat('Learning'); setModal(false);
  };

  const deleteSkill = (id) => sync(skills.filter((s) => s.id !== id));

  const updateProgress = (id, val) => {
    const next = skills.map((s) =>
      s.id === id ? { ...s, progress: val, status: val >= 100 ? 'Learned' : 'Learning' } : s
    );
    sync(next);
  };

  const filtered = skills
    .filter((s) => filter === 'All' || s.status === filter)
    .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));

  const learnedCount = skills.filter((s) => s.status === 'Learned').length;
  const learningCount = skills.filter((s) => s.status === 'Learning').length;

  const inp = {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '10px',
    padding: '10px 14px',
    color: 'var(--text-primary)',
    fontSize: '13px',
    fontFamily: 'inherit',
    outline: 'none',
    marginBottom: '14px',
    boxSizing: 'border-box',
    transition: 'border-color var(--dur-med) ease, box-shadow var(--dur-med) ease',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', gap: '10px', fontSize: '11px', color: 'var(--text-faint)' }}>
            <span style={{ color: 'var(--green)' }}>✓ {learnedCount} learned</span>
            <span style={{ color: '#fbbf24' }}>⟳ {learningCount} in progress</span>
          </div>
        </div>
        <button
          onClick={() => setModal(true)}
          style={{
            padding: '9px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexShrink: 0,
            whiteSpace: 'nowrap',
            minHeight: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #4edea3 0%, #10b981 100%)',
            border: 'none',
            color: '#003824',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          <Plus size={14} /> Add Skill
        </button>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: '1 1 200px', maxWidth: '300px' }}>
          <Search
            size={14}
            color="var(--text-faint)"
            style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search skills..."
            style={{
              width: '100%',
              paddingLeft: '34px',
              paddingRight: '12px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: '10px',
              paddingTop: '10px',
              paddingBottom: '10px',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontFamily: 'inherit',
              outline: 'none',
              minHeight: '40px',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['All', 'Learning', 'Learned'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '9px 16px',
                borderRadius: '9999px',
                border: `1px solid ${filter === f ? 'rgba(78,222,163,0.30)' : 'rgba(255,255,255,0.08)'}`,
                cursor: 'pointer',
                background: filter === f ? 'rgba(78,222,163,0.12)' : 'rgba(255,255,255,0.04)',
                color: filter === f ? '#4edea3' : 'var(--text-muted)',
                fontSize: '12px',
                fontWeight: filter === f ? 700 : 400,
                fontFamily: 'inherit',
                minHeight: '38px',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(5,20,36,0.88) 0%, rgba(13,28,45,0.60) 100%)',
            border: '1px solid rgba(78,222,163,0.14)',
            borderRadius: '18px',
            padding: '60px 24px',
            textAlign: 'center',
            color: 'var(--text-faint)',
            fontSize: '14px',
          }}
        >
          {skills.length === 0 ? 'No skills yet. Add your first skill!' : 'No skills match your filters.'}
        </div>
      ) : (
        <div
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px,1fr))', gap: '14px' }}
        >
          {filtered.map((skill) => (
            <SkillTrackerCard
              key={skill.id}
              skill={skill}
              onDelete={() => deleteSkill(skill.id)}
              onProgress={(v) => updateProgress(skill.id, v)}
            />
          ))}
        </div>
      )}

      {/* Add Skill Modal */}
      {modal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setModal(false); }}
        >
          <div style={{
            background: 'linear-gradient(135deg, rgba(5,20,36,0.90) 0%, rgba(13,28,45,0.65) 100%)',
            border: '1px solid rgba(78,222,163,0.18)',
            borderRadius: '22px',
            padding: '28px',
            width: '100%',
            maxWidth: '400px',
            position: 'relative',
          }}>
            <RimGlow />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '22px', letterSpacing: '-0.01em' }}>
                Add New Skill
              </div>
              <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '6px' }}>Skill Name</label>
              <input
                style={{ ...inp, minHeight: '44px' }}
                placeholder="e.g. React, Docker, Python..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                autoFocus
              />
              <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '6px' }}>Category</label>
              <select
                style={{ ...inp, minHeight: '44px', marginBottom: '14px' }}
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '6px' }}>Status</label>
              <select
                style={{ ...inp, minHeight: '44px' }}
                value={newStat}
                onChange={(e) => setNewStat(e.target.value)}
              >
                <option value="Learning">Learning</option>
                <option value="Learned">Learned</option>
              </select>
              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button
                  onClick={() => setModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    borderRadius: '12px',
                    color: 'rgba(255,255,255,0.65)',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    minHeight: '44px',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={addSkill}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'linear-gradient(135deg, #4edea3, #10b981)',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#003824',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    minHeight: '44px',
                  }}
                >
                  Add Skill
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectsContent({ projects, openAdd, openEdit, remove, sync }) {
  return (
    <>
      {/* ── Empty State ── */}
      {projects.length === 0 ? (
        <div style={{ ...glass({ padding:'64px 24px' }), display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'20px', textAlign:'center' }}>
          <RimGlow />
          <div style={{ position:'relative', zIndex:1 }}>
            <div style={{ width:80, height:80, borderRadius:'22px', background:'rgba(78,222,163,0.08)', border:'1px solid rgba(78,222,163,0.20)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', boxShadow:'0 0 30px rgba(78,222,163,0.12)' }}>
              <FolderOpen size={36} color={EMERALD} style={{ opacity:0.7 }} />
            </div>
            <div style={{ fontSize:'20px', fontWeight:700, color:'#d4e4fa', marginBottom:'8px' }}>No projects yet</div>
            <div style={{ fontSize:'13px', color:'rgba(187,202,191,0.50)', marginBottom:'24px', lineHeight:1.6 }}>
              Showcase your work by adding your first project
            </div>
            <button onClick={openAdd} style={{
              display:'flex', alignItems:'center', gap:'8px', padding:'12px 28px',
              background:`linear-gradient(135deg, ${EMERALD} 0%, #10b981 100%)`,
              border:'none', borderRadius:'12px', color:'#003824', fontSize:'13px', fontWeight:800,
              cursor:'pointer', fontFamily:'inherit', margin:'0 auto',
              boxShadow:'0 0 20px rgba(78,222,163,0.25)',
            }}>
              <Plus size={15} /> Add Your First Project
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(290px,1fr))', gap:'18px' }}>
          {projects.map(p => (
            <ProjectCard key={p.id} project={p} onEdit={() => openEdit(p)} onDelete={() => remove(p.id)} />
          ))}
        </div>
      )}

      {/* ── AI Project Recommendations ── */}
      <div style={{ marginTop:'8px' }}>
        <ProjectRecommendations
          userSkills={getSkills().map(s => s.name.toLowerCase())}
          onAddToProjects={(project) => {
            const next = [{ ...project, id: Date.now(), createdAt: Date.now() }, ...projects];
            sync(next);
            addActivity(`Added recommended project: ${project.name}`);
          }}
        />
      </div>
    </>
  );
}

export default function ProjectsPage() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') === 'skills' ? 'skills' : 'projects');

  const [projects, setProjects] = useState(() => getProjects());
  const [modal, setModal]       = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [techInput, setTechInput] = useState('');
  const [skillInput, setSkillInput] = useState('');

  const sync = (arr) => { saveProjects(arr); setProjects(arr); };

  const openAdd  = () => { setForm(EMPTY_FORM); setEditing(null); setModal(true); };
  const openEdit = (p) => { setForm({ ...p }); setEditing(p.id); setModal(true); };

  const save = () => {
    if (!form.name.trim()) return;
    if (editing) {
      sync(projects.map(p => p.id === editing ? { ...form, id: editing } : p));
      addActivity(`Updated project: ${form.name}`);
    } else {
      sync([{ ...form, id: Date.now(), createdAt: Date.now() }, ...projects]);
      addActivity(`Added project: ${form.name}`);
    }
    setModal(false);
  };

  const remove = (id) => {
    if (!confirm('Delete this project?')) return;
    sync(projects.filter(p => p.id !== id));
  };

  const addTag    = (field, value, setter) => { if (!value.trim()) return; setForm(f => ({ ...f, [field]: [...(f[field]||[]), value.trim()] })); setter(''); };
  const removeTag = (field, idx) => setForm(f => ({ ...f, [field]: f[field].filter((_,i)=>i!==idx) }));

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px', paddingLeft: '16px', paddingRight: '16px', paddingTop: '16px', boxSizing: 'border-box' }}>

      {/* ── Page Header ── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <div style={{ width:36, height:36, borderRadius:'10px', background:'rgba(78,222,163,0.12)', border:'1px solid rgba(78,222,163,0.22)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Layers size={18} color={EMERALD} />
            </div>
            <h1 style={{ fontSize:'22px', fontWeight:800, color:'#d4e4fa', letterSpacing:'-0.02em' }}>
              {activeTab === 'projects' ? 'Projects' : 'Skill Tracker'}
            </h1>
            {activeTab === 'projects' && (
              <span style={{ fontSize:'11px', fontWeight:700, color:EMERALD, background:'rgba(78,222,163,0.10)', border:'1px solid rgba(78,222,163,0.22)', borderRadius:'999px', padding:'3px 10px' }}>
                {projects.length}
              </span>
            )}
          </div>
          <p style={{ fontSize:'12px', color:'rgba(187,202,191,0.50)', marginTop:'4px', marginLeft:'46px' }}>
            {activeTab === 'projects' ? 'Showcase and manage your portfolio projects' : 'Track your skill acquisition progress'}
          </p>
        </div>
        {activeTab === 'projects' && (
          <button onClick={openAdd} style={{
            display:'flex', alignItems:'center', gap:'8px', padding:'10px 20px',
            background:`linear-gradient(135deg, ${EMERALD} 0%, #10b981 100%)`,
            border:'none', borderRadius:'12px', color:'#003824', fontSize:'13px', fontWeight:800,
            cursor:'pointer', fontFamily:'inherit', minHeight:'42px',
            boxShadow:'0 0 20px rgba(78,222,163,0.25), 0 4px 12px rgba(0,0,0,0.40)',
            transition:'all 0.18s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform='scale(1.04)'; e.currentTarget.style.boxShadow='0 0 28px rgba(78,222,163,0.35), 0 6px 18px rgba(0,0,0,0.40)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.boxShadow='0 0 20px rgba(78,222,163,0.25), 0 4px 12px rgba(0,0,0,0.40)'; }}
          >
            <Plus size={15} /> Add Project
          </button>
        )}
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        {[
          { id: 'projects', label: '📁 Projects'     },
          { id: 'skills',   label: '⚡ Skill Tracker' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 18px',
              borderRadius: '10px',
              border: activeTab === tab.id
                ? '1px solid rgba(78,222,163,0.4)'
                : '1px solid var(--border)',
              background: activeTab === tab.id
                ? 'rgba(78,222,163,0.12)'
                : 'transparent',
              color: activeTab === tab.id
                ? '#4edea3'
                : 'var(--text-muted)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              minHeight: '38px',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'projects' && (
        <ProjectsContent
          projects={projects}
          openAdd={openAdd}
          openEdit={openEdit}
          remove={remove}
          sync={sync}
        />
      )}

      {activeTab === 'skills' && (
        <SkillTrackerContent />
      )}

      {/* ── Modal ── */}
      {modal && (
        <div onClick={e => { if(e.target===e.currentTarget) setModal(false); }} style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)',
          display:'flex', alignItems:'center', justifyContext:'center', zIndex:9999, padding:'20px',
        }}>
          <div style={{
            ...glass({ padding:'28px', borderRadius:'22px', overflow:'auto' }),
            width:'100%', maxWidth:'480px', maxHeight:'90vh', margin:'auto'
          }}>
            <RimGlow />
            <div style={{ position:'relative', zIndex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'22px' }}>
                <div style={{ width:32, height:32, borderRadius:'9px', background:'rgba(78,222,163,0.12)', border:'1px solid rgba(78,222,163,0.22)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Layers size={16} color={EMERALD} />
                </div>
                <h2 style={{ fontSize:'17px', fontWeight:700, color:'#d4e4fa' }}>{editing ? 'Edit Project' : 'Add Project'}</h2>
              </div>

              {[
                { label:'Project Name *', type:'text', key:'name', placeholder:'e.g. Portfolio Website' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display:'block', fontSize:'10px', fontWeight:700, color:'rgba(187,202,191,0.50)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'6px' }}>{f.label}</label>
                  <input style={inputStyle} placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm(ff => ({ ...ff, [f.key]: e.target.value }))}
                    onFocus={e => { e.target.style.borderColor='rgba(78,222,163,0.45)'; e.target.style.boxShadow='0 0 12px rgba(78,222,163,0.10)'; }}
                    onBlur={e =>  { e.target.style.borderColor='rgba(255,255,255,0.08)'; e.target.style.boxShadow='none'; }}
                  />
                </div>
              ))}

              <label style={{ display:'block', fontSize:'10px', fontWeight:700, color:'rgba(187,202,191,0.50)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'6px' }}>Description</label>
              <textarea style={{ ...inputStyle, minHeight:'80px', resize:'vertical' }} placeholder="What does this project do?"
                value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                onFocus={e => { e.target.style.borderColor='rgba(78,222,163,0.45)'; e.target.style.boxShadow='0 0 12px rgba(78,222,163,0.10)'; }}
                onBlur={e =>  { e.target.style.borderColor='rgba(255,255,255,0.08)'; e.target.style.boxShadow='none'; }}
              />

              {/* Tech Stack */}
              <label style={{ display:'block', fontSize:'10px', fontWeight:700, color:'rgba(187,202,191,0.50)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'6px' }}>Tech Stack (Enter to add)</label>
              <input style={{ ...inputStyle, marginBottom:'8px' }} placeholder="e.g. React, Node.js" value={techInput}
                onChange={e => setTechInput(e.target.value)}
                onKeyDown={e => { if(e.key==='Enter'){ e.preventDefault(); addTag('techStack', techInput, setTechInput); }}}
                onFocus={e => { e.target.style.borderColor='rgba(78,222,163,0.45)'; e.target.style.boxShadow='0 0 12px rgba(78,222,163,0.10)'; }}
                onBlur={e =>  { e.target.style.borderColor='rgba(255,255,255,0.08)'; e.target.style.boxShadow='none'; }}
              />
              <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginBottom:'16px' }}>
                {(form.techStack||[]).map((t,i) => (
                  <span key={i} onClick={() => removeTag('techStack',i)} style={{ fontSize:'11px', color:'rgba(187,202,191,0.70)', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.10)', borderRadius:'6px', padding:'4px 10px', cursor:'pointer' }}>{t} ×</span>
                ))}
              </div>

              {/* Skills */}
              <label style={{ display:'block', fontSize:'10px', fontWeight:700, color:'rgba(187,202,191,0.50)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'6px' }}>Skills Used (Enter to add)</label>
              <input style={{ ...inputStyle, marginBottom:'8px' }} placeholder="e.g. REST API, GraphQL" value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => { if(e.key==='Enter'){ e.preventDefault(); addTag('skills', skillInput, setSkillInput); }}}
                onFocus={e => { e.target.style.borderColor='rgba(78,222,163,0.45)'; e.target.style.boxShadow='0 0 12px rgba(78,222,163,0.10)'; }}
                onBlur={e =>  { e.target.style.borderColor='rgba(255,255,255,0.08)'; e.target.style.boxShadow='none'; }}
              />
              <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginBottom:'16px' }}>
                {(form.skills||[]).map((s,i) => (
                  <span key={i} onClick={() => removeTag('skills',i)} style={{ fontSize:'11px', color:EMERALD, background:'rgba(78,222,163,0.09)', border:'1px solid rgba(78,222,163,0.22)', borderRadius:'6px', padding:'4px 10px', cursor:'pointer' }}>{s} ×</span>
                ))}
              </div>

              {/* Status */}
              <label style={{ display:'block', fontSize:'10px', fontWeight:700, color:'rgba(187,202,191,0.50)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'6px' }}>Status</label>
              <select style={{ ...inputStyle }} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                onFocus={e => { e.target.style.borderColor='rgba(78,222,163,0.45)'; }}
                onBlur={e =>  { e.target.style.borderColor='rgba(255,255,255,0.08)'; }}
              >
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
                <option value="Paused">Paused</option>
              </select>

              {/* GitHub URL */}
              <label style={{ display:'block', fontSize:'10px', fontWeight:700, color:'rgba(187,202,191,0.50)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'6px' }}>GitHub URL</label>
              <input style={inputStyle} placeholder="https://github.com/..." value={form.github||''}
                onChange={e => setForm(f => ({ ...f, github: e.target.value }))}
                onFocus={e => { e.target.style.borderColor='rgba(78,222,163,0.45)'; e.target.style.boxShadow='0 0 12px rgba(78,222,163,0.10)'; }}
                onBlur={e =>  { e.target.style.borderColor='rgba(255,255,255,0.08)'; e.target.style.boxShadow='none'; }}
              />

              <div style={{ display:'flex', gap:'10px', marginTop:'8px' }}>
                <button onClick={() => setModal(false)} style={{ flex:1, padding:'12px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.10)', borderRadius:'12px', color:'rgba(255,255,255,0.65)', fontSize:'13px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', minHeight:'44px', transition:'all 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.04)'}
                >Cancel</button>
                <button onClick={save} style={{ flex:1, padding:'12px', background:`linear-gradient(135deg, ${EMERALD}, #10b981)`, border:'none', borderRadius:'12px', color:'#003824', fontSize:'13px', fontWeight:800, cursor:'pointer', fontFamily:'inherit', minHeight:'44px', transition:'all 0.15s', boxShadow:'0 0 16px rgba(78,222,163,0.20)' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow='0 0 24px rgba(78,222,163,0.35)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow='0 0 16px rgba(78,222,163,0.20)'}
                >Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @media (max-width:768px){
          .pj-grid{gridTemplateColumns:repeat(auto-fill, minmax(260px, 1fr))!important;gap:12px!important}
          .pj-card{padding:16px!important}
          .pj-title{font-size:20px!important}
        }
        @media (max-width:640px){
          .pj-grid{gridTemplateColumns:1fr!important;gap:10px!important}
          .pj-card{padding:12px!important;border-radius:12px!important}
          .pj-title{font-size:18px!important;line-height:1.2!important}
          .pj-input{width:100%!important;padding:10px 12px!important;font-size:12px!important}
          .pj-btn{width:100%!important;padding:8px 12px!important;font-size:11px!important}
        }
        @media (max-width:480px){
          .pj-card{padding:10px!important;gap:8px!important}
          .pj-title{font-size:16px!important}
        }
      `}</style>
    </div>
  );
}

function ProjectCard({ project: p, onEdit, onDelete }) {
  const sc = STATUS_CONFIG[p.status] || STATUS_CONFIG.Paused;

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(5,20,36,0.88) 0%, rgba(13,28,45,0.65) 100%)',
      backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
      border:'1px solid rgba(78,222,163,0.14)', borderRadius:'18px', padding:'22px',
      display:'flex', flexDirection:'column', gap:'14px',
      position:'relative', overflow:'hidden',
      boxShadow:'0 4px 6px rgba(0,0,0,0.35), 0 16px 32px rgba(0,0,0,0.50)',
      transition:'all 0.22s ease', cursor:'default',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(78,222,163,0.30)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.50), 0 0 20px rgba(78,222,163,0.08)'; e.currentTarget.style.transform='translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(78,222,163,0.14)'; e.currentTarget.style.boxShadow='0 4px 6px rgba(0,0,0,0.35), 0 16px 32px rgba(0,0,0,0.50)'; e.currentTarget.style.transform='translateY(0)'; }}
    >
      {/* Subtle inner highlight */}
      <div style={{ position:'absolute', inset:0, borderRadius:'inherit', background:'linear-gradient(135deg,rgba(255,255,255,0.05) 0%,transparent 60%)', pointerEvents:'none' }} />

      {/* Header row */}
      <div style={{ position:'relative', zIndex:1, display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'8px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', minWidth:0 }}>
          <div style={{ width:34, height:34, borderRadius:'9px', background:'rgba(78,222,163,0.10)', border:'1px solid rgba(78,222,163,0.20)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <Cpu size={16} color="#4edea3" />
          </div>
          <div style={{ fontSize:'14px', fontWeight:700, color:'#d4e4fa', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</div>
        </div>
        <span style={{ fontSize:'10px', fontWeight:700, color:sc.color, background:sc.bg, border:`1px solid ${sc.border}`, borderRadius:'6px', padding:'3px 9px', whiteSpace:'nowrap', letterSpacing:'0.04em', textTransform:'uppercase' }}>{p.status}</span>
      </div>

      {/* Description */}
      {p.description && (
        <div style={{ position:'relative', zIndex:1, fontSize:'12px', color:'rgba(187,202,191,0.60)', lineHeight:1.65, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
          {p.description}
        </div>
      )}

      {/* Tech Stack */}
      {(p.techStack||[]).length > 0 && (
        <div style={{ position:'relative', zIndex:1, display:'flex', flexWrap:'wrap', gap:'6px' }}>
          {p.techStack.map((t,i) => (
            <span key={i} style={{ fontSize:'10px', color:'rgba(187,202,191,0.65)', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'5px', padding:'3px 8px' }}>{t}</span>
          ))}
        </div>
      )}

      {/* Skills */}
      {(p.skills||[]).length > 0 && (
        <div style={{ position:'relative', zIndex:1, display:'flex', flexWrap:'wrap', gap:'6px' }}>
          {p.skills.map((s,i) => (
            <span key={i} style={{ fontSize:'10px', color:'#4edea3', background:'rgba(78,222,163,0.09)', border:'1px solid rgba(78,222,163,0.20)', borderRadius:'5px', padding:'3px 8px' }}>{s}</span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:'12px', borderTop:'1px solid rgba(255,255,255,0.06)', marginTop:'auto' }}>
        {p.github ? (
          <a href={p.github} target="_blank" rel="noreferrer" style={{ display:'flex', alignItems:'center', gap:'5px', fontSize:'11px', color:'rgba(187,202,191,0.45)', textDecoration:'none', minHeight:'36px', transition:'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color='#4edea3'}
            onMouseLeave={e => e.currentTarget.style.color='rgba(187,202,191,0.45)'}
          >
            <ExternalLink size={12} /> GitHub
          </a>
        ) : <div />}
        <div style={{ display:'flex', gap:'8px' }}>
          {[
            { action: onEdit, icon: <Edit2 size={14} />, hover: '#4edea3', hoverBg: 'rgba(78,222,163,0.10)', label:'Edit' },
            { action: onDelete, icon: <Trash2 size={14} />, hover: '#f87171', hoverBg: 'rgba(248,113,113,0.10)', label:'Delete' },
          ].map(({ action, icon, hover, hoverBg, label }) => (
            <button key={label} onClick={action} title={label} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(187,202,191,0.40)', display:'flex', alignItems:'center', justifyContent:'center', width:'34px', height:'34px', borderRadius:'8px', transition:'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.color=hover; e.currentTarget.style.background=hoverBg; }}
              onMouseLeave={e => { e.currentTarget.style.color='rgba(187,202,191,0.40)'; e.currentTarget.style.background='none'; }}
            >{icon}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
