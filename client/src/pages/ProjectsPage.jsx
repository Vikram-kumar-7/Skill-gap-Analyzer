import { useState, useEffect } from "react";
import {
  FolderCode, ExternalLink, CheckCircle2, Plus, Rocket,
  Clock, Star, Sparkles, Copy, ChevronDown, ChevronUp, X, Globe
} from "lucide-react";
import { getUserProjects, addUserProject, setUserProjects, getPortfolio, setPortfolio } from "../utils/store";
import { fireConfetti } from "../utils/confetti";
import axios from "axios";

function ProjectCard({ project, userProject, onStart, onComplete, onToggleMilestone, activeAnalysis }) {
  const [expanded, setExpanded] = useState(false);
  const missing = activeAnalysis?.missing || [];
  const coverSkills = (project.techStack || project.focusSkills || []);
  const gapsClosed = coverSkills.filter(s => missing.some(m => m.toLowerCase() === s.toLowerCase())).length;
  const isStarted = !!userProject;
  const isDone = userProject?.status === "done";

  return (
    <div className={`dash-card p-4 ${isDone ? "ring-1 ring-emerald-500/20" : ""}`}>
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-semibold text-white">{project.title}</h3>
        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${project.difficulty === "Hard" ? "bg-red-500/15 text-red-400" : project.difficulty === "Medium" ? "bg-amber-500/15 text-amber-400" : "bg-emerald-500/15 text-emerald-400"}`}>
          {project.difficulty || "Medium"}
        </span>
      </div>

      <p className="text-xs text-surface-200/60 mb-3 leading-relaxed">{project.description || project.desc}</p>

      {/* Tech stack / skills badges */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {coverSkills.slice(0, 5).map(s => (
          <span key={s} className="px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-400 text-[10px] font-medium">{s}</span>
        ))}
      </div>

      {gapsClosed > 0 && (
        <p className="text-[11px] text-emerald-400 mb-3">✨ Closes {gapsClosed} gap{gapsClosed > 1 ? "s" : ""} in your profile</p>
      )}

      {project.estimatedHours && (
        <p className="text-[11px] text-surface-200/40 flex items-center gap-1 mb-3"><Clock size={10} /> ~{project.estimatedHours}h build time</p>
      )}

      {/* Milestones */}
      {expanded && project.milestones && (
        <div className="mt-3 pt-3 border-t border-white/[0.04] space-y-1.5">
          {project.milestones.map((m, i) => (
            <label key={i} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={!!userProject?.milestones?.[i]} onChange={() => onToggleMilestone(project.title, i)}
                className="w-3.5 h-3.5 rounded border border-white/20 bg-transparent checked:bg-primary-500 checked:border-primary-500 appearance-none cursor-pointer relative
                  after:content-['✓'] after:text-white after:text-[9px] after:absolute after:inset-0 after:flex after:items-center after:justify-center after:opacity-0 checked:after:opacity-100" />
              <span className={`text-xs ${userProject?.milestones?.[i] ? "text-surface-200/40 line-through" : "text-surface-200/70"}`}>{m}</span>
            </label>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/[0.04]">
        {project.milestones && (
          <button onClick={() => setExpanded(!expanded)} className="text-[11px] text-primary-400 hover:text-primary-300 flex items-center gap-1">
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {expanded ? "Hide" : "Milestones"}
          </button>
        )}
        <div className="flex-1" />
        {!isStarted && (
          <button onClick={() => onStart(project)} className="px-3 py-1.5 rounded-lg bg-primary-500/15 text-primary-400 text-[11px] font-medium hover:bg-primary-500/25">
            Start Project
          </button>
        )}
        {isStarted && !isDone && (
          <button onClick={() => onComplete(project.title)} className="px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 text-[11px] font-medium hover:bg-emerald-500/25">
            Mark Done
          </button>
        )}
        {isDone && <span className="text-[11px] text-emerald-400 flex items-center gap-1"><CheckCircle2 size={12} /> Done</span>}
      </div>
    </div>
  );
}

function PortfolioSection({ toast }) {
  const [portfolio, setPortfolioState] = useState(getPortfolio());
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", liveUrl: "", githubUrl: "", skills: "" });

  const handleAdd = () => {
    if (!form.name) return;
    const updated = [...portfolio, { ...form, skills: form.skills.split(",").map(s => s.trim()).filter(Boolean), id: Date.now() }];
    setPortfolio(updated);
    setPortfolioState(updated);
    setForm({ name: "", liveUrl: "", githubUrl: "", skills: "" });
    setAdding(false);
    toast?.("Added to portfolio!", "success");
  };

  return (
    <div className="dash-card p-4 mt-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Globe size={14} className="text-emerald-400" /> Portfolio
        </h3>
        <button onClick={() => setAdding(!adding)} className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
          <Plus size={12} /> Add
        </button>
      </div>

      {adding && (
        <div className="space-y-2 mb-4 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
          <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Project name"
            className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-white placeholder-surface-200/30 focus:outline-none" />
          <div className="grid grid-cols-2 gap-2">
            <input value={form.liveUrl} onChange={e => setForm(p => ({ ...p, liveUrl: e.target.value }))} placeholder="Live URL"
              className="px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-white placeholder-surface-200/30 focus:outline-none" />
            <input value={form.githubUrl} onChange={e => setForm(p => ({ ...p, githubUrl: e.target.value }))} placeholder="GitHub URL"
              className="px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-white placeholder-surface-200/30 focus:outline-none" />
          </div>
          <input value={form.skills} onChange={e => setForm(p => ({ ...p, skills: e.target.value }))} placeholder="Skills (comma-separated)"
            className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-white placeholder-surface-200/30 focus:outline-none" />
          <button onClick={handleAdd} className="px-4 py-2 rounded-lg bg-primary-500 text-white text-xs font-semibold">Add to Portfolio</button>
        </div>
      )}

      {portfolio.length === 0 ? (
        <p className="text-xs text-surface-200/40 text-center py-4">No portfolio projects yet</p>
      ) : (
        <div className="space-y-2">
          {portfolio.map(p => (
            <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02]">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">{p.name}</p>
                <div className="flex gap-1 mt-0.5">{(p.skills || []).slice(0, 3).map(s => <span key={s} className="text-[9px] text-primary-400">{s}</span>)}</div>
              </div>
              {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="text-surface-200/40 hover:text-white"><Globe size={13} /></a>}
              {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className="text-surface-200/40 hover:text-white"><ExternalLink size={13} /></a>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProjectsPage({ activeAnalysis, settings, toast }) {
  const [serverProjects, setServerProjects] = useState({});
  const [userProjects, setUserProjectsState] = useState(getUserProjects());
  const [generating, setGenerating] = useState(false);
  const [aiProject, setAiProject] = useState(null);

  useEffect(() => {
    fetch("/api/data/projects").then(r => r.json()).then(d => setServerProjects(d)).catch(() => {});
  }, []);

  // Build project list from server data + AI recommendations
  const projectList = [];
  const insights = activeAnalysis?.insights || {};
  if (insights.recommendedProjects) {
    insights.recommendedProjects.forEach(p => projectList.push({ ...p, title: p.title, description: p.desc, techStack: p.focusSkills || [], difficulty: "Medium", milestones: ["Set up project", "Build core features", "Add styling", "Test and debug", "Deploy"] }));
  }
  Object.entries(serverProjects).forEach(([skill, projects]) => {
    projects.forEach(p => {
      if (!projectList.find(x => x.title === p.title)) {
        projectList.push({ ...p, title: p.title, description: p.desc, techStack: [skill], difficulty: p.difficulty, milestones: ["Set up project", "Build core features", "Add styling", "Test and debug", "Deploy"] });
      }
    });
  });
  if (aiProject) projectList.unshift(aiProject);

  const handleStart = (project) => {
    addUserProject({ title: project.title, techStack: project.techStack });
    setUserProjectsState(getUserProjects());
    toast?.(`Started: ${project.title}`, "success");
  };

  const handleComplete = (title) => {
    const updated = getUserProjects().map(p => p.title === title ? { ...p, status: "done", completedDate: new Date().toISOString() } : p);
    setUserProjects(updated);
    setUserProjectsState(updated);
    fireConfetti();
    toast?.(`🎉 Completed: ${title}!`, "success");
  };

  const handleToggleMilestone = (title, idx) => {
    const updated = getUserProjects().map(p => {
      if (p.title === title) {
        const milestones = { ...p.milestones, [idx]: !p.milestones?.[idx] };
        return { ...p, milestones };
      }
      return p;
    });
    setUserProjects(updated);
    setUserProjectsState(updated);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const matched = activeAnalysis?.matched || [];
      const { data } = await axios.post("/api/ai/generate-project", {
        skills: matched.slice(0, 5),
        targetRole: activeAnalysis?.targetRole || "Full Stack Engineer",
        apiKey: settings?.apiKey || "",
      });
      setAiProject({
        ...data,
        techStack: data.techStack || [],
        milestones: data.milestones || ["Set up project", "Build core", "Polish", "Deploy"],
      });
      toast?.("Project generated!", "success");
    } catch {
      toast?.("Failed to generate project", "error");
    }
    setGenerating(false);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <FolderCode size={22} className="text-primary-400" /> Projects
        </h2>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-500/20 text-violet-400 text-xs font-semibold hover:bg-violet-500/30 transition-colors disabled:opacity-40"
        >
          <Sparkles size={14} /> {generating ? "Generating..." : "AI Generate Project"}
        </button>
      </div>

      {projectList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
            <FolderCode size={28} className="text-surface-200/20" />
          </div>
          <p className="text-sm text-surface-200/40 text-center max-w-xs">Run an analysis to get project recommendations, or generate one with AI.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projectList.slice(0, 12).map((p, i) => (
            <ProjectCard
              key={p.title + i}
              project={p}
              userProject={userProjects.find(up => up.title === p.title)}
              onStart={handleStart}
              onComplete={handleComplete}
              onToggleMilestone={handleToggleMilestone}
              activeAnalysis={activeAnalysis}
            />
          ))}
        </div>
      )}

      <PortfolioSection toast={toast} />
    </div>
  );
}
