import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const COLORS = {
  success: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
  error: 'bg-red-500/15 border-red-500/30 text-red-400',
  warning: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
  info: 'bg-blue-500/15 border-blue-500/30 text-blue-400',
};

export default function ToastContainer({ toasts, dismiss }) {
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 max-w-sm">
      {toasts.map(t => {
        const Icon = ICONS[t.type] || Info;
        return (
          <div
            key={t.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm animate-fade-in-up ${COLORS[t.type] || COLORS.info}`}
          >
            <Icon size={16} className="shrink-0" />
            <span className="text-sm font-medium flex-1">{t.message}</span>
            <button onClick={() => dismiss(t.id)} className="p-1 hover:opacity-70 transition-opacity">
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
