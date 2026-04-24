import { Copy, Lock } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';

export function SecurityCodePanel() {
  const securityCode = useGameStore((state) => state.securityCode);

  return (
    <section className="panel">
      <p className="panel-title">Código de seguridad</p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-2xl font-semibold tracking-[0.45em] text-emerald-200">
          <Lock size={18} /> {securityCode}
        </div>
        <button
          className="cta-button"
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(securityCode);
          }}
        >
          <Copy size={16} /> Copiar
        </button>
      </div>
      <p className="mt-4 text-sm text-slate-400">El técnico debe dictar este código para autorizar maniobras de contención.</p>
    </section>
  );
}