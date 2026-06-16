import { useState, useEffect } from 'react';
import {
  User,
  Zap,
  Database,
  Info,
  Eye,
  EyeOff,
  Download,
  Upload,
  AlertTriangle,
} from 'lucide-react';
import { getUser, saveUser, getStorageSize } from '../utils/storage.js';

const EXP_LEVELS = ['Fresher', '0-1 yr', '1-3 yr', '3-5 yr', '5+ yr'];

export default function SettingsPage() {
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
  const [aiEnabled, setAiEnabled] = useState(
    () => localStorage.getItem('sga_ai_enabled') === 'true'
  );
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('sga_api_key') || '');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [storageB, setStorageB] = useState(() => getStorageSize());

  const save = () => {
    const u = getUser() || {};
    saveUser({ ...u, ...form });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setStorageB(getStorageSize());
  };

  const saveAI = () => {
    localStorage.setItem('sga_ai_enabled', String(aiEnabled));
    localStorage.setItem('sga_api_key', apiKey);
  };

  useEffect(() => {
    saveAI();
  }, [aiEnabled, apiKey]);

  const isAppKey = (key) => key.startsWith('sga_') || key.startsWith('sg_') || key === 'skillgap_history';

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

  const storageKB = Math.round(storageB / 1024);
  const storageMax = 5 * 1024; // 5MB in KB
  const storagePct = Math.min(100, (storageKB / storageMax) * 100);

  const cardStyle = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    padding: '24px',
    marginBottom: '16px',
    overflow: 'hidden',
  };

  const inp = (val, onChange, placeholder = '') => ({
    style: {
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
      minHeight: '44px', // ensure 44px tap target
    },
    value: val,
    onChange,
    placeholder,
    onFocus: (e) => (e.target.style.borderColor = '#6366f1'),
    onBlur: (e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)'),
  });

  const SectionTitle = ({ icon: Icon, title }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0' }}>
      <Icon size={16} color="#6366f1" />
      <span style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>{title}</span>
    </div>
  );

  const Label = ({ children }) => (
    <div
      style={{
        fontSize: '11px',
        fontWeight: 500,
        color: 'rgba(255,255,255,0.3)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: '5px',
      }}
    >
      {children}
    </div>
  );

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
      {/* Section 1: Profile */}
      <div style={cardStyle}>
        <SectionTitle icon={User} title="Profile" />
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '16px 0' }} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            ['Name', form.name, (v) => setForm((f) => ({ ...f, name: v })), 'Your full name'],
            [
              'Course',
              form.course,
              (v) => setForm((f) => ({ ...f, course: v })),
              'e.g. B.Tech CSE',
            ],
            [
              'Target Role',
              form.targetRole,
              (v) => setForm((f) => ({ ...f, targetRole: v })),
              'e.g. Full Stack Dev',
            ],
            [
              'Location',
              form.location,
              (v) => setForm((f) => ({ ...f, location: v })),
              'e.g. Bangalore',
            ],
          ].map(([label, val, onChange, ph]) => (
            <div key={label}>
              <Label>{label}</Label>
              <input {...inp(val, (e) => onChange(e.target.value), ph)} />
            </div>
          ))}
          <div>
            <Label>Experience Level</Label>
            <select
              value={form.experience}
              onChange={(e) => setForm((f) => ({ ...f, experience: e.target.value }))}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '9px',
                padding: '9px 13px',
                color: 'white',
                fontSize: '13px',
                fontFamily: 'inherit',
                outline: 'none',
                minHeight: '44px', // ensure 44px tap target
              }}
            >
              {EXP_LEVELS.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ marginTop: '14px' }}>
          <Label>Email</Label>
          <input
            {...inp(
              form.email,
              (e) => setForm((f) => ({ ...f, email: e.target.value })),
              'your@email.com'
            )}
          />
        </div>
        <button
          onClick={save}
          className="btn-primary"
          style={{
            marginTop: '16px',
            padding: '12px 24px',
            borderRadius: '9px',
            fontSize: '13px',
            minHeight: '44px',
          }}
        >
          {saved ? '✓ Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Section 2: AI Settings */}
      <div style={cardStyle}>
        <SectionTitle icon={Zap} title="AI Settings" />
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '16px 0' }} />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '4px 0',
          }}
        >
          <div style={{ flex: 1, minWidth: 0, marginRight: '12px' }}>
            <div style={{ fontSize: '13px', color: 'white', fontWeight: 500 }}>AI Mode</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
              Uses GPT-4o-mini. No key = rule-based fallback.
            </div>
          </div>
          <label className="toggle-switch" style={{ flexShrink: 0 }}>
            <input
              type="checkbox"
              checked={aiEnabled}
              onChange={(e) => setAiEnabled(e.target.checked)}
            />
            <span className="toggle-slider" />
          </label>
        </div>
        {aiEnabled && (
          <div style={{ marginTop: '14px' }}>
            <Label>OpenAI API Key</Label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '9px',
                  padding: '10px 44px 10px 13px',
                  color: 'white',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  boxSizing: 'border-box',
                  minHeight: '44px',
                }}
              />
              <button
                onClick={() => setShowKey((s) => !s)}
                style={{
                  position: 'absolute',
                  right: '0px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'rgba(255,255,255,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '44px',
                  height: '44px',
                }}
              >
                {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Section 3: Data Management */}
      <div style={cardStyle}>
        <SectionTitle icon={Database} title="Data Management" />
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '16px 0' }} />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '6px',
          }}
        >
          <span style={{ fontSize: '13px', color: 'white' }}>Storage Usage</span>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
            {storageKB}KB / 5MB
          </span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${storagePct}%` }} />
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '14px' }}>
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
              fontSize: '12px',
              color: 'rgba(255,255,255,0.35)',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <AlertTriangle size={12} color="#f87171" /> Danger Zone
          </div>
          <button
            onClick={fullReset}
            style={{
              background: 'rgba(248,113,113,0.1)',
              border: '1px solid rgba(248,113,113,0.2)',
              color: '#f87171',
              borderRadius: '9px',
              padding: '12px 16px',
              fontSize: '12px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              minHeight: '44px',
            }}
          >
            Full Reset — Delete All Data
          </button>
        </div>
      </div>

    </div>
  );
}
