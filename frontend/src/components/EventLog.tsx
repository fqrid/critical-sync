import { useGameStore } from '../store/useGameStore';

const toneMap = {
  info: 'text-emerald-300',
  warning: 'text-amber-300',
  critical: 'text-red-300',
} as const;

export function EventLog() {
  const log = useGameStore((state) => state.log);

  return (
    <section className="panel">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="panel-title">Log en tiempo real</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-100">Eventos del sistema</h2>
        </div>
        <span className="rounded-full border border-white/10 bg-slate-900/70 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-400">
          Live Feed
        </span>
      </div>

      <div className="max-h-[320px] space-y-3 overflow-auto pr-1">
        {log.slice().reverse().map((entry) => (
          <article key={entry.id} className="rounded-xl border border-white/5 bg-slate-900/70 px-4 py-3">
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.25em] text-slate-500">
              <span>{entry.time}</span>
              <span className={toneMap[entry.severity]}>{entry.severity}</span>
            </div>
            <p className="mt-2 text-sm text-slate-200">{entry.message}</p>
          </article>
        ))}
      </div>
    </section>
  );
}