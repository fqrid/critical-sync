import { Bolt, Shield, ServerCrash } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';

const actions = [
  { label: 'Reiniciar Servidores', icon: ServerCrash },
  { label: 'Activar Firewall', icon: Shield },
  { label: 'Aislar Rack', icon: Bolt },
];

export function QuickActions() {
  const runQuickAction = useGameStore((state) => state.runQuickAction);

  return (
    <section className="panel">
      <p className="panel-title">Acciones rápidas</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <button key={action.label} className="cta-button justify-start" onClick={() => runQuickAction(action.label)} type="button">
              <Icon size={16} /> {action.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}