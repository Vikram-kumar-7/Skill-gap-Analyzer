import { useState } from 'react';
import { Zap } from 'lucide-react';
import { saveUser, getUser } from '../utils/storage.js';

const COURSES = ['B.Tech CSE','B.Tech IT','BCA','MCA','MBA','M.Tech','B.Sc CS','Other'];
const ROLES   = ['Full Stack Developer','Frontend Developer','Backend Developer','Data Scientist','DevOps Engineer','Mobile Developer','ML Engineer','UI/UX Designer','Other'];

export default function LoginPage({ onLogin }) {
  const [name,       setName]       = useState('');
  const [course,     setCourse]     = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [errors,     setErrors]     = useState({});

  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!name.trim())       errs.name       = 'Name is required';
    if (!course.trim())     errs.course     = 'Course is required';
    if (!targetRole.trim()) errs.targetRole = 'Target role is required';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const data = { name: name.trim(), course: course.trim(), targetRole: targetRole.trim(), createdAt: Date.now() };
    saveUser(data);
    onLogin(data);
  };

  const inp = (hasErr) => ({
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${hasErr ? '#f87171' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: '9px',
    padding: '10px 14px',
    color: 'white',
    fontSize: '13px',
    fontFamily: 'inherit',
    outline: 'none',
    marginBottom: '4px',
    transition: 'border-color 0.15s',
    boxSizing: 'border-box',
  });

  return (
    <div style={{
      minHeight: '100vh', width: '100vw',
      background: '#080d1a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        width: '100%', maxWidth: '400px',
        background: '#0e1525',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '18px',
        padding: '36px 32px',
        boxShadow: '0 4px 40px rgba(0,0,0,0.6)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={18} color="white" fill="white" />
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'white' }}>SkillGap Analyzer</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Career Intelligence</div>
          </div>
        </div>

        {/* Heading */}
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'white', marginTop: '28px' }}>
          Get Started 👋
        </h1>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', marginTop: '6px', marginBottom: '28px' }}>
          Tell us about yourself to begin
        </p>

        <form onSubmit={submit}>
          {/* Name */}
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>
            Your Name
          </label>
          <input
            style={inp(errors.name)}
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Vikram Kumar"
            onFocus={e => e.target.style.borderColor = '#6366f1'}
            onBlur={e  => e.target.style.borderColor = errors.name ? '#f87171' : 'rgba(255,255,255,0.1)'}
          />
          {errors.name && <div style={{ fontSize: '11px', color: '#f87171', marginBottom: '8px' }}>{errors.name}</div>}
          {!errors.name && <div style={{ marginBottom: '14px' }} />}

          {/* Course */}
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>
            Your Course
          </label>
          <input
            list="courses-list"
            style={inp(errors.course)}
            value={course}
            onChange={e => setCourse(e.target.value)}
            placeholder="e.g. B.Tech Computer Science"
            onFocus={e => e.target.style.borderColor = '#6366f1'}
            onBlur={e  => e.target.style.borderColor = errors.course ? '#f87171' : 'rgba(255,255,255,0.1)'}
          />
          <datalist id="courses-list">
            {COURSES.map(c => <option key={c} value={c} />)}
          </datalist>
          {errors.course && <div style={{ fontSize: '11px', color: '#f87171', marginBottom: '8px' }}>{errors.course}</div>}
          {!errors.course && <div style={{ marginBottom: '14px' }} />}

          {/* Target Role */}
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>
            Target Role
          </label>
          <input
            list="roles-list"
            style={inp(errors.targetRole)}
            value={targetRole}
            onChange={e => setTargetRole(e.target.value)}
            placeholder="e.g. Full Stack Developer"
            onFocus={e => e.target.style.borderColor = '#6366f1'}
            onBlur={e  => e.target.style.borderColor = errors.targetRole ? '#f87171' : 'rgba(255,255,255,0.1)'}
          />
          <datalist id="roles-list">
            {ROLES.map(r => <option key={r} value={r} />)}
          </datalist>
          {errors.targetRole && <div style={{ fontSize: '11px', color: '#f87171', marginBottom: '8px' }}>{errors.targetRole}</div>}
          {!errors.targetRole && <div style={{ marginBottom: '20px' }} />}

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '14px', fontWeight: 700, borderRadius: '10px', letterSpacing: '0.01em' }}
          >
            Start My Journey →
          </button>
        </form>

        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: '20px' }}>
          All data stored locally in your browser · No account needed
        </p>
      </div>
    </div>
  );
}
