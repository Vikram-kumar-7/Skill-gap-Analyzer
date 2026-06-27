import { useState, useEffect, useRef } from 'react';
import {
  User,
  Zap,
  Database,
  Download,
  Upload,
  AlertTriangle,
  Building2,
  Bell,
  Sun,
  Moon,
  Monitor,
  X,
  Plus,
  Check,
  ChevronDown,
} from 'lucide-react';
import { getUser, saveUser, getStorageSize } from '../utils/storage.js';

// ── Constants ─────────────────────────────────────────────────────────────────
const EXP_LEVELS = ['Fresher', '0-1 yr', '1-3 yr', '3-5 yr', '5+ yr'];

const SUGGESTED_COMPANIES = [
  'Google', 'Microsoft', 'Amazon', 'Meta', 'Apple',
  'Netflix', 'Adobe', 'Salesforce', 'Flipkart', 'Infosys',
  'TCS', 'Wipro', 'HCL', 'Accenture', 'Deloitte',
  'Goldman Sachs', 'JPMorgan', 'Uber', 'Stripe', 'Atlassian',
];

const THEME_OPTIONS = [
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'system', label: 'System', icon: Monitor },
  { id: 'light', label: 'Light', icon: Sun },
];

// eslint-disable-next-line no-unused-vars
const SectionTitle = ({ icon: Icon, title, accent = '#6366f1' }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
    <div
      style={{
        width: 30,
        height: 30,
        borderRadius: 8,
        background: `${accent}22`,
        border: `1px solid ${accent}44`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Icon size={14} color={accent} />
    </div>
    <span style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>{title}</span>
  </div>
);

const Divider = () => (
  <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '16px 0' }} />
);

const Label = ({ children }) => (
  <div
    style={{
      fontSize: '11px',
      fontWeight: 600,
      color: 'rgba(255,255,255,0.3)',
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      marginBottom: '6px',
    }}
  >
    {children}
  </div>
);

const ToggleRow = ({ label, description, checked, onChange }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 0',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
    }}
  >
    <div style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
      <div style={{ fontSize: '13px', color: 'white', fontWeight: 500 }}>{label}</div>
      {description && (
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>
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

  // AI
  const [aiEnabled, setAiEnabled] = useState(
    () => localStorage.getItem('sga_ai_enabled') === 'true'
  );

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

  // Theme
  const [theme, setTheme] = useState(() => localStorage.getItem('sga_theme') || 'dark');

  // Storage
  const [storageB, setStorageB] = useState(() => getStorageSize());

  // ── Persistence ──────────────────────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem('sga_ai_enabled', String(aiEnabled));
  }, [aiEnabled]);

  useEffect(() => {
    localStorage.setItem('sga_target_companies', JSON.stringify(companies));
  }, [companies]);

  useEffect(() => {
    localStorage.setItem('sga_notifs', JSON.stringify(notifs));
  }, [notifs]);

  useEffect(() => {
    localStorage.setItem('sga_theme', theme);
    // Apply theme class to root (extend later with actual theme switching)
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

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
  const storageMax = 5 * 1024;
  const storagePct = Math.min(100, (storageKB / storageMax) * 100);

  // ── Styles ───────────────────────────────────────────────────────────────────
  const cardStyle = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '14px',
  };

  const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '9px',
    padding: '10px 13px',
    color: 'white',
    fontSize: '13px',
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
    minHeight: '44px',
    transition: 'border-color 0.15s',
  };

  const focusHandler = (e) => (e.target.style.borderColor = '#6366f1');
  const blurHandler = (e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)');

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column' }}>

      {/* ── Section 1: Profile ─────────────────────────────────────── */}
      <div style={cardStyle}>
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
      <div style={cardStyle}>
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
      <div style={cardStyle}>
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

      {/* ── Section 4: Theme ───────────────────────────────────────── */}
      <div style={cardStyle}>
        <SectionTitle icon={Sun} title="Appearance" accent="#a5b4fc" />
        <Divider />
        <Label>Theme</Label>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
          }}
        >
          {THEME_OPTIONS.map(({ id, label, icon }) => {
            const active = theme === id;
            const Icon = icon;
            return (
              <button
                key={id}
                onClick={() => setTheme(id)}
                style={{
                  background: active ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
                  border: active
                    ? '1px solid rgba(99,102,241,0.5)'
                    : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  padding: '12px 8px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '7px',
                  color: active ? '#a5b4fc' : 'rgba(255,255,255,0.4)',
                  fontFamily: 'inherit',
                  fontSize: '12px',
                  fontWeight: active ? 600 : 400,
                  transition: 'all 0.15s',
                  minHeight: '72px',
                }}
              >
                <Icon size={18} />
                {label}
                {active && (
                  <div
                    style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      background: '#6366f1',
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
        <div
          style={{
            marginTop: '10px',
            fontSize: '11px',
            color: 'rgba(255,255,255,0.25)',
          }}
        >
          Full light mode coming soon. Dark mode is the primary experience.
        </div>
      </div>

      {/* ── Section 5: AI Settings ─────────────────────────────────── */}
      <div style={cardStyle}>
        <SectionTitle icon={Zap} title="AI Settings" accent="#8b5cf6" />
        <Divider />
        <ToggleRow
          label="AI Mode"
          description="Uses GPT-4o-mini. No key = rule-based fallback."
          checked={aiEnabled}
          onChange={setAiEnabled}
        />
        {aiEnabled && (
          <div style={{ marginTop: '14px', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'rgba(139,92,246,0.08)',
                border: '1px solid rgba(139,92,246,0.2)',
                borderRadius: '8px',
                padding: '12px 14px',
              }}
            >
              <Zap size={14} color="#a78bfa" style={{ flexShrink: 0 }} />
              <span>
                AI features are run securely via the application backend. No client-side API key configuration is required.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Section 6: Data Management ─────────────────────────────── */}
      <div style={cardStyle}>
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
    </div>
  );
}
