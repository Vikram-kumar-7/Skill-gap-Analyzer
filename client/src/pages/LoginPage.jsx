import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";
import { Zap, Mail, ArrowRight, BookOpen, User, Target } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=details, 2=email, 3=check email
  const [form, setForm] = useState({ name: "", course: "", targetRole: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const COURSE_LIST = ["B.Tech CSE", "B.Tech IT", "BCA", "MCA", "MBA", "M.Tech", "B.Sc CS", "Other"];
  const ROLE_LIST = ["Full Stack Developer", "Backend Developer", "Frontend Developer", "Data Scientist", "DevOps Engineer", "ML Engineer"];

  function handleChange(e) {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setError("");
  }

  function handleDetailsSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return setError("Name is required");
    if (!form.course.trim()) return setError("Course is required");
    if (!form.targetRole.trim()) return setError("Target role is required");
    setStep(2);
  }

  async function handleEmailSubmit(e) {
    e.preventDefault();
    if (!form.email.trim()) return setError("Email is required");
    setLoading(true);

    // Save profile to localStorage immediately
    localStorage.setItem("sga_user", JSON.stringify({
      name: form.name,
      course: form.course,
      targetRole: form.targetRole,
      email: form.email,
      createdAt: Date.now(),
    }));

    // Send magic link
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: form.email,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          name: form.name,
          course: form.course,
          target_role: form.targetRole,
        }
      }
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
    } else {
      setStep(3);
    }
  }

  // Skip email — just use localStorage (offline mode)
  function handleSkip() {
    if (!form.name.trim() || !form.course.trim() || !form.targetRole.trim()) {
      return setError("Please fill all fields first");
    }
    localStorage.setItem("sga_user", JSON.stringify({
      name: form.name,
      course: form.course,
      targetRole: form.targetRole,
      createdAt: Date.now(),
    }));
    window.dispatchEvent(new Event("storage"));
    navigate("/");
  }

  const inputStyle = {
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 9,
    padding: "10px 14px",
    color: "white",
    fontSize: 14,
    outline: "none",
    marginBottom: 14,
    boxSizing: "border-box",
    minHeight: "44px",
  };

  const labelStyle = {
    display: "block",
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: 5,
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080d1a",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem",
    }}>
      {/* Glow */}
      <div style={{
        position: "fixed", top: "10%", left: "50%",
        transform: "translateX(-50%)",
        width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{
        width: "100%", maxWidth: 420,
        background: "#0e1525",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20,
        padding: "36px 28px",
        position: "relative", zIndex: 1,
      }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 11,
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Zap size={18} color="white" />
          </div>
          <div>
            <div style={{ color: "white", fontWeight: 700, fontSize: 15 }}>SkillGap</div>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, textTransform: "uppercase", letterSpacing: 2 }}>Analyzer</div>
          </div>
        </div>

        {/* ── STEP 1: Name + Course + Role ── */}
        {step === 1 && (
          <>
            <h1 style={{ color: "white", fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
              Get Started 👋
            </h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, marginBottom: 24 }}>
              Tell us about yourself
            </p>

            <form onSubmit={handleDetailsSubmit}>
              <label style={labelStyle}><User size={10} style={{ display:"inline", marginRight:4 }} />Your Name</label>
              <input name="name" value={form.name} onChange={handleChange}
                placeholder="e.g. Vikram Kumar" style={inputStyle} />

              <label style={labelStyle}><BookOpen size={10} style={{ display:"inline", marginRight:4 }} />Course</label>
              <input name="course" value={form.course} onChange={handleChange}
                placeholder="e.g. B.Tech CSE" list="courses" style={inputStyle} />
              <datalist id="courses">{COURSE_LIST.map(c => <option key={c} value={c} />)}</datalist>

              <label style={labelStyle}><Target size={10} style={{ display:"inline", marginRight:4 }} />Target Role</label>
              <input name="targetRole" value={form.targetRole} onChange={handleChange}
                placeholder="e.g. Backend Developer" list="roles" style={inputStyle} />
              <datalist id="roles">{ROLE_LIST.map(r => <option key={r} value={r} />)}</datalist>

              {error && <p style={{ color: "#f87171", fontSize: 14, marginBottom: 10 }}>{error}</p>}

              <button type="submit" style={{
                width: "100%", padding: "12px",
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                border: "none", borderRadius: 10,
                color: "white", fontSize: 14, fontWeight: 700,
                cursor: "pointer", display: "flex",
                alignItems: "center", justifyContent: "center", gap: 8,
                minHeight: "44px",
              }}>
                Continue <ArrowRight size={15} />
              </button>

              {/* Skip email entirely */}
              <button type="button" onClick={handleSkip} style={{
                width: "100%", marginTop: 10, padding: "10px",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10, color: "rgba(255,255,255,0.35)",
                fontSize: 14, cursor: "pointer",
                minHeight: "44px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                Skip & use offline mode
              </button>
            </form>
          </>
        )}

        {/* ── STEP 2: Email for magic link ── */}
        {step === 2 && (
          <>
            <h1 style={{ color: "white", fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
              Save your progress ✉️
            </h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, marginBottom: 24 }}>
              Enter your email to sync data across devices.<br />
              We'll send a magic link — no password needed.
            </p>

            <form onSubmit={handleEmailSubmit}>
              <label style={labelStyle}><Mail size={10} style={{ display:"inline", marginRight:4 }} />Email Address</label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                placeholder="you@example.com" style={inputStyle} />

              {error && <p style={{ color: "#f87171", fontSize: 14, marginBottom: 10 }}>{error}</p>}

              <button type="submit" disabled={loading} style={{
                width: "100%", padding: "12px",
                background: loading ? "rgba(99,102,241,0.5)" : "linear-gradient(135deg,#6366f1,#8b5cf6)",
                border: "none", borderRadius: 10,
                color: "white", fontSize: 14, fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                minHeight: "44px",
              }}>
                <Mail size={15} />
                {loading ? "Sending..." : "Send Magic Link"}
              </button>

              <button type="button" onClick={() => { handleSkip(); }} style={{
                width: "100%", marginTop: 10, padding: "10px",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10, color: "rgba(255,255,255,0.35)",
                fontSize: 14, cursor: "pointer",
                minHeight: "44px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                Skip — use offline mode instead
              </button>
            </form>

            <button onClick={() => setStep(1)} style={{
              background: "none", border: "none",
              color: "rgba(255,255,255,0.3)", fontSize: 14,
              cursor: "pointer", marginTop: 12,
              minHeight: "44px",
              display: "inline-flex",
              alignItems: "center",
              padding: "0 12px",
            }}>
              ← Back
            </button>
          </>
        )}

        {/* ── STEP 3: Check email ── */}
        {step === 3 && (
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "rgba(99,102,241,0.12)",
              border: "2px solid rgba(99,102,241,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
            }}>
              <Mail size={28} color="#a5b4fc" />
            </div>
            <h2 style={{ color: "white", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
              Check your email!
            </h2>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
              We sent a magic link to<br />
              <strong style={{ color: "white" }}>{form.email}</strong><br />
              Click it to log in instantly.
            </p>
            <button onClick={handleSkip} style={{
              width: "100%", padding: "11px",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10, color: "rgba(255,255,255,0.5)",
              fontSize: 14, cursor: "pointer",
              minHeight: "44px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              Continue in offline mode for now
            </button>
          </div>
        )}

        <p style={{
          color: "rgba(255,255,255,0.15)", fontSize: 13,
          textAlign: "center", marginTop: 20,
        }}>
          No account needed · All data stored locally
        </p>
      </div>
    </div>
  );
}
