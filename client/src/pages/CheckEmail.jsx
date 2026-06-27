import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function CheckEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || localStorage.getItem("skillgap_pending_email") || "you@example.com";

  const [resent, setResent] = useState(false);
  const [toast, setToast] = useState(null); // { msg, type }

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSupport = (e) => {
    e.preventDefault();
    const supportEmail = "heloeworld1@gmail.com";
    navigator.clipboard.writeText(supportEmail)
      .then(() => showToast(`📋 Copied: ${supportEmail}`))
      .catch(() => {
        // fallback — open mailto if clipboard blocked
        window.location.href = `mailto:${supportEmail}?subject=SkillGap Analyzer Support`;
      });
  };

  const handleResend = () => {
    // await supabase.auth.signInWithOtp({ email });
    setResent(true);
    setTimeout(() => setResent(false), 3000);
  };

  const handleOffline = () => navigate("/dashboard");

  return (
    <>
      <style>{`
        .ce-root {
          min-height: 100vh;
          width: 100%;
          background-color: #05070A;
          color: #d4e4fa;
          font-family: 'Inter', sans-serif;
          overflow-x: hidden;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-top: 64px;
          padding-bottom: 40px;
          box-sizing: border-box;
        }
        .ce-spacer { flex: 1; min-height: 24px; max-height: 80px; }
        .ce-obsidian-glass {
          background: rgba(5, 20, 36, 0.6);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .ce-atmo-glow {
          position: fixed;
          width: 500px;
          height: 500px;
          filter: blur(40px);
          pointer-events: none;
          z-index: 0;
        }
        .ce-card {
          width: 100%;
          max-width: 480px;
          border-radius: 1.5rem;
          padding: 28px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          position: relative;
          overflow: hidden;
          box-sizing: border-box;
          margin: 20px 16px 40px;
        }
        @media (min-width: 640px) {
          .ce-card { padding: 36px 36px; margin: 32px auto 48px; }
        }
        .ce-mail-ring {
          position: absolute;
          inset: 0;
          background: rgba(78, 222, 163, 0.2);
          border-radius: 50%;
          filter: blur(28px);
          transition: background 0.7s;
          pointer-events: none;
        }
        .ce-mail-wrap:hover .ce-mail-ring { background: rgba(78, 222, 163, 0.3); }
        .ce-mail-icon { transition: transform 0.5s; }
        .ce-mail-wrap:hover .ce-mail-icon { transform: scale(1.1); }
        .ce-primary-btn {
          background: #4edea3;
          color: #003824;
          border: none;
          border-radius: 1rem;
          font-family: 'Geist', sans-serif;
          font-size: clamp(15px, 2vw, 18px);
          font-weight: 700;
          padding: 14px 20px;
          width: 100%;
          cursor: pointer;
          box-shadow: 0 10px 20px -10px rgba(16,185,129,0.5);
          transition: transform 0.2s;
          box-sizing: border-box;
        }
        .ce-primary-btn:hover { transform: scale(1.02); }
        .ce-primary-btn:active { transform: scale(0.98); }
        .ce-resend-btn {
          margin-top: 1rem;
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 0;
          transition: color 0.2s;
        }
        .ce-toast {
          position: fixed;
          bottom: 32px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(18, 33, 49, 0.95);
          border: 1px solid rgba(78, 222, 163, 0.3);
          color: #d4e4fa;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          letter-spacing: 0.03em;
          padding: 12px 20px;
          border-radius: 999px;
          backdrop-filter: blur(16px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.5), 0 0 16px rgba(78,222,163,0.15);
          white-space: nowrap;
          z-index: 999;
          animation: ce-toast-in 0.25s ease;
        }
        @keyframes ce-toast-in {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .ce-divider {
          width: 100%;
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent);
          margin: 1.75rem 0;
        }
        .ce-email-pill {
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: #d4e4fa;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 999px;
          padding: 7px 14px;
          margin-bottom: 16px;
          word-break: break-all;
        }
      `}</style>

      {/* Fixed background glows */}
      <div style={{ position: "fixed", inset: 0, zIndex: -10, background: "#05070A", overflow: "hidden", pointerEvents: "none" }}>
        <div className="ce-atmo-glow" style={{ top: "-10%", left: "-10%", background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, rgba(16,185,129,0) 70%)" }} />
        <div className="ce-atmo-glow" style={{ bottom: "-10%", right: "-10%", background: "radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)" }} />
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
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img src="/logo.jpg" alt="Logo" style={{ width: 32, height: 32, borderRadius: 8, objectFit: "cover" }} />
          <div>
            <div style={{ fontFamily: "Geist, sans-serif", fontSize: "clamp(16px, 2.5vw, 22px)", fontWeight: 700, color: "#d4e4fa", lineHeight: 1.1, letterSpacing: "-0.01em" }}>SkillGap</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#bbcabf" }}>Analyzer</div>
          </div>
        </div>
        <button
          onClick={() => navigate(-1)}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#bbcabf", padding: 4, transition: "color 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.color = "#4edea3"}
          onMouseLeave={e => e.currentTarget.style.color = "#bbcabf"}
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </header>

      {/* Scrollable content */}
      <div className="ce-root" style={{ position: "relative", zIndex: 1 }}>
        <div className="ce-spacer" />
        <div className="ce-obsidian-glass ce-card">
          {/* Ambient inner top */}
          <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "100%", height: "40%", background: "linear-gradient(to bottom, rgba(78,222,163,0.04), transparent)", pointerEvents: "none" }} />

          {/* Brand row */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "2rem", alignSelf: "flex-start" }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden", border: "1px solid rgba(78,222,163,0.3)" }}>
              <img src="/logo.jpg" alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontFamily: "Geist, sans-serif", fontSize: 20, fontWeight: 700, color: "#d4e4fa", lineHeight: 1.1, letterSpacing: "-0.01em" }}>SkillGap</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(187,202,191,0.6)" }}>Analyzer</div>
            </div>
          </div>

          {/* Mail icon */}
          <div className="ce-mail-wrap" style={{ position: "relative", marginBottom: "1.5rem" }}>
            <div className="ce-mail-ring" />
            <div style={{ position: "relative", width: 96, height: 96, borderRadius: "50%", border: "1px solid rgba(78,222,163,0.4)", background: "rgba(5,20,36,0.4)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px 0 rgba(16,185,129,0.15)" }}>
              <span className="material-symbols-outlined ce-mail-icon" style={{ color: "#4edea3", fontSize: 44 }}>mail</span>
            </div>
          </div>

          <h1 style={{ fontFamily: "Geist, sans-serif", fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 600, letterSpacing: "-0.01em", color: "#d4e4fa", margin: "0 0 12px" }}>
            Check your email!
          </h1>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 15, color: "#bbcabf", maxWidth: 300, margin: "0 0 8px" }}>
            We sent a magic link to
          </p>

          <div className="ce-email-pill">{email}</div>

          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "rgba(187,202,191,0.7)", marginBottom: "1.5rem" }}>
            Click it to log in instantly.
          </p>

          <button className="ce-primary-btn" onClick={handleOffline}>
            Continue in offline mode for now
          </button>

          <button
            className="ce-resend-btn"
            onClick={handleResend}
            style={{ color: resent ? "#4edea3" : "#bbcabf" }}
            onMouseEnter={e => { if (!resent) e.currentTarget.style.color = "#4edea3"; }}
            onMouseLeave={e => { if (!resent) e.currentTarget.style.color = "#bbcabf"; }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>refresh</span>
            {resent ? "Sent!" : "Resend verification email"}
          </button>

          <div className="ce-divider" />

          <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.05em", color: "rgba(187,202,191,0.4)", flexWrap: "wrap", justifyContent: "center" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>lock</span>
            <span>No account needed</span>
            <span style={{ margin: "0 2px" }}>•</span>
            <span>All data stored locally</span>
          </div>
        </div>

        {/* External help */}
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "rgba(187,202,191,0.5)", textAlign: "center", marginBottom: 8, padding: "0 16px" }}>
          Having trouble?{" "}
          <a
            href="#"
            onClick={handleSupport}
            style={{ color: "#4edea3", textDecoration: "none", cursor: "pointer" }}
            onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
            onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}
          >
            Contact technical support
          </a>
        </p>
        <div className="ce-spacer" />
      </div>

      {/* Toast notification */}
      {toast && (
        <div className="ce-toast">{toast.msg}</div>
      )}
    </>
  );
}
