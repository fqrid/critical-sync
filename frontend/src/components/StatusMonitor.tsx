import { useMemo } from 'react';
import { useGameStore } from '../store/useGameStore';

function indicatorTone(value: number) {
  if (value >= 80) return 'from-red-500 to-red-300';
  if (value >= 60) return 'from-amber-500 to-orange-300';
  return 'from-emerald-500 to-emerald-300';
}

export function StatusMonitor() {
  const crisis = useGameStore((state) => state.crisis);

  const indicators = useMemo(
    () => [
      { label: 'Temperatura', value: crisis.temperature, unit: '°C' },
      { label: 'CPU', value: crisis.cpu, unit: '%' },
      { label: 'DDoS', value: crisis.ddos, unit: '%' },
    ],
    [crisis],
  );

  return (
    <section className="panel">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="panel-title">Status Monitor</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-100">Telemetry del clúster</h2>
        </div>
        <div className="rounded-full border border-emerald-500/15 bg-emerald-500/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-emerald-200">
          Data Center Online
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {indicators.map((indicator) => (
          <div key={indicator.label} className="rounded-2xl border border-white/5 bg-slate-900/60 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-slate-300">{indicator.label}</p>
              <span className="text-xs uppercase tracking-[0.3em] text-slate-500">{indicator.unit}</span>
            </div>
            <div className="mt-4 flex items-end gap-3">
              <div className={`h-3 w-3 rounded-full bg-gradient-to-r ${indicatorTone(indicator.value)} ${indicator.value >= 80 ? 'animate-pulseSoft' : ''}`} />
              <p className="text-4xl font-semibold text-slate-100">{indicator.value}</p>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${indicatorTone(indicator.value)} transition-all duration-700`}
                style={{ width: `${indicator.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}