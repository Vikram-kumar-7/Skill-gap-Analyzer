import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Home } from "lucide-react";

export default function CareerSimulatorPanel({ marketData }) {
  // Generate mock chart data simulating growth over 12 months
  const data = [];
  let currentBase = 8; // Starting at 8 LPA
  let optimizedBase = 8;

  for (let i = 0; i <= 12; i += 3) {
    data.push({
      month: i,
      current: parseFloat(currentBase.toFixed(1)),
      optimized: parseFloat(optimizedBase.toFixed(1)),
    });
    
    // Growth rates
    currentBase += 0.5; // Slow growth
    optimizedBase += i < 6 ? 1.5 : 2.0; // Fast growth after learning skills
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="dash-card px-3 py-2 text-xs">
          <p className="text-white font-medium mb-1">Month {label}</p>
          <div className="space-y-1">
            <p className="text-surface-200/60">Current: <span className="text-primary-400 font-bold">{payload[0].value} LPA</span></p>
            <p className="text-surface-200/60">Optimized: <span className="text-success-400 font-bold">{payload[1].value} LPA</span></p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dash-card p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-6 h-6 rounded bg-primary-500/20 flex items-center justify-center border border-primary-500/30">
          <Home size={12} className="text-primary-400" />
        </div>
        <h3 className="text-[15px] font-semibold text-white">Career Simulator</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1">
        
        {/* Left Side: Controls & Summary */}
        <div className="md:col-span-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-medium text-surface-200/60 block mb-1.5">Target Role</label>
              <select className="w-full bg-surface-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary-500/50 appearance-none">
                <option>Full Stack Developer</option>
                <option>Frontend Engineer</option>
                <option>Backend Engineer</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-medium text-surface-200/60 block mb-1.5">Experience Level</label>
              <select className="w-full bg-surface-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary-500/50 appearance-none">
                <option>2-3 Years</option>
                <option>Entry Level</option>
                <option>Senior (4+ Years)</option>
              </select>
            </div>
            <button className="w-full py-2.5 rounded-lg bg-gradient-to-r from-primary-600 to-accent-600 text-white text-xs font-semibold hover:brightness-110 transition-all mt-2 shadow-lg shadow-primary-500/20">
              Simulate My Growth
            </button>
          </div>
        </div>

        {/* Right Side: Chart & Stats */}
        <div className="md:col-span-8 flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[11px] font-medium text-surface-200/60 mb-1">After 12 Months of Learning</p>
              <div className="flex gap-6">
                <div>
                  <p className="text-[10px] text-surface-200/40 uppercase tracking-wider mb-0.5">Expected Salary</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-white">₹14.2 <span className="text-sm font-normal text-surface-200/60">LPA</span></span>
                    <span className="text-[10px] font-bold text-success-400 bg-success-500/10 px-1.5 py-0.5 rounded">+42%</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-surface-200/40 uppercase tracking-wider mb-0.5">Hireability Score</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-white">89%</span>
                    <span className="text-[10px] font-bold text-success-400 bg-success-500/10 px-1.5 py-0.5 rounded">+35%</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-surface-200/40 uppercase tracking-wider mb-0.5">Skill Match</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-white">94%</span>
                    <span className="text-[10px] font-bold text-success-400 bg-success-500/10 px-1.5 py-0.5 rounded">+22%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-[160px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: "#64748b", fontSize: 10 }} 
                  axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: "#64748b", fontSize: 10 }} 
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${val} LPA`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="current" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#3b82f6", strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="optimized" 
                  stroke="#22c55e" 
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#22c55e", strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Chart Legend positioned manually at bottom right */}
            <div className="absolute bottom-6 right-2 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-primary-500" />
                <span className="text-[10px] text-primary-400">Your Current Path</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-success-500 flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-success-500 absolute" />
                </div>
                <span className="text-[10px] text-success-400">Optimized Path</span>
              </div>
            </div>
            
            {/* Months label */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] text-surface-200/40">Months</div>
          </div>
        </div>

      </div>
    </div>
  );
}
