import { Shield, User2 } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type PlayerRole, useGameStore } from '../store/useGameStore';

const generateRoomId = () => `ROOM-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

export function LobbyRoute() {
  const navigate = useNavigate();
  const setPlayer = useGameStore((state) => state.setPlayer);
  const [playerName, setPlayerName] = useState('');
  const [playerRole, setPlayerRole] = useState<PlayerRole>('monitor');
  const [roomId, setRoomId] = useState(generateRoomId());

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!playerName.trim()) {
      return;
    }

    setPlayer(playerName.trim(), playerRole, roomId.trim().toUpperCase());
    navigate(`/ops/${playerRole === 'monitor' ? 'monitor' : 'bridge'}`);
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-10 text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_35%)]" />
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-emerald-500/20 bg-slate-950/90 shadow-2xl shadow-emerald-950/30">
        <div className="border-b border-white/5 px-6 py-5">
          <p className="text-xs uppercase tracking-[0.45em] text-emerald-300/70">Crisis Control Center</p>
          <h1 className="mt-3 text-4xl font-semibold">Data Center Management</h1>
          <p className="mt-3 max-w-xl text-sm text-slate-400">
            Ingreso al núcleo operativo. Elige el rol y entra al tablero de contingencia asimétrico.
          </p>
        </div>

        <form className="grid gap-5 px-6 py-6" onSubmit={handleSubmit}>
          <label className="grid gap-2">
            <span className="text-sm text-slate-300">Nombre del operador</span>
            <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-slate-900/80 px-4 py-3">
              <User2 size={18} className="text-emerald-300" />
              <input
                className="w-full bg-transparent text-slate-100 outline-none placeholder:text-slate-500"
                onChange={(event) => setPlayerName(event.target.value)}
                placeholder="Pon aqui tu nombre..."
                value={playerName}
              />
            </div>
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-slate-300">Sala compartida</span>
            <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-slate-900/80 px-4 py-3">
              <Shield size={18} className="text-emerald-300" />
              <input
                className="w-full bg-transparent uppercase tracking-[0.2em] text-slate-100 outline-none placeholder:text-slate-500"
                onChange={(event) => setRoomId(event.target.value)}
                placeholder="ROOM-1234ABCD"
                value={roomId}
              />
            </div>
            <p className="text-xs text-slate-500">
              Usa el mismo código en dos navegadores distintos para compartir la misma crisis.
            </p>
          </label>

          <div className="grid gap-2">
            <span className="text-sm text-slate-300">Rol de misión</span>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                { value: 'monitor', label: 'Monitor', description: 'Solo lectura, vigilancia y códigos.' },
                { value: 'technician', label: 'Técnico', description: 'Acciones, terminal y contención.' },
              ].map((option) => (
                <button
                  key={option.value}
                  className={`rounded-2xl border p-4 text-left transition ${playerRole === option.value ? 'border-emerald-400 bg-emerald-500/10 shadow-neon' : 'border-white/10 bg-slate-900/70 hover:border-emerald-500/30'}`}
                  onClick={() => setPlayerRole(option.value as PlayerRole)}
                  type="button"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-lg font-semibold text-slate-100">{option.label}</span>
                    <Shield size={18} className={playerRole === option.value ? 'text-emerald-300' : 'text-slate-500'} />
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{option.description}</p>
                </button>
              ))}
            </div>
          </div>

          <button className="cta-button w-full py-3.5 text-base" type="submit">
            Ingresar a operaciones
          </button>
        </form>
      </div>
    </main>
  );
}