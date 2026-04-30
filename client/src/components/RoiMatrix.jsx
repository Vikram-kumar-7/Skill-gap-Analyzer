import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";

export default function RoiMatrix({ marketData }) {
  if (!marketData || marketData.length === 0) {
    return (
      <div className="dash-card p-6 flex items-center justify-center min-h-[300px]">
        <p className="text-sm text-surface-200/50">Not enough data for ROI Matrix</p>
      </div>
    );
  }

  // Transform data for scatter plot
  // X: Difficulty (Low to High -> 1 to 5)
  // Y: Demand (Low to High -> 0 to 100)
  // Z (Size): ROI Score
  const data = marketData.slice(0, 8).map(m => ({
    name: m.skill,
    difficulty: m.difficulty,
    demand: m.demand,
    roi: m.roi,
  }));

  const getColor = (roi) => {
    if (roi >= 50) return "#22c55e"; // High (Green)
    if (roi >= 30) return "#eab308"; // Medium (Yellow)
    return "#ef4444"; // Low (Red)
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="dash-card px-3 py-2 text-xs border border-white/10 shadow-xl">
          <p className="text-white font-bold capitalize mb-1">{d.name}</p>
          <div className="space-y-0.5">
            <p className="text-surface-200/60">Demand: <span className="text-white">{d.demand}%</span></p>
            <p className="text-surface-200/60">Difficulty: <span className="text-white">{d.difficulty}/5</span></p>
            <p className="text-surface-200/60">ROI: <span className="text-white font-bold">{d.roi}</span></p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dash-card p-6 flex flex-col h-full relative">
      <h3 className="text-[15px] font-semibold text-white mb-2">ROI Matrix <span className="text-[12px] font-normal text-surface-200/50">(High Impact Skills)</span></h3>

      {/* Axis Labels Container */}
      <div className="flex-1 mt-4 relative pb-6 pl-6">
        
        {/* Y Axis Label */}
        <div className="absolute left-0 top-0 bottom-6 w-6 flex flex-col items-center justify-between text-[9px] text-surface-200/40 uppercase tracking-widest py-2">
          <span className="-rotate-90 whitespace-nowrap mt-4">High Demand</span>
          <span className="-rotate-90 whitespace-nowrap mb-4">Low Demand</span>
        </div>

        {/* X Axis Label */}
        <div className="absolute left-6 right-0 bottom-0 h-6 flex items-center justify-between text-[9px] text-surface-200/40 uppercase tracking-widest px-2">
          <span>Low Difficulty</span>
          <span>High Difficulty</span>
        </div>

        {/* Chart */}
        <div className="w-full h-full min-h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                type="number" 
                dataKey="difficulty" 
                domain={[0, 6]} 
                tick={false} 
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }} 
              />
              <YAxis 
                type="number" 
                dataKey="demand" 
                domain={[0, 100]} 
                tick={false} 
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }} 
              />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
              <Scatter data={data}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.roi)} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Custom Labels overlay (approximating Recharts label feature for better control) */}
        <div className="absolute inset-0 pointer-events-none pl-6 pb-6 overflow-hidden">
           {/* Not doing manual positioning as ResponsiveContainer handles scaling, Recharts standard labels are fine but complex. 
               Scatter doesn't support easy labels out of box without custom shapes, so we rely on tooltip. */}
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-2 pt-4 border-t border-white/[0.04]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success-500" />
          <span className="text-[10px] text-surface-200/60">High ROI</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-warning-500" />
          <span className="text-[10px] text-surface-200/60">Medium ROI</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-danger-500" />
          <span className="text-[10px] text-surface-200/60">Low ROI</span>
        </div>
      </div>
    </div>
  );
}
