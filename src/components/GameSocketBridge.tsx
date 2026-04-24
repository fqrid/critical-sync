import { useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';

export function GameSocketBridge() {
  const connectSocket = useGameStore((state) => state.connectSocket);
  const disconnectSocket = useGameStore((state) => state.disconnectSocket);
  const joinSession = useGameStore((state) => state.joinSession);
  const playerName = useGameStore((state) => state.playerName);
  const playerRole = useGameStore((state) => state.playerRole);
  const isSocketOnline = useGameStore((state) => state.isSocketOnline);

  useEffect(() => {
    connectSocket();

    return () => {
      disconnectSocket();
    };
  }, [connectSocket, disconnectSocket]);

  useEffect(() => {
    if (isSocketOnline && playerName && playerRole) {
      joinSession();
    }
  }, [isSocketOnline, joinSession, playerName, playerRole]);

  return null;
}