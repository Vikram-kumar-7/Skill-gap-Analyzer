import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  FileText,
  Briefcase,
  Sparkles,
  X,
  Loader2,
  AlertCircle,
  Rocket,
  Crosshair
} from "lucide-react";
import { analyzeResume } from "../services/api";

const ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Engineer",
  "Data Scientist",
  "DevOps Engineer"
];

export default function UploadPage({ onAnalysisComplete, aiMode }) {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [targetRole, setTargetRole] = useState(ROLES[2]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      setError("Please upload a valid PDF file (max 10MB).");
      return;
    }
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError("");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const handleSubmit = async () => {
    if (!file) {
      setError("Please upload your resume PDF.");
      return;
    }
    if (!jobDescription.trim()) {
      setError("Please paste the job description.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("jobDescription", jobDescription);
      formData.append("targetRole", targetRole);
      formData.append("aiMode", aiMode);

      const response = await analyzeResume(formData);

      if (response.success) {
        onAnalysisComplete(response.data);
      } else {
        setError(response.error || "Analysis failed. Please try again.");
      }
    } catch (err) {
      console.error("Analysis error:", err);
      setError(
        err.response?.data?.error ||
          "Failed to connect to the server. Make sure the backend is running."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  return (
    <div className="pt-8 sm:pt-16 animate-fade-in-up min-w-0 overflow-hidden">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-400 text-sm font-medium mb-6">
          <Sparkles size={14} />
          {aiMode ? "AI-Powered Career Intelligence" : "Rule-Based Career Intelligence"}
        </div>
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4">
          <span className="text-white">Bridge Your </span>
          <span className="gradient-text">Skill Gap</span>
        </h2>
        <p className="text-surface-200/70 text-lg max-w-2xl mx-auto leading-relaxed">
          Upload your resume, paste a job description, and get an instant
          analysis of missing skills, market demand, ROI scores, and a
          personalized learning roadmap.
        </p>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-400 animate-fade-in">
            <AlertCircle size={18} className="shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Resume Upload */}
          <div className="glass-card p-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
              <FileText size={16} className="text-primary-400" />
              Resume (PDF)
            </label>

            {!file ? (
              <div
                {...getRootProps()}
                id="resume-dropzone"
                className={`
                  relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer
                  transition-all duration-300 group
                  ${
                    isDragActive
                      ? "border-primary-400 bg-primary-500/10"
                      : "border-white/10 hover:border-primary-400/50 hover:bg-white/[0.02]"
                  }
                `}
              >
                <input {...getInputProps()} />
                <div
                  className={`
                  w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all duration-300
                  ${
                    isDragActive
                      ? "bg-primary-500/20 scale-110"
                      : "bg-white/5 group-hover:bg-primary-500/10 group-hover:scale-105"
                  }
                `}
                >
                  <Upload
                    size={28}
                    className={`transition-colors ${
                      isDragActive ? "text-primary-400" : "text-surface-200/50 group-hover:text-primary-400"
                    }`}
                  />
                </div>
                <p className="text-white font-medium mb-1">
                  {isDragActive
                    ? "Drop your resume here..."
                    : "Drag & drop your resume here"}
                </p>
                <p className="text-sm text-surface-200/50">
                  or click to browse • PDF only • Max 10MB
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 rounded-xl bg-success-500/10 border border-success-500/20 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-success-500/20 flex items-center justify-center">
                    <FileText size={20} className="text-success-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white line-clamp-1 break-all">{file.name}</p>
                    <p className="text-xs text-surface-200/50">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={removeFile}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                  id="remove-file-btn"
                >
                  <X size={16} className="text-surface-200/50" />
                </button>
              </div>
            )}
          </div>
          
          {/* Target Role Selector */}
          <div className="glass-card p-6 flex flex-col justify-between">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
                <Crosshair size={16} className="text-success-400" />
                Target Benchmark Role
              </label>
              <p className="text-sm text-surface-200/60 mb-4">
                Select the role you're aiming for to compare your profile against the top 10% of candidates in the market.
              </p>
              
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full bg-surface-800/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-success-400/50 focus:ring-1 focus:ring-success-400/20 transition-all appearance-none cursor-pointer"
              >
                {ROLES.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            <div className="mt-4 p-3 rounded-lg bg-surface-800/50 border border-white/5 text-xs text-surface-200/50">
              Used for Top Candidates Benchmark and Multi-Role Comparison.
            </div>
          </div>
        </div>

        {/* Job Description */}
        <div className="glass-card p-6">
          <label
            htmlFor="job-description"
            className="flex items-center gap-2 text-sm font-semibold text-white mb-4"
          >
            <Briefcase size={16} className="text-accent-400" />
            Job Description
          </label>
          <textarea
            id="job-description"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={8}
            placeholder="Paste the full job description here...&#10;&#10;Example: We're looking for a Full Stack Developer with experience in React, Node.js, TypeScript, AWS, Docker, and PostgreSQL..."
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-surface-200/30 resize-none focus:outline-none focus:border-accent-400/50 focus:ring-1 focus:ring-accent-400/20 transition-all"
          />
          <div className="flex justify-between mt-2">
            <p className="text-xs text-surface-200/40">
              Include required skills, qualifications, and tech stack
            </p>
            <p className="text-xs text-surface-200/40">
              {jobDescription.length} chars
            </p>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={isLoading || !file || !jobDescription.trim()}
          id="analyze-button"
          className={`
            w-full py-4 rounded-2xl font-semibold text-base transition-all duration-300
            flex items-center justify-center gap-3
            ${
              isLoading || !file || !jobDescription.trim()
                ? "bg-white/5 text-surface-200/30 cursor-not-allowed"
                : "bg-gradient-to-r from-primary-600 to-accent-600 text-white hover:shadow-lg hover:shadow-primary-500/25 hover:scale-[1.01] active:scale-[0.99]"
            }
          `}
        >
          {isLoading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Analyzing your resume...
            </>
          ) : (
            <>
              <Rocket size={20} />
              Analyze Skill Gap
            </>
          )}
        </button>

        {/* Features */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          {[
            { label: "Skill Match", value: "AI-Powered" },
            { label: "Market Data", value: "70+ Jobs" },
            { label: "ROI Scores", value: "Real-Time" },
            { label: "Roadmap", value: "Personalized" },
          ].map((feature) => (
            <div
              key={feature.label}
              className="text-center p-3 rounded-xl bg-white/[0.02] border border-white/5 min-w-0 overflow-hidden"
            >
              <p className="text-xs text-surface-200/50 mb-0.5 truncate">
                {feature.label}
              </p>
              <p className="text-sm font-semibold text-white truncate">
                {feature.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
