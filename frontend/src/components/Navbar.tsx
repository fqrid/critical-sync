import { AlertTriangle, Cpu, Shield, Terminal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';

export function Navbar() {
  const navigate = useNavigate();
  const playerName = useGameStore((state) => state.playerName);
  const playerRole = useGameStore((state) => state.playerRole);
  const roomId = useGameStore((state) => state.roomId);
  const abortMission = useGameStore((state) => state.abortMission);

  return (
    <header className="border-b border-emerald-500/15 bg-slate-950/90 px-4 py-4 backdrop-blur md:px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 shadow-neon">
            <Shield size={20} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/70">Crisis Control Center</p>
            <h1 className="text-lg font-semibold text-slate-100">Gestión de Data Center</h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
          <div className="rounded-full border border-emerald-500/15 bg-slate-900/80 px-4 py-2">
            <span className="text-slate-400">Operador:</span> {playerName || 'Sin asignar'}
          </div>
          <div className="rounded-full border border-emerald-500/15 bg-slate-900/80 px-4 py-2">
            <span className="text-slate-400">Rol:</span> {playerRole === 'monitor' ? 'Monitor' : playerRole === 'technician' ? 'Técnico' : 'Pendiente'}
          </div>
          <div className="rounded-full border border-emerald-500/15 bg-slate-900/80 px-4 py-2">
            <span className="text-slate-400">Sala:</span> {roomId || 'Sin sala'}
          </div>
          <button
            className="danger-button"
            onClick={() => {
              abortMission();
              navigate('/');
            }}
            type="button"
          >
            <AlertTriangle size={16} /> Abortar
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-500">
          <Cpu size={14} />
          Operaciones activas
          <Terminal size={14} />
        </div>
      </div>
    </header>
  );
}