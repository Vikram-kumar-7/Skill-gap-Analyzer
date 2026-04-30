import { useState } from "react";
import { Rocket, Clock, DollarSign, Target, Plus, Check } from "lucide-react";

export default function CareerSimulator({ marketData }) {
  const [selectedSkills, setSelectedSkills] = useState([]);

  if (!marketData || marketData.length === 0) {
    return <div className="glass-card p-6 text-center text-surface-200/50">Not enough data to simulate career path.</div>;
  }

  const toggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  // Calculate simulated outcomes
  const baseSalary = 80000;
  
  let additionalSalary = 0;
  let totalWeeks = 0;
  let demandBoost = 0;

  selectedSkills.forEach(skillName => {
    const data = marketData.find(m => m.skill === skillName);
    if (data) {
      // Simulate salary bump based on growth and difficulty
      const bump = (data.salary?.avgSalary || 100000) * 0.05 * (data.difficulty / 3);
      additionalSalary += bump;
      
      // Calculate weeks
      totalWeeks += data.difficulty * 2;
      
      // Calculate demand boost
      demandBoost += (data.demand * 0.1);
    }
  });

  const simulatedSalary = baseSalary + additionalSalary;
  const simulatedSalaryK = (simulatedSalary / 1000).toFixed(0);

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <Rocket className="text-accent-400" />
          Career Path Simulator
        </h3>
        <p className="text-sm text-surface-200/60 mb-6">
          Select skills to learn and instantly see the simulated impact on your market value and hireability.
        </p>

        {/* Simulator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Skill Selector (Left) */}
          <div className="lg:col-span-7 bg-surface-800/50 rounded-2xl border border-white/5 p-5">
            <h4 className="text-sm font-semibold text-white mb-4">Target Skills to Learn</h4>
            <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto pr-2">
              {marketData.map((item) => {
                const isSelected = selectedSkills.includes(item.skill);
                return (
                  <button
                    key={item.skill}
                    onClick={() => toggleSkill(item.skill)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isSelected 
                        ? "bg-accent-500/20 border-accent-500/50 text-accent-300 border" 
                        : "bg-white/5 border-transparent text-surface-200 hover:bg-white/10 border"
                    }`}
                  >
                    {isSelected ? <Check size={12} /> : <Plus size={12} />}
                    <span className="capitalize">{item.skill}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Outcome Panel (Right) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            
            <div className="glass-card bg-gradient-to-br from-success-500/10 to-transparent p-5 border border-success-500/20">
              <p className="text-xs text-success-400 font-semibold mb-1 uppercase tracking-wider">Projected Salary</p>
              <div className="flex items-baseline gap-1 text-white">
                <span className="text-3xl font-bold">${simulatedSalaryK}k</span>
                <span className="text-sm text-surface-200/50">/ year</span>
              </div>
              <p className="text-xs text-surface-200/50 mt-2">
                +{((additionalSalary / baseSalary) * 100).toFixed(1)}% increase from baseline
              </p>
            </div>

            <div className="glass-card bg-gradient-to-br from-primary-500/10 to-transparent p-5 border border-primary-500/20">
              <p className="text-xs text-primary-400 font-semibold mb-1 uppercase tracking-wider">Estimated Time</p>
              <div className="flex items-center gap-2 text-white">
                <Clock size={24} className="text-primary-400" />
                <span className="text-2xl font-bold">{totalWeeks} weeks</span>
              </div>
              <p className="text-xs text-surface-200/50 mt-2">
                Dedicated learning at ~10hrs/week
              </p>
            </div>

            <div className="glass-card bg-gradient-to-br from-warning-500/10 to-transparent p-5 border border-warning-500/20">
              <p className="text-xs text-warning-400 font-semibold mb-1 uppercase tracking-wider">Market Hireability</p>
              <div className="flex items-center gap-2 text-white">
                <Target size={24} className="text-warning-400" />
                <span className="text-2xl font-bold">+{Math.min(demandBoost, 100).toFixed(1)}%</span>
              </div>
              <p className="text-xs text-surface-200/50 mt-2">
                Increase in profile visibility to recruiters
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
