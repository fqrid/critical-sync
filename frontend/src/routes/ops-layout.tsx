import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';

export function OpsLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/70">Routing layer</p>
            <h2 className="mt-2 text-3xl font-semibold">{location.pathname.includes('bridge') ? 'Bridge operativa' : 'Monitor de crisis'}</h2>
          </div>
          <div className="rounded-full border border-emerald-500/15 bg-slate-900/80 px-4 py-2 text-sm text-slate-300">
            Sistema orientado a {location.pathname.includes('bridge') ? 'técnicos' : 'monitores'}
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
}