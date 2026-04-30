import { useState, useEffect } from "react";
import {
  Target,
  TrendingUp,
  BookOpen,
  Brain,
  Rocket,
  Medal,
  BarChart3,
  ArrowRight,
  Sparkles
} from "lucide-react";
import OverviewCards from "../components/OverviewCards";
import SkillMatchChart from "../components/SkillMatchChart";
import MissingSkillsTable from "../components/MissingSkillsTable";
import RoiMatrix from "../components/RoiMatrix";
import RoadmapProgress from "../components/RoadmapProgress";
import CareerSimulatorPanel from "../components/CareerSimulatorPanel";
import AiInsightCard from "../components/AiInsightCard";
import MarketDemand from "../components/MarketDemand";
import Roadmap from "../components/Roadmap";
import CareerSimulator from "../components/CareerSimulator";
import Benchmark from "../components/Benchmark";
import Insights from "../components/Insights";

const TABS = [
  { id: "overview", label: "Overview", icon: Target },
  { id: "skills", label: "Skills Gap", icon: BarChart3 },
  { id: "roadmap", label: "Roadmap", icon: BookOpen },
  { id: "market", label: "Market Insights", icon: TrendingUp },
  { id: "simulator", label: "Career Simulator", icon: Rocket },
  { id: "benchmark", label: "Top 10% Benchmark", icon: Medal },
  { id: "insights", label: "AI Insights", icon: Sparkles },
];

export default function Dashboard({ results, activeView, onReset }) {
  const [activeTab, setActiveTab] = useState("overview");

  // Map sidebar navigation to internal tabs
  useEffect(() => {
    const viewToTab = {
      dashboard: "overview",
      roadmap: "roadmap",
      market: "market",
      simulator: "simulator",
      projects: "insights",
      resume: "insights",
      interview: "insights",
    };
    if (viewToTab[activeView]) {
      setActiveTab(viewToTab[activeView]);
    }
  }, [activeView]);

  if (!results) return null;

  return (
    <div className="pt-4 animate-fade-in-up">
      {/* Tab Navigation */}
      <div className="tab-bar mb-6 scrollbar-hide">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-btn flex items-center gap-2 ${isActive ? "active" : ""}`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in" key={activeTab}>
        {activeTab === "overview" && (
          <div className="space-y-5">
            {/* Stat Cards Row */}
            <OverviewCards summary={results.summary} marketData={results.marketData} />

            {/* 3-Column Grid: Missing Skills | ROI Matrix | Roadmap Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <MissingSkillsTable skills={results.missing} marketData={results.marketData} />
              <RoiMatrix marketData={results.marketData} />
              <RoadmapProgress roadmap={results.roadmap} />
            </div>

            {/* Bottom Row: Career Simulator | AI Insight */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2">
                <CareerSimulatorPanel marketData={results.marketData} />
              </div>
              <AiInsightCard insights={results.insights} missing={results.missing} />
            </div>
          </div>
        )}

        {activeTab === "skills" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <SkillMatchChart matched={results.matched} missing={results.missing} />
              <MissingSkillsTable skills={results.missing} marketData={results.marketData} full />
            </div>
          </div>
        )}

        {activeTab === "roadmap" && <Roadmap roadmap={results.roadmap} />}

        {activeTab === "market" && <MarketDemand marketData={results.marketData} />}

        {activeTab === "simulator" && <CareerSimulator marketData={results.marketData} />}

        {activeTab === "benchmark" && <Benchmark benchmark={results.benchmark} resumeSkills={results.resumeSkills} />}

        {activeTab === "insights" && (
          <Insights insights={results.insights} matched={results.matched} missing={results.missing} />
        )}
      </div>
    </div>
  );
}
