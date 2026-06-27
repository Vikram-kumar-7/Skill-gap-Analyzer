import { useState, useEffect, useRef } from 'react';
import {
  User,
  Database,
  Download,
  Upload,
  AlertTriangle,
  Building2,
  Bell,
  X,
  Plus,
  Check,
  ChevronDown,
} from 'lucide-react';
import { getUser, saveUser, getStorageSize } from '../utils/storage.js';

// ── Constants ─────────────────────────────────────────────────────────────────
const EMERALD = '#4edea3';
const EMERALD_DIM = 'rgba(78,222,163,0.12)';
const EMERALD_GLOW = 'rgba(78,222,163,0.20)';

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

const SectionTitle = ({ icon: Icon, title, accent = EMERALD }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
    <div
      style={{
        width: 38,
        height: 38,
        borderRadius: 10,
        background: `${accent}22`,
        border: `1px solid ${accent}44`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: `0 0 12px ${accent}33`,
      }}
    >
      <Icon size={16} color={accent} />
    </div>
    <span style={{ fontSize: '16px', fontWeight: 800, color: '#d4e4fa', letterSpacing: '-0.01em' }}>{title}</span>
  </div>
);

const Divider = () => (
  <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(78,222,163,0.2), transparent)', margin: '16px 0' }} />
);

const Label = ({ children }) => (
  <div
    style={{
      fontSize: '11px',
      fontWeight: 700,
      color: 'rgba(187,202,191,0.45)',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      marginBottom: '8px',
    }}
  >
    {children}
  </div>
);

const ToggleRow = ({ label, description, checked, onChange, accent = EMERALD }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '14px 0',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
    }}
  >
    <div style={{ flex: 1, minWidth: 0, marginRight: 16 }}>
      <div style={{ fontSize: '14px', color: '#d4e4fa', fontWeight: 500 }}>{label}</div>
      {description && (
        <div style={{ fontSize: '12px', color: 'rgba(187,202,191,0.40)', marginTop: '3px' }}>
          {description}
        </div>
      )}
    </div>
    <label className="toggle-switch" style={{ flexShrink: 0 }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle-slider" />
    </label>
  </div>
);

const InputField = ({ label, value, onChange, placeholder, type = 'text', accent = EMERALD }) => (
  <div style={{ minWidth: 0 }}>
    <Label>{label}</Label>
    <input
      type={type}
      style={{
        width: '100%',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: '10px',
        padding: '12px 14px',
        color: '#d4e4fa',
        fontSize: '13px',
        fontFamily: 'inherit',
        outline: 'none',
        boxSizing: 'border-box',
        minHeight: '44px',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
      }}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      onFocus={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.boxShadow = `0 0 0 3px ${accent}26`; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
      onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
    />
  </div>
);

const SelectField = ({ label, value, onChange, options, accent = EMERALD }) => (
  <div style={{ minWidth: 0 }}>
    <Label>{label}</Label>
    <div style={{ position: 'relative' }}>
      <select
        value={value}
        onChange={onChange}
        style={{
          width: '100%',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: '10px',
          padding: '12px 40px 12px 14px',
          color: '#d4e4fa',
          fontSize: '13px',
          fontFamily: 'inherit',
          outline: 'none',
          boxSizing: 'border-box',
          minHeight: '44px',
          appearance: 'none',
          cursor: 'pointer',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
        }}
        onFocus={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.boxShadow = `0 0 0 3px ${accent}26`; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
        onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
      >
        {options.map((e) => (
          <option key={e} value={e}>{e}</option>
        ))}
      </select>
      <ChevronDown
        size={14}
        style={{
          position: 'absolute',
          right: 14,
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'rgba(187,202,191,0.35)',
          pointerEvents: 'none',
        }}
      />
    </div>
  </div>
);

const CompanyChip = ({ name, onRemove, accent = '#06b6d4' }) => (
  <div
    key={name}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      background: `${accent}1A`,
      border: `1px solid ${accent}40`,
      borderRadius: '9999px',
      padding: '6px 12px 6px 14px',
      fontSize: '12px',
      color: accent,
      fontWeight: 600,
    }}
  >
    {name}
    <button
      onClick={() => onRemove(name)}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: `${accent}99`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2px',
        borderRadius: '50%',
        width: '18px',
        height: '18px',
        transition: 'color 0.15s, background 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.color = accent; e.currentTarget.style.background = `${accent}1A`; }}
      onMouseLeave={e => { e.currentTarget.style.color = `${accent}99`; e.currentTarget.style.background = 'none'; }}
      aria-label={`Remove ${name}`}
    >
      <X size={12} />
    </button>
  </div>
);

// ── Main Component ─────────────────────────────────────────────────────────────
export default function SettingsPage() {
  // Profile
  const [form, setForm] = useState(() => {
    const u = getUser() || {};
    return {
      name: u.name || '',
      course: u.course || '',
      targetRole: u.targetRole || '',
      experience: u.experience || 'Fresher',
      location: u.location || '',
      email: u.email || '',
    };
  });
  const [saved, setSaved] = useState(false);

  // Target Companies
  const [companies, setCompanies] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sga_target_companies') || '[]');
    } catch {
      return [];
    }
  });
  const [companyInput, setCompanyInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const companyRef = useRef(null);

  // Notifications
  const [notifs, setNotifs] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem('sga_notifs') ||
          JSON.stringify({
            weeklyReport: true,
            goalReminders: true,
            newFeatures: false,
            skillTips: true,
          })
      );
    } catch {
      return { weeklyReport: true, goalReminders: true, newFeatures: false, skillTips: true };
    }
  });

  // Storage
  const [storageB, setStorageB] = useState(() => getStorageSize());

  // ── Persistence & Effects ──────────────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem('sga_target_companies', JSON.stringify(companies));
  }, [companies]);

  useEffect(() => {
    localStorage.setItem('sga_notifs', JSON.stringify(notifs));
  }, [notifs]);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e) => {
      if (companyRef.current && !companyRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const save = () => {
    const u = getUser() || {};
    saveUser({ ...u, ...form });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setStorageB(getStorageSize());
  };

  const addCompany = (name) => {
    const trimmed = name.trim();
    if (!trimmed || companies.includes(trimmed)) return;
    setCompanies((prev) => [...prev, trimmed]);
    setCompanyInput('');
    setShowSuggestions(false);
  };

  const removeCompany = (name) => setCompanies((prev) => prev.filter((c) => c !== name));

  const SUGGESTED_COMPANIES = [
    'Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix',
    'Tesla', 'Uber', 'Stripe', 'Atlassian', 'Adobe', 'Salesforce',
    'Oracle', 'IBM', 'Intel', 'Cisco', 'Spotify', 'Twitter',
    'LinkedIn', 'Pinterest', 'Airbnb', 'Shopify', 'Reddit', 'Palantir',
  ];

  const EXP_LEVELS = [
    'Fresher', '1 year', '2 years', '3 years', '4 years',
    '5 years', '6-10 years', '10+ years',
  ];

  const filteredSuggestions = SUGGESTED_COMPANIES.filter(
    (c) =>
      c.toLowerCase().includes(companyInput.toLowerCase()) &&
      !companies.includes(c)
  );

  const isAppKey = (key) =>
    key.startsWith('sga_') || key.startsWith('sg_') || key === 'skillgap_history';

  const exportData = () => {
    const data = {};
    for (const key of Object.keys(localStorage)) {
      if (isAppKey(key)) data[key] = JSON.parse(localStorage.getItem(key) || 'null');
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'skillgap-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        for (const [key, val] of Object.entries(data)) {
          if (isAppKey(key)) localStorage.setItem(key, JSON.stringify(val));
        }
        window.dispatchEvent(new Event('storage'));
        alert('Data imported successfully! Refresh to see changes.');
      } catch {
        alert('Invalid backup file.');
      }
    };
    reader.readAsText(file);
  };

  const fullReset = () => {
    if (!confirm('This will delete ALL your data. Are you absolutely sure?')) return;
    for (const key of Object.keys(localStorage)) {
      if (isAppKey(key)) localStorage.removeItem(key);
    }
    window.dispatchEvent(new Event('storage'));
    window.location.reload();
  };

  // ── Derived ──────────────────────────────────────────────────────────────────
  const storageKB = Math.round(storageB / 1024);

  const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '10px',
    padding: '12px 14px',
    color: '#d4e4fa',
    fontSize: '13px',
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
    minHeight: '44px',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
  };

  const focusHandler = (e) => {
    e.currentTarget.style.borderColor = EMERALD;
    e.currentTarget.style.boxShadow = `0 0 0 3px ${EMERALD_DIM}`;
    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
  };

  const blurHandler = (e) => {
    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)';
    e.currentTarget.style.boxShadow = 'none';
    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
  };
  const storageMax = 5 * 1024;
  const storagePct = Math.min(100, (storageKB / storageMax) * 100);

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', width: '100%', padding: '24px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* ── Section 1: Profile ─────────────────────────────────────── */}
      <div style={glassCard({ padding: '20px' })}>
        <SectionTitle icon={User} title="Profile" />
        <Divider />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
          }}
        >
          {[
            ['Name', form.name, (v) => setForm((f) => ({ ...f, name: v })), 'Your full name'],
            ['Course', form.course, (v) => setForm((f) => ({ ...f, course: v })), 'e.g. B.Tech CSE'],
            ['Target Role', form.targetRole, (v) => setForm((f) => ({ ...f, targetRole: v })), 'e.g. Full Stack Dev'],
            ['Location', form.location, (v) => setForm((f) => ({ ...f, location: v })), 'e.g. Bangalore'],
          ].map(([label, val, onChange, ph]) => (
            <div key={label}>
              <Label>{label}</Label>
              <input
                style={inputStyle}
                value={val}
                placeholder={ph}
                onChange={(e) => onChange(e.target.value)}
                onFocus={focusHandler}
                onBlur={blurHandler}
              />
            </div>
          ))}

          <div>
            <Label>Experience Level</Label>
            <div style={{ position: 'relative' }}>
              <select
                value={form.experience}
                onChange={(e) => setForm((f) => ({ ...f, experience: e.target.value }))}
                style={{ ...inputStyle, appearance: 'none', paddingRight: '36px', cursor: 'pointer' }}
                onFocus={focusHandler}
                onBlur={blurHandler}
              >
                {EXP_LEVELS.map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
              <ChevronDown
                size={14}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'rgba(255,255,255,0.35)',
                  pointerEvents: 'none',
                }}
              />
            </div>
          </div>
        </div>

        <div style={{ marginTop: '12px' }}>
          <Label>Email</Label>
          <input
            style={inputStyle}
            value={form.email}
            type="email"
            placeholder="your@email.com"
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            onFocus={focusHandler}
            onBlur={blurHandler}
          />
        </div>

        <button
          onClick={save}
          className="btn-primary"
          style={{
            marginTop: '16px',
            padding: '11px 24px',
            borderRadius: '9px',
            fontSize: '13px',
            minHeight: '44px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          {saved ? <><Check size={14} /> Saved!</> : 'Save Profile'}
        </button>
      </div>

      {/* ── Section 2: Target Companies ────────────────────────────── */}
      <div style={glassCard({ padding: '20px', overflow: 'visible' })}>
        <SectionTitle icon={Building2} title="Target Companies" accent="#06b6d4" />
        <Divider />

        {/* Added company chips */}
        {companies.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
            {companies.map((c) => (
              <div
                key={c}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: 'rgba(6,182,212,0.1)',
                  border: '1px solid rgba(6,182,212,0.25)',
                  borderRadius: '9999px',
                  padding: '5px 10px 5px 12px',
                  fontSize: '12px',
                  color: '#06b6d4',
                  fontWeight: 500,
                }}
              >
                {c}
                <button
                  onClick={() => removeCompany(c)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'rgba(6,182,212,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1px',
                    borderRadius: '50%',
                    width: '16px',
                    height: '16px',
                  }}
                  aria-label={`Remove ${c}`}
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input with autocomplete */}
        <div ref={companyRef} style={{ position: 'relative' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                style={{ ...inputStyle, paddingRight: '16px' }}
                value={companyInput}
                placeholder="Add a company (e.g. Google)"
                onChange={(e) => {
                  setCompanyInput(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addCompany(companyInput);
                  if (e.key === 'Escape') setShowSuggestions(false);
                }}
              />
            </div>
            <button
              onClick={() => addCompany(companyInput)}
              className="btn-primary"
              style={{
                padding: '0 16px',
                minHeight: '44px',
                borderRadius: '9px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '13px',
                flexShrink: 0,
              }}
            >
              <Plus size={14} /> Add
            </button>
          </div>

          {/* Suggestions dropdown */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                right: '60px',
                background: '#141d2e',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                overflow: 'hidden',
                zIndex: 50,
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              }}
            >
              {filteredSuggestions.slice(0, 6).map((c) => (
                <button
                  key={c}
                  onClick={() => addCompany(c)}
                  style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: '13px',
                    padding: '10px 14px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'inherit',
                    transition: 'background 0.1s',
                    display: 'block',
                  }}
                  onMouseEnter={(e) => (e.target.style.background = 'rgba(255,255,255,0.05)')}
                  onMouseLeave={(e) => (e.target.style.background = 'none')}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        {companies.length === 0 && (
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', marginTop: '8px' }}>
            Add companies you're preparing for to focus your skill gap analysis.
          </div>
        )}
      </div>

      {/* ── Section 3: Notifications ───────────────────────────────── */}
      <div style={glassCard({ padding: '20px' })}>
        <SectionTitle icon={Bell} title="Notifications" accent="#fbbf24" />
        <Divider />
        <div style={{ marginBottom: '-1px' }}>
          <ToggleRow
            label="Weekly Progress Report"
            description="A summary of your skill progress every Monday"
            checked={notifs.weeklyReport}
            onChange={(v) => setNotifs((n) => ({ ...n, weeklyReport: v }))}
          />
          <ToggleRow
            label="Goal Reminders"
            description="Reminders when you're behind on your learning goals"
            checked={notifs.goalReminders}
            onChange={(v) => setNotifs((n) => ({ ...n, goalReminders: v }))}
          />
          <ToggleRow
            label="Skill Tips"
            description="Daily bite-sized tips to improve faster"
            checked={notifs.skillTips}
            onChange={(v) => setNotifs((n) => ({ ...n, skillTips: v }))}
          />
          <ToggleRow
            label="New Features"
            description="Be the first to know about new app features"
            checked={notifs.newFeatures}
            onChange={(v) => setNotifs((n) => ({ ...n, newFeatures: v }))}
          />
        </div>
      </div>



      {/* ── Section 6: Data Management ─────────────────────────────── */}
      <div style={glassCard({ padding: '20px' })}>
        <SectionTitle icon={Database} title="Data & Privacy" accent="#10b981" />
        <Divider />

        {/* Storage bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
          }}
        >
          <span style={{ fontSize: '13px', color: 'white' }}>Storage Usage</span>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
            {storageKB} KB / 5 MB
          </span>
        </div>
        <div className="progress-track" style={{ marginBottom: '4px' }}>
          <div
            className="progress-fill"
            style={{
              width: `${storagePct}%`,
              background: storagePct > 80
                ? 'linear-gradient(90deg, #f87171, #ef4444)'
                : 'linear-gradient(90deg, #10b981, #6366f1)',
            }}
          />
        </div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginBottom: '14px' }}>
          {storagePct < 1 ? 'No data stored yet.' : `${storagePct.toFixed(1)}% used`}
        </div>

        {/* Export / Import */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={exportData}
            className="btn-outline"
            style={{
              padding: '10px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '13px',
              minHeight: '44px',
              borderRadius: '9px',
            }}
          >
            <Download size={14} /> Export All Data
          </button>
          <label
            className="btn-outline"
            style={{
              padding: '10px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '13px',
              cursor: 'pointer',
              borderRadius: '9px',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.5)',
              minHeight: '44px',
            }}
          >
            <Upload size={14} /> Import Data
            <input type="file" accept=".json" style={{ display: 'none' }} onChange={importData} />
          </label>
        </div>

        {/* Danger zone */}
        <div
          style={{
            marginTop: '16px',
            borderTop: '1px solid rgba(248,113,113,0.15)',
            paddingTop: '16px',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              color: 'rgba(255,255,255,0.35)',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: 600,
            }}
          >
            <AlertTriangle size={11} color="#f87171" /> Danger Zone
          </div>
          <button
            onClick={fullReset}
            style={{
              background: 'rgba(248,113,113,0.08)',
              border: '1px solid rgba(248,113,113,0.2)',
              color: '#f87171',
              borderRadius: '9px',
              padding: '11px 18px',
              fontSize: '13px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(248,113,113,0.15)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(248,113,113,0.08)')}
          >
            <AlertTriangle size={14} /> Full Reset — Delete All Data
          </button>
        </div>
      </div>

      {/* Bottom padding for mobile scroll */}
      <div style={{ height: '24px' }} />
      <style>{`
        @media (max-width:768px){
          .set-card{padding:16px!important}
          .set-grid{gridTemplateColumns:1fr!important;gap:10px!important}
          .set-title{font-size:18px!important}
          .set-input{width:100%!important;padding:10px 12px!important;font-size:12px!important}
        }
        @media (max-width:640px){
          .set-card{padding:12px!important;border-radius:12px!important}
          .set-section{padding:16px!important;gap:12px!important}
          .set-title{font-size:16px!important;line-height:1.2!important}
          .set-btn{width:100%!important;padding:8px 12px!important;font-size:11px!important}
          .set-chips{gap:6px!important;flex-wrap:wrap!important}
        }
        @media (max-width:480px){
          .set-card{padding:10px!important;gap:8px!important}
          .set-section{padding:12px!important}
          .set-title{font-size:14px!important}
        }
      `}</style>
    </div>
  );
}
