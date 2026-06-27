import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";

export default function SaveProgress() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendLink = async () => {
    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: window.location.origin + '/dashboard',
        },
      });
      if (authError) throw authError;

      localStorage.setItem("sga_pending_email", email.trim());
      navigate("/check-email", { state: { email: email.trim() } });
    } catch (err) {
      setError(err.message || "Failed to send magic link.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    const current = JSON.parse(localStorage.getItem("sga_user") || "{}");
    const finalized = { ...current, createdAt: Date.now() };
    delete finalized.onboardingTemp;
    localStorage.setItem("sga_user", JSON.stringify(finalized));
    window.dispatchEvent(new Event("storage"));
  };

  const handleBack = () => navigate(-1);

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

        .sp-root {
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
          box-sizing: border-box;
          padding-top: 64px;
          padding-bottom: 40px;
        }
        .sp-spacer { flex: 1; min-height: 24px; max-height: 80px; }
        .sp-obsidian-glass {
          background: rgba(18, 33, 49, 0.4);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .sp-atmo-glow {
          position: fixed;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
        }
        .sp-card {
          width: 100%;
          max-width: 480px;
          border-radius: 1.5rem;
          padding: 28px 24px;
          position: relative;
          overflow: hidden;
          box-sizing: border-box;
          margin: 20px 16px 40px;
        }
        @media (min-width: 640px) {
          .sp-card { padding: 40px 36px; margin: 32px auto 48px; }
        }
        .sp-nebula-btn {
          background: linear-gradient(135deg, #7C3AED 0%, #EC4899 100%);
          border: none;
          transition: box-shadow 0.3s, transform 0.15s;
        }
        .sp-nebula-btn:hover:not(:disabled) {
          box-shadow: 0 0 30px 5px rgba(236, 72, 153, 0.35);
          transform: translateY(-1px);
        }
        .sp-nebula-btn:active { transform: scale(0.98) !important; }
        .sp-input {
          width: 100%;
          background: rgba(1, 15, 31, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.75rem;
          padding: 14px 16px;
          color: #fff;
          font-family: 'JetBrains Mono', monospace;
          font-size: 14px;
          letter-spacing: 0.05em;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.3s;
        }
        .sp-input::placeholder { color: rgba(187, 202, 191, 0.3); }
        .sp-input:focus { border-color: #4edea3; }
        .sp-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #bbcabf;
          margin-bottom: 8px;
        }
        .sp-back-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #bbcabf;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 0;
          transition: color 0.2s;
        }
        .sp-back-btn:hover { color: #fff; }
        .sp-skip-btn {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #bbcabf;
          padding: 14px 16px;
          border-radius: 0.75rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: background 0.2s;
          box-sizing: border-box;
        }
        .sp-skip-btn:hover { background: rgba(255,255,255,0.1); }
        /* Star particles */
        .sp-star { position: absolute; background: white; border-radius: 50%; }
      `}</style>

      {/* Background */}
      <div style={{ position: "fixed", inset: 0, zIndex: -10, background: "#05070A", overflow: "hidden", pointerEvents: "none" }}>
        <div className="sp-atmo-glow" style={{ top: "-10%", left: "-10%", background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)" }} />
        <div className="sp-atmo-glow" style={{ bottom: "-10%", right: "-10%", background: "radial-gradient(circle, rgba(124,58,237,0.05) 0%, transparent 70%)" }} />
        {/* Stars */}
        {[
          { top: "10%", left: "20%", w: 4, h: 4, op: 1 },
          { top: "40%", left: "80%", w: 2, h: 2, op: 0.5 },
          { top: "70%", left: "15%", w: 4, h: 4, op: 0.3 },
          { top: "25%", left: "65%", w: 3, h: 3, op: 0.7 },
          { top: "90%", left: "50%", w: 4, h: 4, op: 0.4 },
        ].map((s, i) => (
          <div key={i} className="sp-star" style={{ top: s.top, left: s.left, width: s.w, height: s.h, opacity: s.op * 0.2 }} />
        ))}
      </div>

      {/* Top nav */}
      <header style={{
        position: "fixed", top: 0, left: 0, width: "100%", zIndex: 50,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "0 clamp(16px, 4vw, 48px)", height: 64,
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        background: "rgba(5,7,10,0.85)",
        backdropFilter: "blur(24px)",
        boxSizing: "border-box",
      }}>
        <div style={{ fontFamily: "Geist, sans-serif", fontSize: "clamp(18px, 2.5vw, 24px)", fontWeight: 700, color: "#d4e4fa", letterSpacing: "-0.01em", display: "flex", alignItems: "center", gap: 8 }}>
          <img src="/logo.jpg" alt="Logo" style={{ width: 32, height: 32, borderRadius: 8, objectFit: "cover" }} />
          <span>
            SkillGap <span style={{ color: "#4edea3", fontWeight: 400 }}>Analyzer</span>
          </span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {["share", "more_vert"].map(icon => (
            <button key={icon} style={{ background: "none", border: "none", cursor: "pointer", color: "#bbcabf", padding: 4, transition: "color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.color = "#4edea3"}
              onMouseLeave={e => e.currentTarget.style.color = "#bbcabf"}
            >
              <span className="material-symbols-outlined">{icon}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Scrollable body */}
      <div className="sp-root" style={{ position: "relative", zIndex: 1 }}>
        <div className="sp-spacer" />
        <div className="sp-obsidian-glass sp-card">
          {/* Brand row */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: "1.75rem" }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 8px 20px -4px rgba(0,0,0,0.4)",
            }}>
              <img src="/logo.jpg" alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#d4e4fa" }}>SkillGap</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "-0.01em", textTransform: "uppercase", color: "rgba(187,202,191,0.6)" }}>Analyzer</div>
            </div>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: "1.5rem" }}>
            <h1 style={{ fontFamily: "Geist, sans-serif", fontSize: "clamp(20px, 3vw, 30px)", fontWeight: 600, letterSpacing: "-0.01em", color: "#fff", margin: "0 0 10px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              Save your progress <span style={{ fontSize: 22 }}>✉️</span>
            </h1>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 15, lineHeight: "1.6", color: "#bbcabf", margin: 0 }}>
              Enter your email to sync data across devices. We'll send a magic link —{" "}
              <span style={{ color: "#d4e4fa", fontStyle: "italic" }}>no password needed.</span>
            </p>
          </div>

          {/* Form */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label className="sp-label">
                EMAIL ADDRESS
              </label>
              <input
                className="sp-input"
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                onKeyDown={e => e.key === "Enter" && handleSendLink()}
              />
            </div>

            {error && (
              <p style={{ color: "#f87171", fontSize: "13px", marginTop: "2px" }}>
                {error}
              </p>
            )}

            <button
              className="sp-nebula-btn"
              onClick={handleSendLink}
              disabled={loading}
              style={{
                width: "100%",
                color: "#fff",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.05em",
                padding: "14px 16px",
                borderRadius: "0.75rem",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                opacity: loading ? 0.7 : 1,
                boxSizing: "border-box",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>mail</span>
              {loading ? "Sending..." : "Send Magic Link"}
            </button>

            <button className="sp-skip-btn" onClick={handleSkip}>
              Skip — use offline mode instead
            </button>
          </div>

          {/* Footer actions */}
          <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <button className="sp-back-btn" onClick={handleBack}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
              Back
            </button>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.05em", color: "rgba(187,202,191,0.4)", display: "flex", alignItems: "center", gap: 8, textAlign: "center", flexWrap: "wrap", justifyContent: "center" }}>
              No account needed
              <span style={{ width: 3, height: 3, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
              All data stored locally
            </div>
          </div>

          {/* Ambient glow decoration */}
          <div style={{ position: "absolute", bottom: -60, right: -60, width: 140, height: 140, background: "rgba(78,222,163,0.15)", filter: "blur(50px)", pointerEvents: "none" }} />
        </div>
        <div className="sp-spacer" />
      </div>
    </>
  );
}
