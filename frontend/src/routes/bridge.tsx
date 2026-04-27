import { KeyRound, TerminalSquare } from 'lucide-react';
import { FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuickActions } from '../components/QuickActions';
import { useGameStore } from '../store/useGameStore';

export function BridgeRoute() {
  const navigate = useNavigate();
  const securityCode = useGameStore((state) => state.securityCode);
  const bridgeCommand = useGameStore((state) => state.bridgeCommand);
  const submittedCode = useGameStore((state) => state.submittedCode);
  const setBridgeCommand = useGameStore((state) => state.setBridgeCommand);
  const setSubmittedCode = useGameStore((state) => state.setSubmittedCode);
  const submitBridgeCommand = useGameStore((state) => state.submitBridgeCommand);
  const submitSecurityCode = useGameStore((state) => state.submitSecurityCode);
  const playerRole = useGameStore((state) => state.playerRole);
  const lastCodeResult = useGameStore((state) => state.lastCodeResult);

  const handleCommand = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (bridgeCommand.trim()) {
      submitBridgeCommand(bridgeCommand);
    }
  };

  const validateCode = () => {
    submitSecurityCode(submittedCode);
  };

  useEffect(() => {
    if (lastCodeResult?.ok) {
      navigate('/ops/monitor');
    }
  }, [lastCodeResult, navigate]);

  return (
    <div className="grid gap-6">
      <section className="panel">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-300">
            <TerminalSquare size={20} />
          </div>
          <div>
            <p className="panel-title">Terminal de comandos</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-100">Bridge de contención</h2>
          </div>
        </div>

        <form className="grid gap-3" onSubmit={handleCommand}>
          <label className="grid gap-2">
            <span className="text-sm text-slate-400">Línea de comando</span>
            <input
              className="input-shell font-mono"
              onChange={(event) => setBridgeCommand(event.target.value)}
              placeholder='Ej: patch firewall --zone east --mode strict'
              value={bridgeCommand}
            />
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <button className="cta-button" type="submit">
              Ejecutar comando
            </button>
            <span className="text-sm text-slate-400">Sesión activa para {playerRole === 'technician' ? 'técnicos' : 'monitores'}</span>
          </div>
        </form>
      </section>

      <QuickActions />

      <section className="panel">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-300">
            <KeyRound size={20} />
          </div>
          <div>
            <p className="panel-title">Código dictado</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-100">Validación de acceso</h2>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            className="input-shell tracking-[0.45em]"
            onChange={(event) => setSubmittedCode(event.target.value.replace(/\s+/g, ''))}
            placeholder="------"
            value={submittedCode}
          />
          <button className="cta-button" type="button" onClick={validateCode}>
            Verificar código
          </button>
        </div>
        <p className="mt-4 text-sm text-slate-400">El Monitor dicta el código de seguridad para habilitar la coordinación de maniobras.</p>
        {lastCodeResult ? (
          <p className={`mt-3 text-sm ${lastCodeResult.ok ? 'text-emerald-300' : 'text-red-300'}`}>
            {lastCodeResult.message}
          </p>
        ) : null}
      </section>
    </div>
  );
}