import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { saveAnalysis, addActivity, getUser } from '../utils/storage.js';
import { runAnalysis } from '../utils/analysisEngine.js';

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

export default function NewAnalysisPage() {
  const navigate = useNavigate();
  const user = getUser() || {};
  const fileRef = useRef(null);

  const [mode, setMode] = useState('text'); // 'pdf' | 'text'
  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [jd, setJd] = useState('');
  const [role, setRole] = useState(user.targetRole || ROLES[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);

  const handleFile = (f) => {
    if (!f) return;
    if (f.type !== 'application/pdf') {
      setError('Please upload a PDF file.');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('File too large. Max 10MB.');
      return;
    }
    setFile(f);
    setError('');
    // Read as text for processing (PDF text extraction in browser — best effort)
    const reader = new FileReader();
    reader.onload = (e) => setResumeText(e.target.result || '');
    reader.readAsText(f);
  };

  const analyze = async () => {
    const resume = resumeText.trim();
    const jdText = jd.trim();
    if (!resume) {
      setError('Please provide your resume text or upload a PDF.');
      return;
    }
    if (!jdText) {
      setError('Please paste the job description.');
      return;
    }
    setError('');
    setLoading(true);

    await new Promise((r) => setTimeout(r, 600)); // UX pause

    const result = runAnalysis({ resumeText: resume, jobDescription: jdText, targetRole: role });
    saveAnalysis(result);
    addActivity(`Analyzed for ${role} — ${result.matchPct}% match`);
    setLoading(false);
    navigate('/analyses');
  };

  const cardStyle = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
    overflow: 'hidden',
  };

  return (
    <div
      style={{
        maxWidth: '760px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      {/* Header */}
      <div style={{ ...cardStyle, textAlign: 'center' }}>
        <div style={{ fontSize: '20px', fontWeight: 700, color: 'white' }}>
          Analyze Your Skill Gap
        </div>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', marginTop: '6px' }}>
          Upload your resume and paste a job description to get started
        </div>
      </div>

      {/* Mode toggle */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            display: 'flex',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '10px',
            padding: '4px',
            gap: '4px',
          }}
        >
          {[
            ['pdf', 'Upload PDF'],
            ['text', 'Paste Text'],
          ].map(([m, label]) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                padding: '7px 18px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                background: mode === m ? '#6366f1' : 'transparent',
                color: mode === m ? 'white' : 'rgba(255,255,255,0.5)',
                fontSize: '13px',
                fontWeight: mode === m ? 600 : 400,
                fontFamily: 'inherit',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Resume section */}
      <div style={cardStyle}>
        <div className="label">Your Resume</div>
        {mode === 'pdf' ? (
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              handleFile(e.dataTransfer.files[0]);
            }}
            style={{
              border: `2px dashed ${dragging ? '#6366f1' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: '12px',
              padding: '40px 32px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'border-color 0.15s',
              background: dragging ? 'rgba(99,102,241,0.05)' : 'transparent',
            }}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".pdf"
              style={{ display: 'none' }}
              onChange={(e) => handleFile(e.target.files[0])}
            />
            {file ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                }}
              >
                <CheckCircle size={20} color="#10b981" />
                <span style={{ fontSize: '13px', color: 'white', fontWeight: 600 }}>
                  {file.name}
                </span>
              </div>
            ) : (
              <>
                <Upload size={32} color="rgba(255,255,255,0.2)" style={{ margin: '0 auto 12px' }} />
                <div style={{ fontSize: '13px', color: 'white', fontWeight: 500 }}>
                  Drag & drop your PDF resume
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '6px' }}>
                  or click to browse · PDF only · Max 10MB
                </div>
              </>
            )}
          </div>
        ) : (
          <textarea
            className="inp"
            style={{ minHeight: '160px', resize: 'vertical' }}
            placeholder="Paste your resume text here..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
          />
        )}
      </div>

      {/* JD section */}
      <div style={cardStyle}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
          }}
        >
          <div className="label" style={{ margin: 0 }}>
            Job Description
          </div>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>
            {jd.length} chars
          </span>
        </div>
        <textarea
          className="inp"
          style={{ minHeight: '200px', resize: 'vertical' }}
          placeholder="Paste the full job description here..."
          value={jd}
          onChange={(e) => setJd(e.target.value)}
        />
      </div>

      {/* Target role */}
      <div style={cardStyle}>
        <div className="label">Target Benchmark Role</div>
        <select className="inp" value={role} onChange={(e) => setRole(e.target.value)}>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div
          style={{
            background: 'rgba(248,113,113,0.1)',
            border: '1px solid rgba(248,113,113,0.25)',
            borderRadius: '10px',
            padding: '12px 16px',
            color: '#f87171',
            fontSize: '13px',
          }}
        >
          {error}
        </div>
      )}

      {/* Analyze button */}
      <button
        onClick={analyze}
        disabled={loading}
        className="btn-primary"
        style={{
          width: '100%',
          height: '48px',
          fontSize: '15px',
          fontWeight: 700,
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? (
          <>
            <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
            Analyzing your profile...
          </>
        ) : (
          '⚡ Analyze My Skill Gap'
        )}
      </button>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}
