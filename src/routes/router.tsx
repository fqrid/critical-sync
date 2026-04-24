import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import { BridgeRoute } from './bridge';
import { LobbyRoute } from './lobby';
import { MonitorRoute } from './monitor';
import { OpsLayout } from './ops-layout';

function ProtectedOps() {
  const playerName = useGameStore((state) => state.playerName);
  const playerRole = useGameStore((state) => state.playerRole);

  if (!playerName || !playerRole) {
    return <Navigate to="/" replace />;
  }

  return <OpsLayout />;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LobbyRoute />,
  },
  {
    path: '/ops',
    element: <ProtectedOps />,
    children: [
      { index: true, element: <Navigate to="monitor" replace /> },
      { path: 'monitor', element: <MonitorRoute /> },
      { path: 'bridge', element: <BridgeRoute /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);