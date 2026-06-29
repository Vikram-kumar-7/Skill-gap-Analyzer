import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload, CheckCircle2, Loader2, Zap, Lock,
  Target, Briefcase, Terminal, X, FileText, Bolt,
} from 'lucide-react';
import { saveAnalysis, addActivity, getUser } from '../utils/storage.js';
import { runAnalysis, runAnalysisWithExtracted } from '../utils/analysisEngine.js';
import { analyzeResume } from '../services/api.js';

/* ─── design tokens ─── */
const EMERALD      = '#4edea3';
const EMERALD_DIM  = 'rgba(78,222,163,0.10)';
const EMERALD_GLOW = 'rgba(78,222,163,0.18)';

const ROLES = [
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'Data Scientist',
  'DevOps Engineer',
  'ML Engineer',
  'Mobile Developer',
  'UI/UX Designer',
];

/* ── shared glass card style ── */
const obsidianGlass = (extra = {}) => ({
  background: 'linear-gradient(to bottom, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.55) 100%), rgba(5,20,36,0.88)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(78,222,163,0.18)',
  boxShadow:
    '0 30px 60px -15px rgba(0,0,0,0.80), 0 8px 16px -4px rgba(0,0,0,0.90), inset 0 1px 2px rgba(255,255,255,0.08), inset 0 0 30px rgba(16,185,129,0.04)',
  borderRadius: '16px',
  position: 'relative',
  overflow: 'hidden',
  ...extra,
});

/* ══════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════ */
const ts = () => new Date().toTimeString().slice(0, 8);

export default function NewAnalysisPage() {
  const navigate = useNavigate();
  const user = getUser() || {};
  const fileRef = useRef(null);

  const [mode, setMode]                     = useState('pdf');
  const [file, setFile]                     = useState(null);
  const [resumeText, setResumeText]         = useState('');
  const [jd, setJd]                         = useState('');
  const [role, setRole]                     = useState(user.targetRole || ROLES[0]);
  const [depth, setDepth]                   = useState('standard');
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState('');
  const [dragging, setDragging]             = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [showResultModal, setShowResultModal] = useState(false);
  const [modalData, setModalData]           = useState(null);
  const [animatedPct, setAnimatedPct]       = useState(0);
  const [logs, setLogs]                     = useState([
    { time: '00:00:00', text: 'Core parameters initialized.', active: true },
    { time: '--:--:--', text: 'Awaiting credentials upload...', active: false },
    { time: '--:--:--', text: 'Awaiting objective parameters...', active: false },
    { time: '--:--:--', text: 'Standing by for execution...', active: false },
  ]);
  const [signalPct, setSignalPct]           = useState(0);

  /* Animate signal strength bar on mount */
  useEffect(() => {
    const t = setTimeout(() => setSignalPct(80), 300);
    return () => clearTimeout(t);
  }, []);

  /* Animate result percentage when modal opens */
  useEffect(() => {
    if (showResultModal && modalData) {
      setAnimatedPct(0);
      let start = 0;
      const end = modalData.matchPct;
      if (start === end) {
        setAnimatedPct(end);
        return;
      }
      const duration = 1200; // 1.2s animation duration
      const startTime = performance.now();
      
      let animationFrameId;
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = progress * (2 - progress); // ease-out quad
        const current = Math.round(start + easeProgress * (end - start));
        setAnimatedPct(current);
        
        if (progress < 1) {
          animationFrameId = requestAnimationFrame(animate);
        }
      };
      
      animationFrameId = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationFrameId);
    }
  }, [showResultModal, modalData]);

  const handleFile = (f) => {
    if (!f) return;
    if (f.type !== 'application/pdf') { setError('Please upload a PDF file.'); return; }
    if (f.size > 10 * 1024 * 1024)   { setError('File too large. Max 10MB.'); return; }
    setFile(f);
    setError('');
    setValidationErrors(prev => ({ ...prev, resume: '' }));
    setLogs(prev => {
      const next = [...prev];
      next[1] = { time: ts(), text: `Credentials loaded · ${f.name}`, active: true };
      return next;
    });
    const reader = new FileReader();
    reader.onload = (e) => setResumeText(e.target.result || '');
    reader.readAsText(f);
  };

  const analyze = async () => {
    console.log('>>> ANALYZE CLICKED, resume length:', resumeText.length, 'jd length:', jd.length);
    const resume = resumeText.trim();
    const jdText = jd.trim();
    const errs = {};

    if (mode === 'pdf' && !file) {
      errs.resume = 'Please upload your resume PDF.';
    } else if (mode === 'text' && !resume) {
      errs.resume = 'Please paste your resume text.';
    }
    if (!jdText) errs.jd = 'Please paste the job description.';
    if (Object.keys(errs).length > 0) { setValidationErrors(errs); return; }

    setValidationErrors({});
    setError('');
    setLoading(true);

    /* Animate log during processing */
    setLogs(prev => {
      const next = [...prev];
      next[3] = { time: ts(), text: 'Neural comparison engine starting...', active: true };
      return next;
    });

    let result;
    try {
      const formData = new FormData();
      if (mode === 'pdf') {
        formData.append('resume', file);
      } else {
        formData.append('resumeText', resume);
      }
      formData.append('jobDescription', jdText);
      formData.append('targetRole', role);
      formData.append('aiMode', 'true');

      setLogs(prev => {
        const next = [...prev];
        next.push({ time: ts(), text: 'Connecting to server API...', active: true });
        return next;
      });

      const response = await analyzeResume(formData);

      if (response && response.success && response.data) {
        const data = response.data;
        result = runAnalysisWithExtracted({
          resumeSkills: data.resumeSkills || [],
          jdSkills: data.jobSkills || [],
          targetRole: role,
          insights: data.insights || null,
        });
      } else {
        throw new Error('Invalid server response structure');
      }
    } catch (err) {
      console.warn('Backend analysis failed, attempting fallback:', err.message);

      if (mode === 'pdf') {
        setError('The server is offline or encountered an error. Please paste your resume as text in "Paste Text" mode or ensure the backend server is running.');
        setLoading(false);
        return;
      } else {
        setLogs(prev => {
          const next = [...prev];
          next.push({ time: ts(), text: 'Server offline. Falling back to local neural simulator...', active: true });
          return next;
        });
        await new Promise(r => setTimeout(r, 600));
        result = runAnalysis({ resumeText: resume, jobDescription: jdText, targetRole: role });
      }
    }

    // TEMP DEBUG — show on screen
    const debugInfo = {
      allResume: [...result.presentSkills, ...result.extraSkills],
      jdRequired: result.missingSkills.concat(result.presentSkills),
      gaps: result.missingSkills,
      matchPct: result.matchPct,
    };
    localStorage.setItem('sga_debug', JSON.stringify(debugInfo));

    saveAnalysis(result);
    addActivity(`Analyzed for ${role} — ${result.matchPct}% match`);
    setLoading(false);

    // Open the result modal with animation instead of the blocking alert
    setModalData({
      matchPct: result.matchPct,
      role: role,
      present: result.presentSkills,
      missing: result.missingSkills,
    });
    setShowResultModal(true);
  };

  const depthOptions = [
    { key: 'standard', label: 'Standard' },
    { key: 'deep',     label: 'Deep Scan' },
    { key: 'neural',   label: 'Neural' },
  ];

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '28px', paddingBottom: '24px', paddingLeft: '16px', paddingRight: '16px', paddingTop: '16px', boxSizing: 'border-box' }}>

      {/* ── Page header ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <h1 style={{ fontSize: '30px', fontWeight: 800, color: '#d4e4fa', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          New Analysis
        </h1>
        <p style={{ fontSize: '13px', color: 'rgba(187,202,191,0.65)', maxWidth: '540px', lineHeight: 1.6 }}>
          Upload your credentials and target objective to generate a high-precision compatibility matrix and optimization roadmap.
        </p>
      </div>

      {/* ── Bento grid ── */}
      <div className="na-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px', alignItems: 'start' }}>

        {/* ════ LEFT COLUMN ════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Credentials Vault */}
          <div style={obsidianGlass({ padding: '28px' })}>
            <RimGlow />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <SectionHeader icon={<FileText size={16} color={EMERALD} />} title="Credentials Vault" />

              {/* Mode toggle */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <div style={{ background: 'rgba(5,20,36,0.80)', padding: '4px', borderRadius: '999px',
                  border: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '4px' }}>
                  {[{ k: 'pdf', l: 'Upload PDF' }, { k: 'text', l: 'Paste Text' }].map(({ k, l }) => (
                    <button
                      key={k}
                      onClick={() => { setMode(k); setError(''); }}
                      style={{
                        padding: '8px 20px', borderRadius: '999px', border: 'none',
                        fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                        transition: 'all 0.18s ease', letterSpacing: '0.03em',
                        background: mode === k ? EMERALD : 'transparent',
                        color:      mode === k ? '#003824' : 'rgba(187,202,191,0.60)',
                        boxShadow:  mode === k ? `0 0 16px ${EMERALD_GLOW}` : 'none',
                        minHeight: '36px',
                      }}
                    >{l}</button>
                  ))}
                </div>
              </div>

              {/* Upload / Paste area */}
              {mode === 'pdf' ? (
                <>
                  <DropZone
                    file={file}
                    dragging={dragging}
                    error={validationErrors.resume}
                    onDragOver={e => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
                    onClick={() => fileRef.current?.click()}
                    onRemove={() => { setFile(null); setResumeText(''); }}
                  />
                  <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }}
                    onChange={e => handleFile(e.target.files[0])} />
                </>
              ) : (
                <div style={{ position: 'relative' }}>
                  <textarea
                    value={resumeText}
                    onChange={e => {
                      setResumeText(e.target.value);
                      setValidationErrors(p => ({ ...p, resume: '' }));
                      setLogs(prev => {
                        const next = [...prev];
                        next[1] = { time: ts(), text: 'Credentials loaded · text mode', active: true };
                        return next;
                      });
                    }}
                    placeholder="Paste your resume text content here..."
                    style={{
                      width: '100%', height: '180px', resize: 'none',
                      background: 'rgba(5,20,36,0.70)', border: `1px solid ${validationErrors.resume ? '#f87171' : 'rgba(78,222,163,0.25)'}`,
                      borderRadius: '14px', padding: '16px', color: '#d4e4fa',
                      fontSize: '13px', fontFamily: 'inherit', outline: 'none',
                      transition: 'border-color 0.18s ease',
                      boxSizing: 'border-box',
                    }}
                    onFocus={e => { e.target.style.borderColor = EMERALD; e.target.style.boxShadow = `0 0 0 3px rgba(78,222,163,0.10)`; }}
                    onBlur={e  => { e.target.style.borderColor = validationErrors.resume ? '#f87171' : 'rgba(78,222,163,0.25)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              )}
              {validationErrors.resume && <ErrorMsg text={validationErrors.resume} />}
            </div>
          </div>

          {/* Objective Parameters */}
          <div style={obsidianGlass({ padding: '28px' })}>
            <RimGlow />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <SectionHeader icon={<Terminal size={16} color={EMERALD} />} title="Objective Parameters" />

              {/* Role selector */}
              <div style={{ marginBottom: '16px' }}>
                <FieldLabel icon={<Target size={12} />} text="Target Benchmark Role" />
                <div style={{ position: 'relative' }}>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(5,20,36,0.70)',
                      border: '1px solid rgba(78,222,163,0.25)',
                      borderRadius: '12px', padding: '12px 40px 12px 16px',
                      color: '#d4e4fa', fontSize: '13px', fontFamily: 'inherit',
                      outline: 'none', cursor: 'pointer', appearance: 'none',
                      minHeight: '44px', boxSizing: 'border-box',
                    }}
                  >
                    {ROLES.map(r => <option key={r} value={r} style={{ background: '#051424' }}>{r}</option>)}
                  </select>
                  <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                    color: EMERALD, pointerEvents: 'none', fontSize: '12px' }}>▼</span>
                </div>
              </div>

              {/* JD textarea */}
              <div>
                <FieldLabel icon={<Briefcase size={12} />} text="Job Description" />
                <div style={{ position: 'relative' }}>
                  <textarea
                    value={jd}
                    onChange={e => {
                      setJd(e.target.value);
                      setValidationErrors(p => ({ ...p, jd: '' }));
                      setLogs(prev => {
                        const next = [...prev];
                        const words = e.target.value.trim().split(/\s+/).length;
                        next[2] = { time: ts(), text: `Objective parameters set · ${words} tokens`, active: true };
                        return next;
                      });
                    }}
                    placeholder="Paste the target job description requirements here..."
                    style={{
                      width: '100%', height: '200px', resize: 'none',
                      background: 'rgba(5,20,36,0.70)', border: `1px solid ${validationErrors.jd ? '#f87171' : 'rgba(78,222,163,0.25)'}`,
                      borderRadius: '14px', padding: '16px', color: '#d4e4fa',
                      fontSize: '13px', fontFamily: 'inherit', outline: 'none',
                      transition: 'border-color 0.18s ease', boxSizing: 'border-box',
                    }}
                    onFocus={e => { e.target.style.borderColor = EMERALD; e.target.style.boxShadow = `0 0 0 3px rgba(78,222,163,0.10)`; }}
                    onBlur={e  => { e.target.style.borderColor = validationErrors.jd ? '#f87171' : 'rgba(78,222,163,0.25)'; e.target.style.boxShadow = 'none'; }}
                  />
                  <span style={{ position: 'absolute', bottom: '12px', right: '14px',
                    fontSize: '11px', color: 'rgba(187,202,191,0.35)', fontFamily: 'monospace' }}>
                    {jd.trim().split(/\s+/).filter(Boolean).length} / 2000 words
                  </span>
                </div>
                {validationErrors.jd && <ErrorMsg text={validationErrors.jd} />}
              </div>
            </div>
          </div>
        </div>

        {/* ════ RIGHT COLUMN ════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Command Center */}
          <div style={obsidianGlass({ padding: '26px' })}>
            <RimGlow />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#d4e4fa', letterSpacing: '-0.01em', marginBottom: '20px' }}>
                Command Center
              </h3>

              {/* Analysis Depth */}
              <div style={{ marginBottom: '20px' }}>
                <FieldLabel text="Analysis Depth" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  {depthOptions.map(d => (
                    <button
                      key={d.key}
                      onClick={() => setDepth(d.key)}
                      style={{
                        padding: '10px 6px', borderRadius: '10px',
                        fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                        letterSpacing: '0.04em', transition: 'all 0.18s ease',
                        background: depth === d.key ? EMERALD_DIM : 'rgba(255,255,255,0.04)',
                        color:      depth === d.key ? EMERALD    : 'rgba(187,202,191,0.50)',
                        border:     `1px solid ${depth === d.key ? 'rgba(78,222,163,0.30)' : 'rgba(255,255,255,0.07)'}`,
                        boxShadow:  depth === d.key ? `0 0 12px rgba(78,222,163,0.12)` : 'none',
                        minHeight: '40px',
                      }}
                    >{d.label}</button>
                  ))}
                </div>
              </div>

              {/* Signal strength */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '8px' }}>
                  <span style={{ color: 'rgba(187,202,191,0.55)', letterSpacing: '0.06em', fontWeight: 600, textTransform: 'uppercase' }}>Signal Strength</span>
                  <span style={{ color: EMERALD, fontWeight: 700 }}>Optimized</span>
                </div>
                <div style={{ height: '3px', background: 'rgba(255,255,255,0.07)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${signalPct}%`,
                    background: `linear-gradient(90deg, #10b981, ${EMERALD})`,
                    borderRadius: '999px',
                    boxShadow: `0 0 10px ${EMERALD}`,
                    transition: 'width 1.2s cubic-bezier(0.16,1,0.3,1)',
                  }} />
                </div>
              </div>

              {/* CTA */}
              {error && <ErrorMsg text={error} style={{ marginBottom: '16px' }} />}
              <button
                onClick={analyze}
                disabled={loading}
                style={{
                  width: '100%', padding: '16px',
                  background: loading ? 'rgba(78,222,163,0.30)' : `linear-gradient(135deg, ${EMERALD} 0%, #10b981 100%)`,
                  border: 'none', borderRadius: '14px',
                  color: '#003824', fontSize: '14px', fontWeight: 800,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  boxShadow: loading ? 'none' : `0 0 25px ${EMERALD_GLOW}, 0 4px 14px rgba(0,0,0,0.40)`,
                  transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                  letterSpacing: '0.04em',
                  minHeight: '52px',
                }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = `0 0 35px rgba(78,222,163,0.35), 0 6px 20px rgba(0,0,0,0.40)`; }}}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = loading ? 'none' : `0 0 25px ${EMERALD_GLOW}, 0 4px 14px rgba(0,0,0,0.40)`; }}
              >
                {loading ? (
                  <>
                    <Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} />
                    Analyzing profile...
                  </>
                ) : (
                  <>
                    <Zap size={16} fill="#003824" />
                    START COMPARISON
                  </>
                )}
              </button>
              <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>

              <p style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(187,202,191,0.35)',
                marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                <Lock size={11} /> Data processed locally · Est. ~14s
              </p>
            </div>
          </div>

          {/* Live Metadata Stream */}
          <div style={obsidianGlass({ padding: '22px' })}>
            <RimGlow />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: EMERALD, letterSpacing: '0.10em', textTransform: 'uppercase' }}>
                  Live Metadata
                </span>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: EMERALD,
                  display: 'inline-block', boxShadow: `0 0 6px ${EMERALD}`,
                  animation: 'pulse-meta 2s ease-in-out infinite' }} />
                <style>{`@keyframes pulse-meta{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {logs.map((log, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: '10px',
                      padding: '10px 0',
                      borderBottom: i < logs.length - 1 ? '1px solid rgba(78,222,163,0.08)' : 'none',
                      opacity: log.active ? 1 : 0.35,
                      transition: 'opacity 0.4s ease',
                    }}
                  >
                    <span style={{ fontSize: '11px', fontWeight: 700, color: log.active ? EMERALD : 'rgba(187,202,191,0.30)',
                      fontFamily: 'monospace', flexShrink: 0, lineHeight: '18px' }}>
                      {log.time}
                    </span>
                    <span style={{ fontSize: '12px', color: log.active ? 'rgba(212,228,250,0.85)' : 'rgba(187,202,191,0.35)',
                      lineHeight: '18px' }}>
                      {log.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Precision View preview card */}
          <div style={{
            position: 'relative', borderRadius: '16px', height: '140px', overflow: 'hidden',
            border: '1px solid rgba(78,222,163,0.22)',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(135deg, rgba(5,20,36,0.70) 0%, rgba(16,185,129,0.08) 100%)',
              backdropFilter: 'blur(8px)',
            }} />
            {/* Grid pattern overlay */}
            <div style={{
              position: 'absolute', inset: 0, opacity: 0.08,
              backgroundImage: `
                linear-gradient(rgba(78,222,163,0.5) 1px, transparent 1px),
                linear-gradient(90deg, rgba(78,222,163,0.5) 1px, transparent 1px)
              `,
              backgroundSize: '24px 24px',
            }} />
            <div style={{ position: 'absolute', inset: 0, padding: '20px',
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <p style={{ fontSize: '10px', color: EMERALD, fontWeight: 700, letterSpacing: '0.08em',
                textTransform: 'uppercase', marginBottom: '4px' }}>System Optimization</p>
              <h4 style={{ fontSize: '17px', fontWeight: 700, color: '#d4e4fa', letterSpacing: '-0.01em' }}>
                Precision View
              </h4>
            </div>
            {/* Decorative emerald orb */}
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px',
              borderRadius: '50%', background: 'rgba(78,222,163,0.12)', filter: 'blur(30px)', pointerEvents: 'none' }} />
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width:768px){
          .na-grid{grid-template-columns:1fr!important;gap:16px!important}
          .na-form{padding:20px!important}
          .na-title{font-size:24px!important}
          .na-desc{font-size:12px!important}
        }
        @media (max-width:640px){
          .na-grid{padding:12px!important}
          .na-form{padding:16px!important}
          .na-title{font-size:20px!important}
          .na-desc{font-size:11px!important}
          .na-input{width:100%!important;min-width:100%!important}
          .na-btn{width:100%!important}
          .na-toggle{flex-wrap:wrap!important}
        }
        @media (max-width:480px){
          .na-form{padding:14px!important;gap:14px!important}
          .na-title{font-size:18px!important;line-height:1.2!important}
          .na-desc{font-size:10px!important;line-height:1.4!important}
        }
      `}</style>

      {/* ── Result Modal Overlay ── */}
      {showResultModal && modalData && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(5, 7, 12, 0.85)', backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          zIndex: 9999, display: 'flex', alignItems: 'center',
          justifyContent: 'center', transition: 'all 0.3s ease',
          padding: '20px', boxSizing: 'border-box'
        }}>
          <div style={{
            width: '420px', maxWidth: '100%', padding: '32px',
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.6) 100%), rgba(8,16,28,0.95)',
            border: '1px solid rgba(78,222,163,0.3)', borderRadius: '24px',
            boxShadow: '0 30px 70px rgba(0,0,0,0.9), inset 0 1px 1px rgba(255,255,255,0.1)',
            textAlign: 'center', position: 'relative', overflow: 'hidden',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            animation: 'modal-pop 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}>
            {/* radial green glow */}
            <div style={{ position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(78,222,163,0.15)', filter: 'blur(50px)', pointerEvents: 'none' }} />
            
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '8px', zIndex: 1 }}>
              Analysis Complete!
            </h3>
            <p style={{ fontSize: '13px', color: 'rgba(187,202,191,0.6)', marginBottom: '20px', zIndex: 1 }}>
              Role: <span style={{ color: EMERALD, fontWeight: 700 }}>{modalData.role}</span>
            </p>

            {/* Circular Progress Gauge */}
            <div style={{ display: 'inline-flex', position: 'relative', alignItems: 'center', justifyContent: 'center', width: '130px', height: '130px', margin: '0 auto 24px', zIndex: 1 }}>
              <svg style={{ transform: 'rotate(-90deg)', width: '120px', height: '120px' }}>
                <circle cx="60" cy="60" r="50" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="6" fill="transparent" />
                <circle 
                  cx="60" 
                  cy="60" 
                  r="50" 
                  stroke={EMERALD} 
                  strokeWidth="6" 
                  fill="transparent" 
                  strokeDasharray="314.16" 
                  strokeDashoffset={314.16 - (314.16 * animatedPct) / 100}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.05s ease-out' }}
                />
              </svg>
              <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '32px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.03em', textShadow: `0 0 15px rgba(78,222,163,0.4)` }}>
                  {animatedPct}%
                </span>
                <span style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(187,202,191,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '-2px' }}>
                  Match Score
                </span>
              </div>
            </div>

            {/* Present / Missing Skills summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', marginBottom: '28px', textAlign: 'left', zIndex: 1 }}>
              {modalData.present && modalData.present.length > 0 && (
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: EMERALD, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Matched Skills</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {modalData.present.slice(0, 6).map((sk, i) => (
                      <span key={i} style={{ fontSize: '11px', background: 'rgba(78,222,163,0.08)', color: EMERALD, border: '1px solid rgba(78,222,163,0.2)', padding: '3px 8px', borderRadius: '6px' }}>{sk}</span>
                    ))}
                    {modalData.present.length > 6 && <span style={{ fontSize: '11px', color: 'rgba(187,202,191,0.4)', padding: '3px 4px' }}>+{modalData.present.length - 6} more</span>}
                  </div>
                </div>
              )}

              {modalData.missing && modalData.missing.length > 0 && (
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Skill Gaps Identified</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {modalData.missing.slice(0, 6).map((sk, i) => (
                      <span key={i} style={{ fontSize: '11px', background: 'rgba(248,113,113,0.08)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)', padding: '3px 8px', borderRadius: '6px' }}>{sk}</span>
                    ))}
                    {modalData.missing.length > 6 && <span style={{ fontSize: '11px', color: 'rgba(187,202,191,0.4)', padding: '3px 4px' }}>+{modalData.missing.length - 6} more</span>}
                  </div>
                </div>
              )}
            </div>

            {/* CTA */}
            <button
              onClick={() => {
                setShowResultModal(false);
                navigate('/analyses');
              }}
              style={{
                width: '100%', padding: '14px',
                background: `linear-gradient(135deg, ${EMERALD} 0%, #10b981 100%)`,
                border: 'none', borderRadius: '12px',
                color: '#003824', fontSize: '13px', fontWeight: 800,
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '8px', zIndex: 1,
                boxShadow: `0 0 20px rgba(78,222,163,0.25)`
              }}
            >
              View Optimization Report
            </button>
          </div>
          <style>{`
            @keyframes modal-pop {
              from { transform: scale(0.95); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   DROP ZONE
══════════════════════════════════════════════════════ */
function DropZone({ file, dragging, error, onDragOver, onDragLeave, onDrop, onClick, onRemove }) {
  const EMERALD = '#4edea3';

  if (file) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: '14px',
        background: 'rgba(78,222,163,0.08)', border: '1px solid rgba(78,222,163,0.25)',
        borderRadius: '14px', padding: '16px 20px', cursor: 'default',
      }}>
        <div style={{ width: '38px', height: '38px', borderRadius: '10px',
          background: 'rgba(78,222,163,0.12)', border: '1px solid rgba(78,222,163,0.22)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <CheckCircle2 size={20} color={EMERALD} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '13px', fontWeight: 700, color: '#d4e4fa',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</p>
          <p style={{ fontSize: '11px', color: 'rgba(187,202,191,0.50)', marginTop: '2px' }}>
            {(file.size / 1024 / 1024).toFixed(1)} MB · Loaded
          </p>
        </div>
        <button onClick={e => { e.stopPropagation(); onRemove(); }} style={{
          background: 'transparent', border: '1px solid rgba(248,113,113,0.15)',
          borderRadius: '8px', color: 'rgba(248,113,113,0.50)', cursor: 'pointer',
          padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.18s ease',
        }}
          onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.35)'; e.currentTarget.style.background = 'rgba(248,113,113,0.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(248,113,113,0.50)'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.15)'; e.currentTarget.style.background = 'transparent'; }}
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClick}
      style={{
        border: `2px dashed ${error ? '#f87171' : dragging ? EMERALD : 'rgba(78,222,163,0.30)'}`,
        borderRadius: '16px', padding: '40px 24px', textAlign: 'center', cursor: 'pointer',
        background: dragging ? 'rgba(78,222,163,0.06)' : 'transparent',
        transition: 'all 0.22s ease',
      }}
      onMouseEnter={e => { if (!dragging) { e.currentTarget.style.borderColor = 'rgba(78,222,163,0.55)'; e.currentTarget.style.background = 'rgba(78,222,163,0.04)'; }}}
      onMouseLeave={e => { if (!dragging) { e.currentTarget.style.borderColor = error ? '#f87171' : 'rgba(78,222,163,0.30)'; e.currentTarget.style.background = 'transparent'; }}}
    >
      <div style={{ width: '60px', height: '60px', borderRadius: '50%',
        background: 'rgba(78,222,163,0.08)', border: '1px solid rgba(78,222,163,0.18)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
        transition: 'transform 0.22s ease' }}>
        <Upload size={22} color={dragging ? EMERALD : 'rgba(187,202,191,0.40)'} />
      </div>
      <p style={{ fontSize: '15px', fontWeight: 700, color: '#d4e4fa', marginBottom: '6px' }}>
        Drop Resume Package
      </p>
      <p style={{ fontSize: '12px', color: 'rgba(187,202,191,0.50)', marginBottom: '18px' }}>
        PDF only · Max 10MB
      </p>
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        padding: '8px 20px', borderRadius: '10px',
        border: `1px solid rgba(78,222,163,0.35)`, color: EMERALD,
        fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em',
        transition: 'all 0.18s ease',
      }}>
        Browse Files
      </span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   SUB-COMPONENTS
══════════════════════════════════════════════════════ */

function RimGlow() {
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, borderRadius: 'inherit',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 100%)',
        pointerEvents: 'none', zIndex: 0 }} />
      <style>{`@keyframes rim-na{0%,100%{opacity:.35}50%{opacity:1}}`}</style>
      <div style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', padding: '1px',
        background: 'linear-gradient(135deg, rgba(78,222,163,.75) 0%, rgba(78,222,163,0) 40%, rgba(78,222,163,0) 70%, rgba(78,222,163,.60) 100%)',
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor', maskComposite: 'exclude',
        pointerEvents: 'none', animation: 'rim-na 4s ease-in-out infinite', zIndex: 0 }} />
    </>
  );
}

function SectionHeader({ icon, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
      <div style={{ width: '36px', height: '36px', borderRadius: '10px',
        background: 'rgba(78,222,163,0.10)', border: '1px solid rgba(78,222,163,0.20)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#d4e4fa', letterSpacing: '-0.01em' }}>{title}</h3>
    </div>
  );
}

function FieldLabel({ icon, text }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '5px',
      fontSize: '10px', fontWeight: 700, color: 'rgba(187,202,191,0.55)',
      letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
      {icon && <span style={{ color: 'rgba(78,222,163,0.70)' }}>{icon}</span>}
      {text}
    </label>
  );
}

function ErrorMsg({ text }) {
  return (
    <p style={{ color: '#f87171', fontSize: '12px', marginTop: '6px', fontWeight: 500,
      display: 'flex', alignItems: 'center', gap: '4px' }}>
      ⚠ {text}
    </p>
  );
}
