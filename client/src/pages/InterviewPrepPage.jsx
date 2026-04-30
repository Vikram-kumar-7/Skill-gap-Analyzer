import { useState, useEffect, useMemo } from "react";
import {
  MessageSquare, Timer, Send, RotateCcw, Filter, Search,
  ChevronDown, ChevronUp, Star, Award, TrendingUp, Brain,
  AlertCircle, CheckCircle2, Target, BookOpen
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { getInterviewAnswers, saveInterviewAnswer } from "../utils/store";
import { fireConfetti } from "../utils/confetti";
import axios from "axios";

const TIMER_OPTIONS = [60, 180, 300];

export default function InterviewPrepPage({ activeAnalysis, settings, toast }) {
  const [questions, setQuestions] = useState({ technical: [], behavioral: [], systemDesign: [] });
  const [tab, setTab] = useState("technical");
  const [selectedQ, setSelectedQ] = useState(null);
  const [answer, setAnswer] = useState("");
  const [timer, setTimer] = useState(180);
  const [timeLeft, setTimeLeft] = useState(null);
  const [timerActive, setTimerActive] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [answers, setAnswers] = useState(getInterviewAnswers());
  const [filterSkill, setFilterSkill] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [starInputs, setStarInputs] = useState({ situation: "", task: "", action: "", result: "" });

  useEffect(() => {
    fetch("/api/data/questions").then(r => r.json()).then(d => setQuestions(d)).catch(() => {});
  }, []);

  // Timer
  useEffect(() => {
    if (!timerActive || timeLeft === null) return;
    if (timeLeft <= 0) { setTimerActive(false); return; }
    const iv = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(iv);
  }, [timerActive, timeLeft]);

  const startTimer = () => { setTimeLeft(timer); setTimerActive(true); };
  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const handleSubmit = async () => {
    if (!answer.trim() || !selectedQ) return;
    setScoring(true);
    setFeedback(null);

    try {
      const { data } = await axios.post("/api/ai/score-answer", {
        question: selectedQ.question || selectedQ.prompt,
        answer,
        idealAnswer: selectedQ.idealAnswer || "",
        keywords: selectedQ.keywords || selectedQ.hints || [],
        apiKey: settings?.apiKey || "",
      });

      setFeedback(data);
      saveInterviewAnswer({
        question: selectedQ.question || selectedQ.prompt,
        answer,
        score: data.score,
        feedback: data.feedback,
        type: tab,
        skill: selectedQ.skill || tab,
      });
      setAnswers(getInterviewAnswers());

      if (data.score >= 80) {
        fireConfetti();
        toast?.(`🎯 Great answer! Score: ${data.score}/100`, "success");
      } else {
        toast?.(`Score: ${data.score}/100`, "info");
      }
    } catch {
      toast?.("Scoring failed", "error");
    }
    setScoring(false);
    setTimerActive(false);
  };

  // Filter questions by skill
  const filteredTech = useMemo(() => {
    if (!filterSkill) return questions.technical || [];
    return (questions.technical || []).filter(q => q.skill?.toLowerCase().includes(filterSkill.toLowerCase()));
  }, [questions, filterSkill]);

  // Progress chart data
  const chartData = useMemo(() => {
    const sessions = {};
    answers.forEach(a => {
      const date = new Date(a.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (!sessions[date]) sessions[date] = { scores: [], date };
      sessions[date].scores.push(a.score || 0);
    });
    return Object.values(sessions).map(s => ({ date: s.date, avg: Math.round(s.scores.reduce((a, b) => a + b, 0) / s.scores.length) })).slice(-10);
  }, [answers]);

  // Weakest topics
  const weakTopics = useMemo(() => {
    const bySkill = {};
    answers.forEach(a => {
      const sk = a.skill || "general";
      if (!bySkill[sk]) bySkill[sk] = [];
      bySkill[sk].push(a.score || 0);
    });
    return Object.entries(bySkill).map(([skill, scores]) => ({
      skill, avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length), count: scores.length,
    })).sort((a, b) => a.avg - b.avg).slice(0, 5);
  }, [answers]);

  const questionList = tab === "technical" ? filteredTech :
    tab === "behavioral" ? (questions.behavioral || []) :
    (questions.systemDesign || []);

  return (
    <div className="space-y-5 animate-fade-in-up">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <MessageSquare size={22} className="text-primary-400" /> Interview Prep
        <span className="text-sm font-normal text-surface-200/50">({answers.length} practiced)</span>
      </h2>

      {/* Tabs */}
      <div className="tab-bar mb-5 scrollbar-hide">
        {[
          { id: "technical", label: "Technical", icon: Brain },
          { id: "behavioral", label: "Behavioral", icon: BookOpen },
          { id: "systemDesign", label: "System Design", icon: Target },
          { id: "analytics", label: "Analytics", icon: TrendingUp },
        ].map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setSelectedQ(null); setFeedback(null); setAnswer(""); }}
            className={`tab-btn flex items-center gap-1.5 ${tab === t.id ? "active" : ""}`}>
            <t.icon size={13} /> {t.label}
          </button>
        ))}
      </div>

      {/* Analytics Tab */}
      {tab === "analytics" && (
        <div className="space-y-5">
          {chartData.length > 0 && (
            <div className="dash-card p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Score Trend</h3>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", fontSize: "12px" }} />
                    <Line type="monotone" dataKey="avg" stroke="#60a5fa" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          {weakTopics.length > 0 && (
            <div className="dash-card p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Weakest Topics</h3>
              <div className="space-y-2">
                {weakTopics.map(t => (
                  <div key={t.skill} className="flex items-center gap-3">
                    <span className="text-xs text-white flex-1">{t.skill}</span>
                    <div className="w-32 h-1.5 rounded-full bg-white/[0.06]">
                      <div className={`h-full rounded-full ${t.avg >= 70 ? "bg-emerald-500" : t.avg >= 40 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${t.avg}%` }} />
                    </div>
                    <span className="text-xs text-surface-200/50 w-8 text-right">{t.avg}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {answers.length === 0 && <p className="text-center text-sm text-surface-200/40 py-12">Practice some questions to see analytics</p>}
        </div>
      )}

      {/* Question + Answer UI */}
      {tab !== "analytics" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Question List */}
          <div className="dash-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-xs font-semibold text-white flex-1">Questions ({questionList.length})</h3>
              {tab === "technical" && (
                <input value={filterSkill} onChange={e => setFilterSkill(e.target.value)} placeholder="Filter skill..."
                  className="w-24 px-2 py-1 rounded bg-white/[0.03] border border-white/[0.06] text-[10px] text-white placeholder-surface-200/30 focus:outline-none" />
              )}
            </div>
            <div className="space-y-1.5 max-h-[500px] overflow-y-auto scrollbar-hide">
              {questionList.map((q, i) => {
                const isSelected = selectedQ === q;
                const practiced = answers.find(a => a.question === (q.question || q.prompt));
                return (
                  <button key={i} onClick={() => { setSelectedQ(q); setAnswer(""); setFeedback(null); setTimerActive(false); setTimeLeft(null); }}
                    className={`w-full text-left p-2.5 rounded-lg transition-colors text-xs ${
                      isSelected ? "bg-primary-500/15 border border-primary-500/20" : "hover:bg-white/[0.03] border border-transparent"
                    }`}>
                    <p className={`leading-snug ${isSelected ? "text-primary-400" : "text-surface-200/70"}`}>{(q.question || q.title || q.prompt)?.substring(0, 80)}...</p>
                    <div className="flex items-center gap-2 mt-1">
                      {q.difficulty && <span className={`text-[9px] font-medium ${q.difficulty === "Hard" ? "text-red-400" : q.difficulty === "Medium" ? "text-amber-400" : "text-emerald-400"}`}>{q.difficulty}</span>}
                      {q.skill && <span className="text-[9px] text-surface-200/40">{q.skill}</span>}
                      {practiced && <span className="text-[9px] text-emerald-400 flex items-center gap-0.5"><CheckCircle2 size={8} />{practiced.score}</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Answer Area */}
          <div className="lg:col-span-2 space-y-4">
            {selectedQ ? (
              <>
                <div className="dash-card p-4">
                  <p className="text-sm text-white font-medium leading-relaxed mb-3">{selectedQ.question || selectedQ.prompt}</p>
                  {selectedQ.starPrompt && (
                    <p className="text-xs text-surface-200/40 italic mb-3">{selectedQ.starPrompt}</p>
                  )}
                  {selectedQ.hints && (
                    <div className="mb-3">
                      <p className="text-[10px] text-surface-200/50 mb-1">Hints:</p>
                      <div className="flex flex-wrap gap-1">{selectedQ.hints.map((h, i) => <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">{h}</span>)}</div>
                    </div>
                  )}

                  {/* Timer */}
                  <div className="flex items-center gap-3 mb-3">
                    <select value={timer} onChange={e => setTimer(Number(e.target.value))}
                      className="px-2 py-1 rounded bg-white/[0.03] border border-white/[0.06] text-[11px] text-white focus:outline-none appearance-none">
                      {TIMER_OPTIONS.map(t => <option key={t} value={t}>{t / 60} min</option>)}
                    </select>
                    <button onClick={startTimer} disabled={timerActive}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-500/15 text-primary-400 text-[11px] hover:bg-primary-500/25 disabled:opacity-30">
                      <Timer size={11} /> Start Timer
                    </button>
                    {timeLeft !== null && (
                      <span className={`text-sm font-mono font-bold ${timeLeft <= 30 ? "text-red-400 animate-pulse" : "text-surface-200/60"}`}>{formatTime(timeLeft)}</span>
                    )}
                  </div>

                  {/* STAR inputs for behavioral */}
                  {tab === "behavioral" && (
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {["situation", "task", "action", "result"].map(field => (
                        <div key={field}>
                          <label className="text-[10px] text-surface-200/50 uppercase font-medium">{field}</label>
                          <textarea value={starInputs[field]} onChange={e => {
                            setStarInputs(p => ({ ...p, [field]: e.target.value }));
                            setAnswer(Object.values({ ...starInputs, [field]: e.target.value }).filter(Boolean).join(". "));
                          }} rows={2} placeholder={`${field}...`}
                            className="w-full px-2 py-1.5 rounded bg-white/[0.03] border border-white/[0.06] text-xs text-white placeholder-surface-200/30 focus:outline-none resize-none" />
                        </div>
                      ))}
                    </div>
                  )}

                  {tab !== "behavioral" && (
                    <textarea value={answer} onChange={e => setAnswer(e.target.value)} rows={6}
                      placeholder="Type your answer..."
                      className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-white placeholder-surface-200/30 focus:outline-none resize-none" />
                  )}

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[10px] text-surface-200/40">{answer.length} chars</span>
                    <button onClick={handleSubmit} disabled={!answer.trim() || scoring}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-500 text-white text-xs font-semibold hover:bg-primary-400 disabled:opacity-30">
                      <Send size={12} /> {scoring ? "Scoring..." : "Submit Answer"}
                    </button>
                  </div>
                </div>

                {/* Feedback */}
                {feedback && (
                  <div className="dash-card p-4 animate-fade-in">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold ${
                        feedback.score >= 80 ? "bg-emerald-500/15 text-emerald-400" :
                        feedback.score >= 50 ? "bg-amber-500/15 text-amber-400" : "bg-red-500/15 text-red-400"
                      }`}>
                        {feedback.score}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {feedback.score >= 80 ? "Excellent!" : feedback.score >= 50 ? "Good effort" : "Needs improvement"}
                        </p>
                        <p className="text-[11px] text-surface-200/50">{feedback.source === "ai" ? "AI-powered scoring" : "Rule-based scoring"}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {feedback.feedback?.accuracy && <p className="text-xs text-surface-200/70"><span className="text-surface-200/50">Accuracy:</span> {feedback.feedback.accuracy}</p>}
                      {feedback.feedback?.completeness && <p className="text-xs text-surface-200/70"><span className="text-surface-200/50">Completeness:</span> {feedback.feedback.completeness}</p>}
                      {feedback.feedback?.clarity && <p className="text-xs text-surface-200/70"><span className="text-surface-200/50">Clarity:</span> {feedback.feedback.clarity}</p>}
                      {feedback.feedback?.missedConcepts?.length > 0 && (
                        <div>
                          <p className="text-[10px] text-surface-200/50 mb-1">Missed Concepts:</p>
                          <div className="flex flex-wrap gap-1">{feedback.feedback.missedConcepts.map(c => <span key={c} className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 text-[10px]">{c}</span>)}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="dash-card p-12 text-center">
                <MessageSquare size={40} className="text-surface-200/15 mx-auto mb-3" />
                <p className="text-sm text-surface-200/40">Select a question from the left to start practicing</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
