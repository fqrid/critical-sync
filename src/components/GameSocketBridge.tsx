import { useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';

export function GameSocketBridge() {
  const connectSocket = useGameStore((state) => state.connectSocket);
  const disconnectSocket = useGameStore((state) => state.disconnectSocket);
  const joinSession = useGameStore((state) => state.joinSession);
  const playerName = useGameStore((state) => state.playerName);
  const playerRole = useGameStore((state) => state.playerRole);
  const roomId = useGameStore((state) => state.roomId);
  const isSocketOnline = useGameStore((state) => state.isSocketOnline);

  useEffect(() => {
    connectSocket();

    return () => {
      disconnectSocket();
    };
  }, [connectSocket, disconnectSocket]);

  useEffect(() => {
    if (isSocketOnline && playerName && playerRole && roomId) {
      joinSession();
    }
  }, [isSocketOnline, joinSession, playerName, playerRole, roomId]);

  return null;
}