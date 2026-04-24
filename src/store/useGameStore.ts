import { create } from 'zustand';
import type { Socket } from 'socket.io-client';
import { getSocket } from '../lib/socket';
import { SOCKET_EVENTS } from '../lib/socket-events';

export type PlayerRole = 'monitor' | 'technician';

export type CrisisSignal = {
  temperature: number;
  cpu: number;
  ddos: number;
};

export type CrisisEvent = {
  id: string;
  time: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
};

type SimulatedSocket = {
  id: string | null;
  connectedAt: number | null;
};

type TelemetryPayload = Partial<CrisisSignal>;

type BackendLogPayload = {
  id?: string;
  time?: string;
  severity?: CrisisEvent['severity'] | 'INFO' | 'WARNING' | 'CRITICAL';
  message?: string;
};

type GameState = {
  playerName: string;
  playerRole: PlayerRole | null;
  crisis: CrisisSignal;
  securityCode: string;
  log: CrisisEvent[];
  bridgeCommand: string;
  submittedCode: string;
  socketRef: Socket | null;
  socket: SimulatedSocket | null;
  isSocketOnline: boolean;
  setPlayer: (playerName: string, playerRole: PlayerRole) => void;
  setBridgeCommand: (bridgeCommand: string) => void;
  setSubmittedCode: (submittedCode: string) => void;
  connectSocket: () => void;
  disconnectSocket: () => void;
  joinSession: () => void;
  submitSecurityCode: (code: string) => void;
  abortMission: () => void;
  runQuickAction: (action: string) => void;
  submitBridgeCommand: (command: string) => void;
};

const ROLE_TITLES: Record<PlayerRole, string> = {
  monitor: 'Monitor',
  technician: 'Técnico',
};

const clamp = (value: number) => Math.max(0, Math.min(100, value));

const generateSecurityCode = () => `${Math.floor(100000 + Math.random() * 900000)}`;

const makeEvent = (severity: CrisisEvent['severity'], message: string): CrisisEvent => ({
  id: crypto.randomUUID(),
  time: new Date().toLocaleTimeString('es-ES', { hour12: false }),
  severity,
  message,
});

const createTelemetryEvent = (crisis: CrisisSignal): CrisisEvent => {
  const severity: CrisisEvent['severity'] = crisis.ddos > 80 || crisis.cpu > 85 ? 'critical' : crisis.temperature > 70 ? 'warning' : 'info';

  const message =
    severity === 'critical'
      ? 'Pico crítico detectado en la red de distribución.'
      : severity === 'warning'
        ? 'La carga térmica está subiendo por encima de la tolerancia operativa.'
        : 'Flujo estable. Se mantienen márgenes verdes en la infraestructura.';

  return makeEvent(severity, message);
};

const normalizeSeverity = (severity: BackendLogPayload['severity']): CrisisEvent['severity'] => {
  if (severity === 'CRITICAL' || severity === 'critical') return 'critical';
  if (severity === 'WARNING' || severity === 'warning') return 'warning';
  return 'info';
};

const fromBackendLog = (payload: BackendLogPayload): CrisisEvent =>
  makeEvent(normalizeSeverity(payload.severity), payload.message ?? 'Evento recibido desde servidor.');

const withTelemetry = (current: CrisisSignal, payload: TelemetryPayload): CrisisSignal => ({
  temperature: clamp(payload.temperature ?? current.temperature),
  cpu: clamp(payload.cpu ?? current.cpu),
  ddos: clamp(payload.ddos ?? current.ddos),
});

const initialSecurityCode = generateSecurityCode();

export const useGameStore = create<GameState>((set, get) => ({
  playerName: '',
  playerRole: null,
  crisis: {
    temperature: 42,
    cpu: 34,
    ddos: 18,
  },
  securityCode: initialSecurityCode,
  log: [makeEvent('info', 'Centro de datos en vigilancia preventiva. Telemetría inicial recibida.')],
  bridgeCommand: '',
  submittedCode: '',
  socketRef: null,
  socket: null,
  isSocketOnline: false,
  setPlayer: (playerName, playerRole) =>
    set({
      playerName,
      playerRole,
      securityCode: generateSecurityCode(),
      log: [...get().log, makeEvent('info', `Operador ${playerName} asignado al rol ${ROLE_TITLES[playerRole]}.`)],
    }),
  setBridgeCommand: (bridgeCommand) => set({ bridgeCommand }),
  setSubmittedCode: (submittedCode) => set({ submittedCode }),
  connectSocket: () => {
    const socket = getSocket();

    socket.off(SOCKET_EVENTS.connect);
    socket.off(SOCKET_EVENTS.disconnect);
    socket.off(SOCKET_EVENTS.telemetryUpdate);
    socket.off(SOCKET_EVENTS.logEvent);
    socket.off(SOCKET_EVENTS.securityCode);
    socket.off(SOCKET_EVENTS.missionState);
    socket.off(SOCKET_EVENTS.errorEvent);

    socket.on(SOCKET_EVENTS.connect, () => {
      set({
        isSocketOnline: true,
        socket: {
          id: socket.id ?? null,
          connectedAt: Date.now(),
        },
      });

      get().joinSession();
    });

    socket.on(SOCKET_EVENTS.disconnect, () => {
      set({
        isSocketOnline: false,
        socket: {
          id: null,
          connectedAt: null,
        },
      });
    });

    socket.on(SOCKET_EVENTS.telemetryUpdate, (payload: TelemetryPayload) => {
      set((state) => {
        const next = withTelemetry(state.crisis, payload);
        return {
          crisis: next,
          log: [...state.log.slice(-24), createTelemetryEvent(next)],
        };
      });
    });

    socket.on(SOCKET_EVENTS.logEvent, (payload: BackendLogPayload) => {
      set((state) => ({
        log: [...state.log.slice(-24), fromBackendLog(payload)],
      }));
    });

    socket.on(SOCKET_EVENTS.securityCode, (payload: { code?: string }) => {
      if (!payload?.code) return;
      set({ securityCode: payload.code });
    });

    socket.on(SOCKET_EVENTS.missionState, (payload: { telemetry?: TelemetryPayload; securityCode?: string }) => {
      set((state) => ({
        crisis: payload.telemetry ? withTelemetry(state.crisis, payload.telemetry) : state.crisis,
        securityCode: payload.securityCode ?? state.securityCode,
      }));
    });

    socket.on(SOCKET_EVENTS.errorEvent, (payload: { message?: string }) => {
      set((state) => ({
        log: [...state.log.slice(-24), makeEvent('warning', payload.message ?? 'Se recibió un error de sincronización.')],
      }));
    });

    set({
      socketRef: socket,
      isSocketOnline: socket.connected,
      socket: {
        id: socket.id ?? null,
        connectedAt: socket.connected ? Date.now() : null,
      },
    });

    if (!socket.connected) {
      socket.connect();
    }
  },
  disconnectSocket: () => {
    const socket = get().socketRef;

    if (socket) {
      socket.off(SOCKET_EVENTS.connect);
      socket.off(SOCKET_EVENTS.disconnect);
      socket.off(SOCKET_EVENTS.telemetryUpdate);
      socket.off(SOCKET_EVENTS.logEvent);
      socket.off(SOCKET_EVENTS.securityCode);
      socket.off(SOCKET_EVENTS.missionState);
      socket.off(SOCKET_EVENTS.errorEvent);
      socket.disconnect();
    }

    set({
      socketRef: null,
      socket: null,
      isSocketOnline: false,
    });
  },
  joinSession: () => {
    const { socketRef, playerName, playerRole } = get();

    if (!socketRef || !socketRef.connected || !playerName || !playerRole) return;

    socketRef.emit(SOCKET_EVENTS.joinSession, {
      playerName,
      playerRole,
    });
  },
  submitSecurityCode: (code) => {
    const { socketRef, playerName, playerRole } = get();

    if (!socketRef || !socketRef.connected) return;

    socketRef.emit(SOCKET_EVENTS.submitCode, {
      code,
      playerName,
      playerRole,
    });
  },
  abortMission: () =>
    set((state) => {
      const { socketRef, playerName, playerRole } = get();

      if (socketRef && socketRef.connected) {
        socketRef.emit(SOCKET_EVENTS.abortMission, {
          playerName,
          playerRole,
        });
      }

      get().disconnectSocket();

      return {
        playerName: '',
        playerRole: null,
        crisis: {
          temperature: 42,
          cpu: 34,
          ddos: 18,
        },
        securityCode: generateSecurityCode(),
        bridgeCommand: '',
        submittedCode: '',
        log: [...state.log.slice(-24), makeEvent('warning', 'Misión abortada. Sesión desconectada del servidor.')],
      };
    }),
  runQuickAction: (action) =>
    set((state) => {
      const { socketRef, playerName, playerRole } = get();

      if (socketRef && socketRef.connected) {
        socketRef.emit(SOCKET_EVENTS.quickAction, {
          action,
          playerName,
          playerRole,
        });
      }

      return {
        log: [...state.log.slice(-24), makeEvent('info', `Acción enviada al servidor: ${action}.`)],
      };
    }),
  submitBridgeCommand: (command) => {
    const { socketRef, playerName, playerRole } = get();

    if (socketRef && socketRef.connected) {
      socketRef.emit(SOCKET_EVENTS.commandRun, {
        command: command.trim(),
        playerName,
        playerRole,
      });
    }

    set((state) => ({
      bridgeCommand: '',
      log: [...state.log.slice(-24), makeEvent('info', `Comando enviado: ${command.trim()}`)],
    }));
  },
}));