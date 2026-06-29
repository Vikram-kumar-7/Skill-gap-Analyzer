import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Award, 
  CheckCircle, 
  AlertCircle, 
  Play, 
  HelpCircle, 
  Settings, 
  RefreshCw, 
  ChevronRight, 
  TrendingUp, 
  ShieldAlert, 
  Trophy,
  Sliders,
} from 'lucide-react';

const Github = (props) => (
  <svg
    viewBox="0 0 24 24"
    width={props.size || "24"}
    height={props.size || "24"}
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
    style={props.style}
    {...props}
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);
import { getAnalyses, getProjects, saveUser, getUser } from '../utils/storage.js';
import { 
  analyzeGitHub, 
  getGitHubJobStatus, 
  getPlacementWeights, 
  updatePlacementWeights, 
  getCSQuiz 
} from '../services/githubApi.js';

const RimGlow = () => (
  <>
    <div style={{ position:'absolute', inset:0, borderRadius:'inherit', background:'linear-gradient(135deg,rgba(255,255,255,0.06) 0%,transparent 60%)', pointerEvents:'none', zIndex:0 }} />
    <style>{`@keyframes rim-pl{0%,100%{opacity:.28}50%{opacity:.90}}`}</style>
    <div style={{ position:'absolute', inset:0, borderRadius:'inherit', padding:'1px',
      background:'linear-gradient(135deg,rgba(78,222,163,.65) 0%,rgba(78,222,163,0) 40%,rgba(78,222,163,0) 70%,rgba(78,222,163,.50) 100%)',
      WebkitMask:'linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0)',
      WebkitMaskComposite:'xor', maskComposite:'exclude',
      pointerEvents:'none', animation:'rim-pl 4s ease-in-out infinite', zIndex:0 }} />
  </>
);

export default function PlacementPage() {
  const navigate = useNavigate();
  
  // Local storage profile sync
  const [user, setUser] = useState(() => getUser() || {});
  const [analyses] = useState(() => getAnalyses());
  const [projects] = useState(() => getProjects());

  // Weights state
  const [weights, setWeights] = useState({ dsa: 0.3, projects: 0.3, resume: 0.2, coreCs: 0.2 });
  const [tempWeights, setTempWeights] = useState({ dsa: 0.3, projects: 0.3, resume: 0.2, coreCs: 0.2 });
  const [showSettings, setShowSettings] = useState(false);
  const [weightsError, setWeightsError] = useState('');

  // GitHub state
  const [githubUser, setGithubUser] = useState(user.githubUsername || '');
  const [analyzingGit, setAnalyzingGit] = useState(false);
  const [, setGitJobId] = useState(null);
  const [gitProgress, setGitProgress] = useState(0);
  const [gitResult, setGitResult] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sga_github_analysis') || 'null');
    } catch {
      return null;
    }
  });
  const [gitError, setGitError] = useState('');
  const [gitValidationError, setGitValidationError] = useState('');
  const [showGitWakingUp, setShowGitWakingUp] = useState(false);

  // Local cold-start timer for GitHub analysis
  useEffect(() => {
    let timer;
    if (analyzingGit) {
      timer = setTimeout(() => {
        setShowGitWakingUp(true);
      }, 4000);
    }
    return () => clearTimeout(timer);
  }, [analyzingGit]);

  // LeetCode / DSA state - synchronized with DSA Tracker page
  const [lcEasy] = useState(() => {
    try {
      const dsaData = JSON.parse(localStorage.getItem('dsa_score') || 'null');
      if (dsaData && typeof dsaData.easy === 'number') return dsaData.easy;
    } catch {}
    return Number(localStorage.getItem('sga_lc_easy') || '40');
  });

  const [lcMedium] = useState(() => {
    try {
      const dsaData = JSON.parse(localStorage.getItem('dsa_score') || 'null');
      if (dsaData && typeof dsaData.medium === 'number') return dsaData.medium;
    } catch {}
    return Number(localStorage.getItem('sga_lc_medium') || '30');
  });

  const [lcHard] = useState(() => {
    try {
      const dsaData = JSON.parse(localStorage.getItem('dsa_score') || 'null');
      if (dsaData && typeof dsaData.hard === 'number') return dsaData.hard;
    } catch {}
    return Number(localStorage.getItem('sga_lc_hard') || '5');
  });

  // CS Quiz state
  const [quizQuestions, setQuizQuestions] = useState([]);        // full bank from server
  const [activeQuizQuestions, setActiveQuizQuestions] = useState([]); // shuffled subset for current session
  const [quizScore, setQuizScore] = useState(() => Number(localStorage.getItem('sga_cs_quiz_score') || '0'));
  const [quizActive, setQuizActive] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
  const [, setAnsweredQuestions] = useState([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  // Load weights and quiz on startup
  useEffect(() => {
    const fetchWeights = async () => {
      try {
        const res = await getPlacementWeights();
        if (res.success && res.data) {
          setWeights(res.data);
          setTempWeights(res.data);
        }
      } catch {
        console.warn('Could not load placement weights from backend, using defaults.');
      }
    };
    fetchWeights();

    const fetchQuiz = async () => {
      try {
        const res = await getCSQuiz();
        if (res.success && res.data) {
          setQuizQuestions(res.data);
        }
      } catch {
        console.warn('Could not load CS Quiz questions from backend.');
      }
    };
    fetchQuiz();
  }, []);

  // Compute DSA Score based on LeetCode questions (synchronized directly with DSA Tracker score)
  const computeDSAScore = () => {
    try {
      const dsaData = JSON.parse(localStorage.getItem('dsa_score') || 'null');
      if (dsaData && typeof dsaData.score === 'number') {
        return Math.min(100, Math.round(dsaData.score));
      }
    } catch {}
    // Fallback calculation using logarithmic scaling if no score saved yet
    const rawScore =
      Math.log(lcEasy + 1) * 10 +
      Math.log(lcMedium + 1) * 25 +
      Math.log(lcHard + 1) * 40;

    const maxScore =
      Math.log(501) * 10 +
      Math.log(301) * 25 +
      Math.log(151) * 40;

    const normalizedScore = (rawScore / maxScore) * 100;
    return Math.min(100, Math.round(normalizedScore));
  };

  const lcScore = computeDSAScore();

  // Compute Projects Score
  const computeProjectsScore = () => {
    if (projects.length === 0) return 0;
    const projPoints = projects.map(p => {
      const diff = p.difficulty?.toLowerCase() || 'medium';
      if (diff === 'hard' || diff === 'advanced') return 100;
      if (diff === 'medium') return 60;
      return 30;
    });
    const avgComplexity = projPoints.reduce((a, b) => a + b, 0) / projPoints.length;
    const countBonus = Math.min(100, projects.length * 30);
    return Math.min(100, Math.round(avgComplexity * 0.7 + countBonus * 0.3));
  };
  const projectsScore = computeProjectsScore();

  // Compute Resume Score
  const latestAnalysis = analyses.find(a => a.isActive) || analyses[0] || null;
  const resumeScore = latestAnalysis ? latestAnalysis.matchPct : 0;

  // Compute Overall Placement Score
  const overallScore = Math.round(
    (lcScore * weights.dsa) +
    (projectsScore * weights.projects) +
    (resumeScore * weights.resume) +
    (quizScore * weights.coreCs)
  );



  // GitHub Background Polling
  const handleGitAnalyze = async () => {
    if (!githubUser.trim()) {
      setGitValidationError('GitHub username is required.');
      return;
    }
    setGitValidationError('');
    setAnalyzingGit(true);
    setGitProgress(10);
    setGitError('');
    
    try {
      const response = await analyzeGitHub(githubUser.trim());
      if (response.success) {
        if (response.cached) {
          setGitProgress(100);
          setGitResult(response.result);
          localStorage.setItem('sga_github_analysis', JSON.stringify(response.result));
          
          // Trigger storage event to refresh skill aggregations instantly
          window.dispatchEvent(new Event('storage'));
          
          // Save GitHub username to profile
          const updatedUser = { ...user, githubUsername: githubUser.trim() };
          saveUser(updatedUser);
          setUser(updatedUser);
          setAnalyzingGit(false);
          setShowGitWakingUp(false);
        } else {
          setGitJobId(response.jobId);
          pollJob(response.jobId);
        }
      } else {
        setGitError('Analysis response failed.');
        setAnalyzingGit(false);
        setShowGitWakingUp(false);
      }
    } catch (err) {
      setGitError('Failed to start GitHub analysis: ' + err.message);
      setAnalyzingGit(false);
      setShowGitWakingUp(false);
    }
  };

  const pollJob = (jobId) => {
    const interval = setInterval(async () => {
      try {
        const response = await getGitHubJobStatus(jobId);
        if (response.success) {
          setGitProgress(response.progress);
          if (response.status === 'completed') {
            clearInterval(interval);
            setGitResult(response.result);
            localStorage.setItem('sga_github_analysis', JSON.stringify(response.result));
            
            // Sync to user profile
            const updatedUser = { ...user, githubUsername: githubUser.trim() };
            saveUser(updatedUser);
            setUser(updatedUser);
            
            window.dispatchEvent(new Event('storage'));
            setAnalyzingGit(false);
            setShowGitWakingUp(false);
          } else if (response.status === 'failed') {
            clearInterval(interval);
            setGitError('Job failed: ' + (response.error || 'Unknown error'));
            setAnalyzingGit(false);
            setShowGitWakingUp(false);
          }
        }
      } catch (err) {
        clearInterval(interval);
        setGitError('Polling error: ' + err.message);
        setAnalyzingGit(false);
        setShowGitWakingUp(false);
      }
    }, 1500);
  };

  // CS Quiz execution handlers
  const startQuiz = () => {
    if (quizQuestions.length === 0) return;
    // Shuffle the full question bank so every session/retake has a different order
    const shuffled = [...quizQuestions].sort(() => Math.random() - 0.5).slice(0, 10);
    setActiveQuizQuestions(shuffled);
    setQuizActive(true);
    setCurrentQuestionIndex(0);
    setSelectedOptionIndex(null);
    setAnsweredQuestions([]);
    setQuizFinished(false);
    setCorrectCount(0);
  };

  const handleOptionSelect = (index) => {
    if (selectedOptionIndex !== null) return;
    setSelectedOptionIndex(index);

    const currentQuestion = activeQuizQuestions[currentQuestionIndex];
    const isCorrect = index === currentQuestion.correct;
    if (isCorrect) setCorrectCount(prev => prev + 1);

    setAnsweredQuestions(prev => [...prev, index]);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < activeQuizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOptionIndex(null);
    } else {
      // Quiz finished - score based on correct / total shown
      const scorePercentage = Math.round((correctCount / activeQuizQuestions.length) * 100);
      setQuizScore(scorePercentage);
      localStorage.setItem('sga_cs_quiz_score', scorePercentage.toString());
      setQuizFinished(true);
      setQuizActive(false);
    }
  };

  // Weights save logic
  const handleSaveWeights = async () => {
    setWeightsError('');
    const total = Number(tempWeights.dsa) + Number(tempWeights.projects) + Number(tempWeights.resume) + Number(tempWeights.coreCs);
    if (Math.abs(total - 1.0) > 0.001) {
      setWeightsError(`Weights must sum to 1.0 (currently ${total.toFixed(2)})`);
      return;
    }
    try {
      const res = await updatePlacementWeights(tempWeights);
      if (res.success) {
        setWeights(res.data);
        setShowSettings(false);
      }
    } catch (err) {
      setWeightsError(err.response?.data?.error || 'Failed to update weights.');
    }
  };

  /* â”€â”€â”€ Design tokens â”€â”€â”€ */
  const EMERALD = '#4edea3';
  const glass = (extra = {}) => ({
    background: 'linear-gradient(135deg, rgba(5,20,36,0.90) 0%, rgba(13,28,45,0.65) 100%)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(78,222,163,0.15)',
    boxShadow: '0 4px 6px rgba(0,0,0,0.40), 0 24px 48px rgba(0,0,0,0.55), inset 0 1px 1px rgba(255,255,255,0.07)',
    borderRadius: '20px',
    position: 'relative',
    overflow: 'hidden',
    ...extra,
  });

  /* SVG gauge */
  const stroke = 8;
  const radius = 66;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px', padding: '16px', boxSizing: 'border-box' }}>

      {/* â•â• HERO: Readiness Index â•â• */}
      <div className="pl-hero" style={{ ...glass({ padding:'24px 28px' }), display:'grid', gridTemplateColumns:'auto 1fr', gap:'28px', alignItems:'start' }}>
        <RimGlow />
        {/* Orb */}
        <div style={{ position:'absolute', top:'-60px', right:'-60px', width:'240px', height:'240px', borderRadius:'50%', background:'rgba(78,222,163,0.06)', filter:'blur(60px)', pointerEvents:'none', zIndex:0 }} />

        {/* SVG Ring */}
        <div style={{ position:'relative', zIndex:1, flexShrink:0 }}>
          <div style={{ position:'relative', width:'148px', height:'148px', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="148" height="148" style={{ position:'absolute', inset:0 }}>
              <circle stroke="rgba(255,255,255,0.05)" fill="transparent" strokeWidth={stroke} r={radius} cx={74} cy={74} />
              <circle
                stroke="url(#pl-grad)" fill="transparent" strokeWidth={stroke}
                strokeDasharray={`${circumference} ${circumference}`}
                style={{ strokeDashoffset, transition:'stroke-dashoffset 0.8s ease-in-out', filter:'drop-shadow(0 0 12px rgba(78,222,163,0.50))' }}
                r={radius} cx={74} cy={74} strokeLinecap="round" transform="rotate(-90 74 74)"
              />
              <defs>
                <linearGradient id="pl-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4edea3" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:'32px', fontWeight:900, color:EMERALD, lineHeight:1, letterSpacing:'-0.03em' }}>{overallScore}%</div>
              <div style={{ fontSize:'9px', color:'rgba(187,202,191,0.45)', textTransform:'uppercase', letterSpacing:'0.12em', marginTop:'2px' }}>Readiness</div>
            </div>
          </div>
        </div>

        {/* Text + badges */}
        <div style={{ position:'relative', zIndex:1, flex:1, minWidth:'240px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'10px', marginBottom:'8px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
              <Trophy size={22} color="#fbbf24" />
              <h2 style={{ fontSize:'20px', fontWeight:800, color:'#d4e4fa', letterSpacing:'-0.01em' }}>Placement Readiness</h2>
            </div>
            <button onClick={() => { setShowSettings(!showSettings); setTempWeights(weights); }} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'8px 14px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.10)', borderRadius:'10px', color:'rgba(187,202,191,0.65)', fontSize:'12px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', minHeight:'40px', transition:'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(78,222,163,0.08)'; e.currentTarget.style.borderColor='rgba(78,222,163,0.25)'; e.currentTarget.style.color=EMERALD; }}
              onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.10)'; e.currentTarget.style.color='rgba(187,202,191,0.65)'; }}
            >
              <Sliders size={13} /> Tune Weights
            </button>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize:'12px', color:'rgba(187,202,191,0.45)', lineHeight:1.65, marginBottom: '8px' }}>
              Transparent, weighted score combining technical skills, portfolio validation, core CS, and data structures. Your score increases or decreases as you update your progress:
            </p>
            <ul style={{ fontSize: '11px', color: 'rgba(187,202,191,0.55)', paddingLeft: '16px', margin: '0 0 12px 0', lineHeight: 1.6 }}>
              <li>
                <strong>DSA Score ({(weights.dsa * 100).toFixed(0)}%)</strong>: Syncs with problems solved on the{' '}
                <a onClick={() => navigate('/dsa-tracker')} style={{ color: EMERALD, cursor: 'pointer', textDecoration: 'underline' }}>
                  DSA Tracker
                </a>
                .
              </li>
              <li>
                <strong>Projects ({(weights.projects * 100).toFixed(0)}%)</strong>: Boosted by the count and difficulty of projects in{' '}
                <a onClick={() => navigate('/projects')} style={{ color: EMERALD, cursor: 'pointer', textDecoration: 'underline' }}>
                  Projects & Skills
                </a>
                .
              </li>
              <li>
                <strong>Resume ({(weights.resume * 100).toFixed(0)}%)</strong>: Sourced from the compatibility percentage of your active resume under{' '}
                <a onClick={() => navigate('/dashboard')} style={{ color: EMERALD, cursor: 'pointer', textDecoration: 'underline' }}>
                  Dashboard Analyses
                </a>
                .
              </li>
              <li>
                <strong>Core CS ({(weights.coreCs * 100).toFixed(0)}%)</strong>: Driven by your score on the Core CS Quiz below.
              </li>
            </ul>
          </div>

          {/* Weights Config */}
          {showSettings && (
            <div style={{ marginBottom:'16px', background:'rgba(0,0,0,0.25)', border: weightsError ? '1px solid rgba(248,113,113,0.40)' : '1px solid rgba(78,222,163,0.15)', borderRadius:'14px', padding:'16px', transition:'border-color 0.18s' }}>
              <div style={{ fontSize:'12px', fontWeight:700, color:'#d4e4fa', marginBottom:'12px', display:'flex', alignItems:'center', gap:'6px' }}>
                <Sliders size={13} color={EMERALD} /> Adjust Configuration Weights
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(110px,1fr))', gap:'10px' }}>
                {[
                  { label:'DSA (LeetCode)', key:'dsa' },
                  { label:'Projects', key:'projects' },
                  { label:'Resume Parser', key:'resume' },
                  { label:'Core CS (Quiz)', key:'coreCs' },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label style={{ display:'block', fontSize:'9px', fontWeight:700, color:'rgba(187,202,191,0.40)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'5px' }}>{label}</label>
                    <input type="number" min="0" max="1" step="0.05" value={tempWeights[key]}
                      onChange={e => setTempWeights({ ...tempWeights, [key]: parseFloat(e.target.value)||0 })}
                      style={{ width:'100%', padding:'7px 10px', background:'rgba(5,7,10,0.70)', border:'1px solid rgba(255,255,255,0.08)', color:'#d4e4fa', borderRadius:'8px', fontSize:'12px', fontFamily:'inherit', outline:'none', minHeight:'36px', boxSizing:'border-box' }}
                    />
                  </div>
                ))}
              </div>
              {weightsError && <div style={{ fontSize:'11px', color:'#f87171', marginTop:'10px', fontWeight:500 }}>{weightsError}</div>}
              <div style={{ display:'flex', gap:'8px', marginTop:'14px', justifyContent:'flex-end' }}>
                <button onClick={() => setShowSettings(false)} style={{ background:'transparent', border:'none', color:'rgba(255,255,255,0.35)', padding:'7px 14px', fontSize:'12px', cursor:'pointer', minHeight:'36px', fontFamily:'inherit' }}>Cancel</button>
                <button onClick={handleSaveWeights} style={{ background:`linear-gradient(135deg, ${EMERALD}, #10b981)`, border:'none', borderRadius:'8px', color:'#003824', fontSize:'12px', fontWeight:800, cursor:'pointer', padding:'7px 18px', minHeight:'36px', fontFamily:'inherit', boxShadow:'0 0 14px rgba(78,222,163,0.20)' }}>Update Weights</button>
              </div>
            </div>
          )}

          {/* Score breakdown badges */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:'10px' }}>
            {[
              { label:'DSA Score',  value:lcScore,       color:'#fbbf24', weight:weights.dsa },
              { label:'Projects',   value:projectsScore, color:EMERALD,   weight:weights.projects },
              { label:'Resume',     value:resumeScore,   color:'#818cf8', weight:weights.resume },
              { label:'Core CS',    value:quizScore,     color:'#22d3ee', weight:weights.coreCs },
            ].map(({ label, value, color, weight }) => (
              <div key={label} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', padding:'7px 14px', borderRadius:'9px', display:'inline-flex', alignItems:'center', gap:'8px' }}>
                <span style={{ fontSize:'11px', color:'rgba(187,202,191,0.45)', lineHeight:'16px' }}>{label}</span>
                <span style={{ fontSize:'14px', fontWeight:800, color, lineHeight:'16px' }}>{value} / 100</span>
                <span style={{ fontSize:'10px', color:'rgba(255,255,255,0.25)', lineHeight:'16px' }}>({(weight*100).toFixed(0)}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* â•â• MAIN GRID â•â• */}
      <div className="pl-main" style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:'24px', alignItems:'start' }}>

        {/* LEFT: GitHub + CS Quiz */}
        <div style={{ display:'flex', flexDirection:'column', gap:'24px' }}>

          {/* GitHub Intelligence Engine */}
          <div style={glass({ padding:'26px' })}>
            <RimGlow />
            <div style={{ position:'relative', zIndex:1 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'10px', marginBottom:'18px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                  <div style={{ width:34, height:34, borderRadius:'9px', background:'rgba(78,222,163,0.10)', border:'1px solid rgba(78,222,163,0.20)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Github size={18} color={EMERALD} />
                  </div>
                  <h3 style={{ fontSize:'16px', fontWeight:700, color:'#d4e4fa' }}>GitHub Intelligence Engine</h3>
                </div>
                {gitResult && <span style={{ fontSize:'10px', color:'rgba(187,202,191,0.35)', fontWeight:500 }}>Analyzed: {gitResult.isMock ? 'Mock' : 'Real-time API'}</span>}
              </div>
              <p style={{ fontSize:'12px', color:'rgba(187,202,191,0.45)', marginBottom:'16px', lineHeight:1.65 }}>Synchronize your repository activity to validate project depth and contribution consistency.</p>

              <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
                <input
                  type="text" placeholder="Username only - e.g. Vikram-kumar-7"
                  value={githubUser}
                  onChange={e => { const raw=e.target.value; const m=raw.match(/github\.com\/([\w.-]+)/); setGithubUser(m?m[1]:raw); setGitValidationError(''); }}
                  onKeyDown={e => { if(e.key==='Enter'&&!analyzingGit) handleGitAnalyze(); }}
                  disabled={analyzingGit}
                  style={{ flex:1, minWidth:'200px', padding:'12px 16px', background:'rgba(5,7,10,0.65)', border: gitValidationError ? '1px solid rgba(248,113,113,0.40)' : '1px solid rgba(255,255,255,0.08)', color:'#d4e4fa', borderRadius:'12px', fontSize:'13px', fontFamily:'inherit', outline:'none', minHeight:'44px', transition:'border-color 0.18s, box-shadow 0.18s', boxSizing:'border-box' }}
                  onFocus={e => { e.target.style.borderColor='rgba(78,222,163,0.45)'; e.target.style.boxShadow='0 0 15px rgba(78,222,163,0.10)'; }}
                  onBlur={e =>  { e.target.style.borderColor=gitValidationError?'rgba(248,113,113,0.40)':'rgba(255,255,255,0.08)'; e.target.style.boxShadow='none'; }}
                />
                <button onClick={handleGitAnalyze} disabled={analyzingGit} style={{
                  display:'flex', alignItems:'center', gap:'8px', padding:'12px 20px',
                  background: analyzingGit ? 'rgba(255,255,255,0.04)' : 'linear-gradient(135deg,#10b981,#059669)',
                  border:'none', borderRadius:'12px', color:'#003824', fontSize:'13px', fontWeight:700,
                  cursor: analyzingGit ? 'not-allowed' : 'pointer', fontFamily:'inherit', minHeight:'44px',
                  boxShadow: analyzingGit ? 'none' : '0 0 20px rgba(16,185,129,0.35)',
                  transition:'all 0.18s',
                }}>
                  {analyzingGit ? <RefreshCw size={15} style={{ animation:'spin 1s linear infinite' }} /> : <Play size={14} fill="#003824" />}
                  Analyze My Profile
                </button>
              </div>
              {gitValidationError && <p style={{ color:'#f87171', fontSize:'11px', fontWeight:500, marginTop:'8px' }}>{gitValidationError}</p>}

              {/* Progress */}
              {analyzingGit && (
                <div style={{ marginTop:'18px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'10px', color:'rgba(187,202,191,0.40)', marginBottom:'6px' }}>
                    <span>Crawling repositories & commits...</span>
                    <span>{gitProgress}%</span>
                  </div>
                  <div style={{ width:'100%', height:'4px', background:'rgba(255,255,255,0.06)', borderRadius:'999px', overflow:'hidden' }}>
                    <div style={{ width:`${gitProgress}%`, height:'100%', background:'linear-gradient(90deg,#10b981,#4edea3)', borderRadius:'999px', boxShadow:'0 0 8px rgba(78,222,163,0.60)', transition:'width 0.3s' }} />
                  </div>
                  {showGitWakingUp && (
                    <div style={{ display:'flex', alignItems:'center', gap:'8px', background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.25)', padding:'10px 14px', borderRadius:'10px', color:'#fbbf24', fontSize:'12px', marginTop:'12px' }}>
                      <RefreshCw size={13} style={{ animation:'spin 2s linear infinite' }} />
                      <span>Waking up server... (~15s)</span>
                    </div>
                  )}
                </div>
              )}

              {/* Error */}
              {gitError && (
                <div style={{ display:'flex', gap:'8px', background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.22)', padding:'12px 16px', borderRadius:'12px', color:'#f87171', fontSize:'13px', marginTop:'16px' }}>
                  <AlertCircle size={16} style={{ flexShrink:0, marginTop:'2px' }} />
                  <span>{gitError}</span>
                </div>
              )}

              {/* Results */}
              {gitResult && !analyzingGit && (
                <div style={{ marginTop:'24px', display:'flex', flexDirection:'column', gap:'16px' }}>
                  {gitResult.isMock && (
                    <div style={{ display:'flex', alignItems:'center', gap:'8px', background:'rgba(245,158,11,0.07)', border:'1px solid rgba(245,158,11,0.22)', borderRadius:'12px', padding:'12px 16px', color:'#fbbf24', fontSize:'12px' }}>
                      <AlertCircle size={15} style={{ flexShrink:0 }} />
                      <span><strong>Demo data - GitHub API unavailable:</strong> Displaying simulated profile metrics.</span>
                    </div>
                  )}

                  {/* Strengths / Weaknesses */}
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px,1fr))', gap:'16px' }}>
                    <div style={{ background:'rgba(78,222,163,0.04)', border:'1px solid rgba(78,222,163,0.15)', borderRadius:'12px', padding:'14px' }}>
                      <div style={{ fontSize:'10px', fontWeight:700, color:EMERALD, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'10px' }}>Strengths</div>
                      <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
                        {gitResult.strengths?.map(s => <span key={s} style={{ fontSize:'12px', color:'rgba(255,255,255,0.75)' }}>{s}</span>)}
                      </div>
                    </div>
                    <div style={{ background:'rgba(244,63,94,0.04)', border:'1px solid rgba(244,63,94,0.15)', borderRadius:'12px', padding:'14px' }}>
                      <div style={{ fontSize:'10px', fontWeight:700, color:'#f43f5e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'10px' }}>Development Gaps</div>
                      <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
                        {gitResult.weaknesses?.map(w => <span key={w} style={{ fontSize:'12px', color:'rgba(255,255,255,0.75)' }}>⚠ {w}</span>)}
                      </div>
                    </div>
                  </div>

                  {/* Evidence */}
                  <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:'12px', padding:'16px' }}>
                    <div style={{ fontSize:'11px', fontWeight:700, color:'rgba(187,202,191,0.55)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'14px' }}>Scoring Heuristic Evidence Block</div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(110px,1fr))', gap:'14px' }}>
                      {[
                        { label:'Commits / Week',  val: gitResult.evidence?.commitsPerWeek },
                        { label:'Test Files',       val: gitResult.evidence?.testFilesFound },
                        { label:'Repos Analyzed',   val: gitResult.evidence?.reposAnalyzed },
                        { label:'Testing Practice', val: gitResult.evidence?.testingPractice },
                        { label:'README Quality',   val: gitResult.evidence?.documentationScore },
                        { label:'Merged PRs',       val: gitResult.evidence?.prsMerged },
                        { label:'Issues Closed',    val: gitResult.evidence?.issuesClosed },
                      ].map(({ label, val }) => (
                        <div key={label}>
                          <div style={{ fontSize:'9px', color:'rgba(187,202,191,0.35)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'4px' }}>{label}</div>
                          <div style={{ fontSize:'16px', fontWeight:800, color:'#818cf8' }}>{val ?? '\u2014'}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Skill Confidence */}
                  <div>
                    <div style={{ fontSize:'11px', fontWeight:700, color:'rgba(187,202,191,0.55)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'10px' }}>Imported Tech Stack Confidence</div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                      {Object.entries(gitResult.skillConfidence||{}).map(([skill,conf]) => (
                        <div key={skill} style={{ display:'flex', alignItems:'center', gap:'6px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'7px', padding:'5px 10px', fontSize:'12px' }}>
                          <span style={{ color:'#d4e4fa', fontWeight:500 }}>{skill}</span>
                          <span style={{ color:'#818cf8', fontWeight:700 }}>{conf.toFixed(1)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CS Fundamentals Quiz */}
          <div style={glass({ padding:'26px' })}>
            <RimGlow />
            <div style={{ position:'relative', zIndex:1 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'10px', marginBottom:'18px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                  <div style={{ width:34, height:34, borderRadius:'9px', background:'rgba(78,222,163,0.10)', border:'1px solid rgba(78,222,163,0.20)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <HelpCircle size={18} color={EMERALD} />
                  </div>
                  <h3 style={{ fontSize:'16px', fontWeight:700, color:'#d4e4fa' }}>CS Fundamentals Quiz</h3>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                  <span style={{ fontSize:'10px', color:'rgba(187,202,191,0.40)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Latest Score</span>
                  <span style={{ fontSize:'14px', fontWeight:800, color: quizScore >= 70 ? EMERALD : quizScore >= 40 ? '#fbbf24' : '#f87171' }}>{quizScore}%</span>
                </div>
              </div>

              {/* Pre-quiz state */}
              {!quizActive && !quizFinished && (
                <div style={{ textAlign:'center', padding:'24px 0' }}>
                  <div style={{ width:64, height:64, borderRadius:'18px', background:'rgba(78,222,163,0.08)', border:'1px solid rgba(78,222,163,0.18)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
                    <HelpCircle size={28} color={EMERALD} style={{ opacity:0.7 }} />
                  </div>
                  <p style={{ fontSize:'13px', color:'rgba(187,202,191,0.45)', marginBottom:'22px', lineHeight:1.65, maxWidth:'420px', margin:'0 auto 22px' }}>
                    Validate your core CS concepts (OS, DBMS, Networks, OOP) in a quick 10-question MCQ quiz to update your Placement Score.
                  </p>
                  <button onClick={startQuiz} style={{
                    display:'inline-flex', alignItems:'center', gap:'8px', padding:'12px 28px',
                    background:`linear-gradient(135deg, ${EMERALD}, #10b981)`,
                    border:'none', borderRadius:'12px', color:'#003824', fontSize:'13px', fontWeight:800,
                    cursor:'pointer', fontFamily:'inherit', boxShadow:'0 0 20px rgba(78,222,163,0.25)',
                    minHeight:'44px', transition:'all 0.18s',
                  }}>
                    <Play size={14} fill="#003824" /> Take Placement Quiz
                  </button>
                </div>
              )}

              {/* Active quiz */}
              {quizActive && activeQuizQuestions.length > 0 && (
                <div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'11px', color:'rgba(187,202,191,0.40)', marginBottom:'6px' }}>
                    <span>Question {currentQuestionIndex+1} of {activeQuizQuestions.length}</span>
                    <span>Correct: {correctCount}</span>
                  </div>
                  <div style={{ width:'100%', height:'3px', background:'rgba(255,255,255,0.06)', borderRadius:'999px', overflow:'hidden', marginBottom:'22px' }}>
                    <div style={{ width:`${((currentQuestionIndex+1)/activeQuizQuestions.length)*100}%`, height:'100%', background:`linear-gradient(90deg, ${EMERALD}, #10b981)`, borderRadius:'999px', transition:'width 0.35s', boxShadow:`0 0 8px rgba(78,222,163,0.60)` }} />
                  </div>
                  <div style={{ fontSize:'15px', fontWeight:700, color:'#d4e4fa', marginBottom:'18px', lineHeight:1.6 }}>
                    {activeQuizQuestions[currentQuestionIndex].question}
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                    {activeQuizQuestions[currentQuestionIndex].options.map((option, index) => {
                      const isSelected = selectedOptionIndex === index;
                      const isCorrect  = index === activeQuizQuestions[currentQuestionIndex].correct;
                      const answered   = selectedOptionIndex !== null;
                      let bg = 'rgba(255,255,255,0.03)', border = 'rgba(255,255,255,0.07)', icon = null;
                      if (answered) {
                        if (isCorrect) { bg='rgba(78,222,163,0.08)'; border='rgba(78,222,163,0.30)'; icon='\u2713'; }
                        else if (isSelected) { bg='rgba(244,63,94,0.08)'; border='rgba(244,63,94,0.30)'; icon='\u2717'; }
                      }
                      return (
                        <button key={index} onClick={() => handleOptionSelect(index)} style={{
                          width:'100%', textAlign:'left', padding:'12px 16px', background:bg,
                          border:`1px solid ${border}`, borderRadius:'12px', color: isSelected ? '#d4e4fa' : 'rgba(187,202,191,0.65)',
                          fontSize:'13px', cursor: answered ? 'default' : 'pointer',
                          display:'flex', justifyContent:'space-between', alignItems:'center',
                          fontFamily:'inherit', minHeight:'44px', transition:'background 0.15s, border-color 0.15s',
                        }}>
                          <span>{option}</span>
                          {icon && <span style={{ fontWeight:900, color: icon==='\u2713' ? EMERALD : '#f43f5e' }}>{icon}</span>}
                        </button>
                      );
                    })}
                  </div>
                  {selectedOptionIndex !== null && (
                    <div style={{ marginTop:'16px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:'10px', padding:'12px 14px', fontSize:'12px', color:'rgba(187,202,191,0.55)', lineHeight:1.6 }}>
                      <div style={{ fontWeight:700, color:'rgba(187,202,191,0.80)', marginBottom:'4px' }}>Explanation:</div>
                      {activeQuizQuestions[currentQuestionIndex].explanation}
                    </div>
                  )}
                  {selectedOptionIndex !== null && (
                    <div style={{ display:'flex', justifyContent:'flex-end', marginTop:'16px' }}>
                      <button onClick={nextQuestion} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'9px 20px', background:`linear-gradient(135deg, ${EMERALD}, #10b981)`, border:'none', borderRadius:'10px', color:'#003824', fontSize:'13px', fontWeight:800, cursor:'pointer', fontFamily:'inherit', minHeight:'40px', boxShadow:'0 0 14px rgba(78,222,163,0.20)' }}>
                        {currentQuestionIndex === activeQuizQuestions.length-1 ? 'Finish Quiz' : 'Next Question'} <ChevronRight size={14} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Finished */}
              {quizFinished && (
                <div style={{ textAlign:'center', padding:'24px 0' }}>
                  <div style={{ fontSize:'52px', fontWeight:900, color: quizScore>=70 ? EMERALD : quizScore>=40 ? '#fbbf24' : '#f87171', letterSpacing:'-0.03em', lineHeight:1 }}>{quizScore}%</div>
                  <div style={{ fontSize:'14px', fontWeight:700, color:'#d4e4fa', marginTop:'10px' }}>Quiz Completed! {"\uD83C\uDF89"}</div>
                  <div style={{ fontSize:'12px', color:'rgba(187,202,191,0.45)', marginTop:'5px', marginBottom:'20px', lineHeight:1.6 }}>
                    Your Core CS Score has been updated to {quizScore}/100 and mapped into the placement formula.
                  </div>
                  <button onClick={startQuiz} style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'10px 22px', background:'rgba(78,222,163,0.08)', border:'1px solid rgba(78,222,163,0.22)', color:EMERALD, borderRadius:'10px', fontSize:'12px', fontWeight:700, cursor:'pointer', fontFamily:'inherit', minHeight:'40px', transition:'all 0.15s' }}>
                    <RefreshCw size={13} /> Retake CS Quiz
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Projects */}
        <div style={{ display:'flex', flexDirection:'column', gap:'24px' }}>

          {/* Project Validation */}
          <div style={glass({ padding:'24px' })}>
            <RimGlow />
            <div style={{ position:'relative', zIndex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
                <div style={{ width:32, height:32, borderRadius:'9px', background:'rgba(78,222,163,0.10)', border:'1px solid rgba(78,222,163,0.20)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Trophy size={16} color={EMERALD} />
                </div>
                <h3 style={{ fontSize:'15px', fontWeight:700, color:'#d4e4fa' }}>Project Validation</h3>
              </div>

              {projects.length === 0 ? (
                <div style={{ textAlign:'center', padding:'24px 0', borderRadius:'12px', border:'1px dashed rgba(255,255,255,0.08)', marginBottom:'16px' }}>
                  <div style={{ fontSize:'11px', color:'rgba(187,202,191,0.30)', lineHeight:1.7 }}>No projects found in portfolio tracker.</div>
                </div>
              ) : (
                <div style={{ maxHeight:'150px', overflowY:'auto', display:'flex', flexDirection:'column', gap:'6px', marginBottom:'16px' }}>
                  {projects.map((p, idx) => (
                    <div key={idx} style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:'9px', padding:'9px 12px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ fontSize:'12px', color:'rgba(187,202,191,0.70)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginRight:'8px' }}>{p.title||p.name}</span>
                      <span style={{ fontSize:'9px', fontWeight:700, padding:'2px 7px', borderRadius:'5px', whiteSpace:'nowrap',
                        background: (p.difficulty==='Hard'||p.difficulty==='Advanced') ? 'rgba(248,113,113,0.12)' : p.difficulty==='Medium' ? 'rgba(59,130,246,0.12)' : 'rgba(78,222,163,0.12)',
                        color:       (p.difficulty==='Hard'||p.difficulty==='Advanced') ? '#f87171'              : p.difficulty==='Medium' ? '#60a5fa'              : '#4edea3',
                      }}>{p.difficulty||'Medium'}</span>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:'10px', flexWrap:'wrap' }}>
                <div>
                  <div style={{ fontSize:'9px', color:'rgba(187,202,191,0.35)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'2px' }}>Count</div>
                  <div style={{ fontSize:'22px', fontWeight:900, color:'#d4e4fa', letterSpacing:'-0.02em' }}>{projects.length}</div>
                </div>
                <button onClick={() => navigate('/projects')} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', padding:'10px 14px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.10)', borderRadius:'12px', color:'rgba(187,202,191,0.65)', fontSize:'12px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', minHeight:'40px', transition:'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(78,222,163,0.28)'; e.currentTarget.style.color=EMERALD; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.10)'; e.currentTarget.style.color='rgba(187,202,191,0.65)'; }}
                >Manage Projects</button>
              </div>

              <div style={{ marginTop:'14px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:'10px', padding:'10px 14px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:'10px', color:'rgba(187,202,191,0.35)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Projects Score</span>
                <span style={{ fontSize:'18px', fontWeight:900, color:EMERALD, letterSpacing:'-0.02em' }}>{projectsScore}<span style={{ fontSize:'11px', fontWeight:400, color:'rgba(255,255,255,0.25)' }}> / 100</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width:640px){
          .pl-hero{grid-template-columns:1fr!important;gap:16px!important}
          .pl-main{grid-template-columns:1fr!important}
          .pl-hero svg{width:120px!important;height:120px!important}
          .pl-score-badge{font-size:12px!important;padding:8px 10px!important}
          .pl-section{padding:18px 16px!important}
          .pl-input-group{flex-direction:column!important}
          .pl-input-group input{min-width:100%!important}
          .pl-input-group button{width:100%!important}
          .pl-evidence-grid{grid-template-columns:1fr!important}
          .pl-quiz-grid{grid-template-columns:1fr!important}
        }
        @media (max-width:480px){
          .pl-hero{padding:16px 12px!important;gap:12px!important}
          .pl-section{padding:14px 12px!important;gap:12px!important}
          .pl-badge-group{gap:6px!important}
          .pl-badge{font-size:11px!important;padding:5px 8px!important}
        }
      `}</style>
    </div>
  );
}