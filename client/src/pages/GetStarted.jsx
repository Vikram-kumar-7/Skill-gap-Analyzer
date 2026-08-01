import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";

export default function GetStarted() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", course: "", targetRole: "" });
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    localStorage.removeItem('sga_logged_out');
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
        queryParams: {
          prompt: 'select_account',
        },
      },
    });
  };

  const handleGitHubLogin = async () => {
    localStorage.removeItem('sga_logged_out');
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/`,
        scopes: 'read:user public_repo',
        queryParams: {
          prompt: 'consent',
        },
      },
    });
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  const handleContinue = () => {
    if (!form.name.trim() || !form.course.trim() || !form.targetRole.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    localStorage.removeItem("sga_logged_out");
    localStorage.setItem("sga_user", JSON.stringify({ ...form, onboardingTemp: true }));
    window.dispatchEvent(new Event("storage"));
    navigate("/save-progress");
  };

  const handleSkip = () => {
    if (!form.name.trim() || !form.course.trim() || !form.targetRole.trim()) {
      setError("Please fill in all fields first.");
      return;
    }
    setError("");
    localStorage.removeItem("sga_logged_out");
    localStorage.setItem("sga_user", JSON.stringify({ ...form, createdAt: Date.now() }));
    window.dispatchEvent(new Event("storage"));
  };

  const fields = [
    { name: "name",       icon: "person",        label: "YOUR NAME",    placeholder: "e.g. Vikram Kumar" },
    { name: "course",     icon: "menu_book",     label: "COURSE",       placeholder: "e.g. B.Tech CSE" },
    { name: "targetRole", icon: "track_changes", label: "TARGET ROLE",  placeholder: "e.g. Backend Developer" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Inter:wght@100..900&family=JetBrains+Mono:wght@100..900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        .material-symbols-outlined {
          font-family: 'Material Symbols Outlined';
          font-weight: normal;
          font-style: normal;
          font-size: 20px;
          line-height: 1;
          letter-spacing: normal;
          text-transform: none;
          display: inline-block;
          white-space: nowrap;
          word-wrap: normal;
          direction: ltr;
          font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
          -webkit-font-smoothing: antialiased;
          user-select: none;
        }

        .gs-root {
          height: 100vh;
          width: 100%;
          background-color: #05070A;
          color: #d4e4fa;
          font-family: 'Inter', sans-serif;
          overflow-x: hidden;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          /* NO justify-content:center — it clips overflow upward */
          padding: 40px 16px 48px;
          box-sizing: border-box;
          position: relative;
        }
        /* Push content to vertical center only when viewport is tall enough */
        .gs-spacer {
          flex: 1;
          min-height: 20px;
          max-height: 80px;
        }
        @media (min-width: 768px) {
          .gs-root { padding: 48px 32px 56px; }
        }

        /* Background glows */
        .gs-glow {
          position: fixed;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          filter: blur(60px);
          pointer-events: none;
          z-index: 0;
          background: radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%);
          animation: gs-pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes gs-pulse {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50%       { opacity: 0.25; transform: scale(1.08); }
        }

        /* Card */
        .gs-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 480px;
          border-radius: 1.25rem;
          padding: 28px 24px 32px;
          box-sizing: border-box;
          background: rgba(13, 28, 45, 0.5);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.06),
                      0 24px 48px -12px rgba(0,0,0,0.6);
        }
        @media (min-width: 640px) {
          .gs-card { padding: 36px 36px 40px; border-radius: 1.5rem; }
        }

        /* Rim light at top of card */
        .gs-rim {
          position: absolute;
          top: 0; left: 10%; right: 10%;
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(78,222,163,0.4), transparent);
          pointer-events: none;
        }

        /* Input */
        .gs-input {
          width: 100%;
          background: rgba(1, 15, 31, 0.45);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 0.75rem;
          padding: 13px 16px;
          color: #d4e4fa;
          font-family: 'JetBrains Mono', monospace;
          font-size: 14px;
          letter-spacing: 0.04em;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .gs-input::placeholder { color: rgba(187,202,191,0.3); }
        .gs-input:focus {
          border-color: rgba(78,222,163,0.5);
          box-shadow: 0 0 0 3px rgba(78,222,163,0.08);
        }

        /* Field label — icon left, text right, NO raw icon name */
        .gs-field-label {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 8px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(187,202,191,0.7);
          line-height: 1;
        }
        .gs-field-label .material-symbols-outlined {
          font-size: 15px;
          color: rgba(78,222,163,0.6);
          flex-shrink: 0;
        }

        /* Buttons */
        .gs-btn-primary {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: linear-gradient(135deg, #8B5CF6, #EC4899);
          color: #fff;
          padding: 14px 20px;
          border-radius: 0.75rem;
          font-family: 'Geist', sans-serif;
          font-weight: 700;
          font-size: 15px;
          border: none;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 0 20px 2px rgba(139,92,246,0.35),
                      0 0 40px 4px rgba(236,72,153,0.15);
        }
        .gs-btn-primary:hover  { transform: scale(1.02); }
        .gs-btn-primary:active { transform: scale(0.98); }

        .gs-btn-secondary {
          width: 100%;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(187,202,191,0.8);
          padding: 13px 20px;
          border-radius: 0.75rem;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
        }
        .gs-btn-secondary:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.2);
        }

        /* Logo icon bubble */
        .gs-logo-bubble {
          width: 56px; height: 56px;
          border-radius: 50%;
          border: 1px solid rgba(78,222,163,0.25);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 1.25rem;
          backdrop-filter: blur(8px);
        }

        /* Deco icons row — desktop only */
        .gs-deco {
          position: relative; z-index: 1;
          display: none;
          align-items: center;
          justify-content: center;
          gap: 2.5rem;
          margin-top: 2.5rem;
          opacity: 0.28;
        }
        @media (min-width: 768px) { .gs-deco { display: flex; } }
        .gs-deco-icon {
          width: 42px; height: 42px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(13,28,45,0.4);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(78,222,163,0.18);
          border-radius: 0.25rem;
        }
      `}</style>

      {/* Atmospheric glows — fixed, behind everything */}
      <div className="gs-glow" style={{ top: "-120px", left: "-120px" }} />
      <div className="gs-glow" style={{ bottom: "-120px", right: "-120px", animationDelay: "2s" }} />

      <div className="gs-root">
        <div className="gs-spacer" />

        {/* ── Branding ── */}
        <header style={{ marginBottom: "1.75rem", display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 1 }}>
          <div className="gs-logo-bubble" style={{ overflow: "hidden" }}>
            <img src="/logo.jpg" alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <h1 style={{ fontFamily: "'Geist', sans-serif", fontSize: "clamp(22px, 3.5vw, 32px)", fontWeight: 700, letterSpacing: "-0.02em", color: "#d4e4fa", margin: "0 0 4px", textAlign: "center" }}>
            SkillGap <span style={{ color: "rgba(78,222,163,0.85)", fontWeight: 500 }}>Analyzer</span>
          </h1>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(187,202,191,0.5)", margin: 0 }}>
            Precision Engineering
          </p>
        </header>

        {/* ── Card ── */}
        <div className="gs-card">
          <div className="gs-rim" />

          <div style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ fontFamily: "'Geist', sans-serif", fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 600, letterSpacing: "-0.01em", color: "#d4e4fa", margin: "0 0 6px" }}>
              Get Started 👋
            </h2>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, lineHeight: "1.55", color: "rgba(187,202,191,0.8)", margin: 0 }}>
              Sign in with your social account or continue offline.
            </p>
          </div>

          {/* OAuth Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            {/* Google */}
            <button
              onClick={handleGoogleLogin}
              style={{
                width: '100%',
                padding: '13px 20px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.05)',
                color: '#dce2f7',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            {/* GitHub */}
            <button
              onClick={handleGitHubLogin}
              style={{
                width: '100%',
                padding: '13px 20px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.05)',
                color: '#dce2f7',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              Continue with GitHub
            </button>
          </div>

          {/* Divider */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px'
          }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
            <span style={{ color: '#474553', fontSize: '12px', fontFamily: 'Inter, sans-serif' }}>
              or continue with email
            </span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
          </div>

          {/* Fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            {fields.map(({ name, icon, label, placeholder }) => (
              <div key={name}>
                {/* Label: icon + text, icon rendered by font — never shows raw name */}
                <label className="gs-field-label">
                  <span className="material-symbols-outlined">{icon}</span>
                  {label}
                </label>
                <input
                  className="gs-input"
                  type="text"
                  name={name}
                  placeholder={placeholder}
                  value={form[name]}
                  onChange={handleChange}
                  autoComplete="off"
                />
              </div>
            ))}

            {error && (
              <p style={{ color: "#f87171", fontSize: "13px", marginTop: "2px" }}>
                {error}
              </p>
            )}

            {/* Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 6 }}>
              <button className="gs-btn-primary" onClick={handleContinue}>
                Continue
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
              </button>
              <button className="gs-btn-secondary" onClick={handleSkip}>
                Skip &amp; use offline mode
              </button>
            </div>
          </div>

          <p style={{ marginTop: "1.25rem", textAlign: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.06em", color: "rgba(187,202,191,0.35)" }}>
            No account needed • All data stored locally
          </p>
        </div>

        {/* Deco icons — desktop only */}
        <div className="gs-deco">
          {[["architecture", 12], ["data_object", -12], ["terminal", 6]].map(([icon, rot]) => (
            <div key={icon} className="gs-deco-icon" style={{ transform: `rotate(${rot}deg)` }}>
              <span className="material-symbols-outlined" style={{ color: "rgba(78,222,163,0.5)", fontSize: 18 }}>{icon}</span>
            </div>
          ))}
        </div>

        <div className="gs-spacer" />
      </div>
    </>
  );
}
