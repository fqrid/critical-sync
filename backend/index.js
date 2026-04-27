import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import swaggerUi from 'swagger-ui-express';

const PORT = Number(process.env.PORT ?? 3001);

const app = express();
app.use(express.json());

const ROOM_STATUS = {
  ACTIVE: 'active',
  STABILIZED: 'stabilized',
};

const clamp = (value) => Math.max(0, Math.min(100, value));
const generateSecurityCode = () => `${Math.floor(100000 + Math.random() * 900000)}`;
const generateEventId = () => crypto.randomUUID();

const rooms = new Map();

const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Crisis Control Center Backend',
    version: '1.0.0',
    description: 'Backend Socket.IO para gestión de crisis asimétrica por salas.',
  },
  servers: [{ url: `http://localhost:${PORT}` }],
  paths: {
    '/health': {
      get: {
        summary: 'Health check del servidor',
        responses: {
          200: {
            description: 'Servidor saludable',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ok: { type: 'boolean' },
                    service: { type: 'string' },
                    uptimeSeconds: { type: 'integer' },
                    rooms: { type: 'integer' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

const createRoomState = (roomId) => ({
  roomId,
  status: ROOM_STATUS.ACTIVE,
  securityCode: generateSecurityCode(),
  telemetry: {
    temperature: 42,
    cpu: 34,
    ddos: 18,
  },
  criticalRaised: false,
});

const getRoom = (roomId) => {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, createRoomState(roomId));
  }

  return rooms.get(roomId);
};

const getRoomSocketCount = (roomId) => io.sockets.adapter.rooms.get(roomId)?.size ?? 0;

const getSeverity = (telemetry) => {
  if (telemetry.ddos >= 85 || telemetry.cpu >= 90 || telemetry.temperature >= 90) {
    return 'critical';
  }

  if (telemetry.ddos >= 65 || telemetry.cpu >= 70 || telemetry.temperature >= 75) {
    return 'warning';
  }

  return 'info';
};

const makeLog = (roomId, severity, message) => ({
  id: generateEventId(),
  roomId,
  time: new Date().toLocaleTimeString('es-ES', { hour12: false }),
  severity,
  message,
});

const emitRoomLog = (roomId, severity, message) => {
  io.to(roomId).emit('log:event', makeLog(roomId, severity, message));
};

const emitRoomState = (roomId) => {
  const room = getRoom(roomId);

  io.to(roomId).emit('mission:state', {
    roomId,
    telemetry: room.telemetry,
    securityCode: room.securityCode,
    status: room.status,
  });
};

const emitRoomTelemetry = (roomId) => {
  const room = getRoom(roomId);

  io.to(roomId).emit('telemetry:update', {
    roomId,
    ...room.telemetry,
    status: room.status,
  });
};

const degradeRoom = (room) => {
  if (room.status === ROOM_STATUS.STABILIZED) {
    room.telemetry = {
      temperature: clamp(Math.max(30, room.telemetry.temperature - 1)),
      cpu: clamp(Math.max(24, room.telemetry.cpu - 1)),
      ddos: clamp(Math.max(8, room.telemetry.ddos - 2)),
    };
    return;
  }

  room.telemetry = {
    temperature: clamp(room.telemetry.temperature + (Math.random() > 0.58 ? 4 : 1)),
    cpu: clamp(room.telemetry.cpu + (Math.random() > 0.5 ? 6 : 2)),
    ddos: clamp(room.telemetry.ddos + (Math.random() > 0.56 ? 8 : 3)),
  };
};

const stabilizeRoom = (room) => {
  room.status = ROOM_STATUS.STABILIZED;
  room.telemetry = {
    temperature: clamp(Math.max(24, room.telemetry.temperature - 20)),
    cpu: clamp(Math.max(18, room.telemetry.cpu - 25)),
    ddos: clamp(Math.max(6, room.telemetry.ddos - 24)),
  };
  room.securityCode = generateSecurityCode();
  room.criticalRaised = false;
};

app.get('/', (_req, res) => {
  res.type('text/plain').send('Socket server running. Use /health or /api-docs.');
});

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'crisis-socket-server',
    uptimeSeconds: Math.floor(process.uptime()),
    rooms: rooms.size,
  });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, { explorer: true }));

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  socket.on('session:join', (payload = {}) => {
    const roomId = String(payload.roomId ?? '').trim().toUpperCase();
    const playerName = String(payload.playerName ?? 'Operador').trim() || 'Operador';
    const playerRole = payload.playerRole ?? 'unknown';

    if (!roomId) {
      socket.emit('error:event', {
        message: 'session:join requiere roomId.',
      });
      return;
    }

    const room = getRoom(roomId);

    socket.data.roomId = roomId;
    socket.data.playerName = playerName;
    socket.data.playerRole = playerRole;

    socket.join(roomId);

    socket.emit('session:joined', {
      roomId,
      playerName,
      playerRole,
    });

    emitRoomLog(roomId, 'info', `${playerName} se unió como ${playerRole}.`);
    emitRoomState(roomId);
    emitRoomTelemetry(roomId);
    socket.emit('security:code', { code: room.securityCode, roomId });
  });

  socket.on('command:run', (payload = {}) => {
    const roomId = String(payload.roomId ?? socket.data.roomId ?? '').trim().toUpperCase();

    if (!roomId) {
      socket.emit('error:event', { message: 'command:run requiere roomId.' });
      return;
    }

    getRoom(roomId);

    const data = {
      ...payload,
      roomId,
      socketId: socket.id,
      receivedAt: Date.now(),
    };

    io.to(roomId).emit('command:run', data);
    emitRoomLog(roomId, 'info', `Comando recibido: ${payload.command ?? 'sin comando'}`);
  });

  socket.on('action:quick', (payload = {}) => {
    const roomId = String(payload.roomId ?? socket.data.roomId ?? '').trim().toUpperCase();

    if (!roomId) {
      socket.emit('error:event', { message: 'action:quick requiere roomId.' });
      return;
    }

    const room = getRoom(roomId);

    const effects = {
      'Reiniciar Servidores': {
        temperature: clamp(room.telemetry.temperature - 18),
        cpu: clamp(room.telemetry.cpu - 24),
        ddos: clamp(room.telemetry.ddos - 6),
      },
      'Activar Firewall': {
        temperature: room.telemetry.temperature,
        cpu: clamp(room.telemetry.cpu - 8),
        ddos: clamp(room.telemetry.ddos - 22),
      },
      'Aislar Rack': {
        temperature: clamp(room.telemetry.temperature - 8),
        cpu: clamp(room.telemetry.cpu - 12),
        ddos: clamp(room.telemetry.ddos - 16),
      },
    };

    room.telemetry = effects[payload.action] ?? room.telemetry;
    room.status = ROOM_STATUS.ACTIVE;

    const data = {
      ...payload,
      roomId,
      socketId: socket.id,
      receivedAt: Date.now(),
    };

    io.to(roomId).emit('action:quick', data);
    emitRoomTelemetry(roomId);
    emitRoomLog(roomId, 'info', `Acción rápida ejecutada: ${payload.action ?? 'sin acción'}`);
  });

  socket.on('code:submit', (payload = {}) => {
    const roomId = String(payload.roomId ?? socket.data.roomId ?? '').trim().toUpperCase();

    if (!roomId) {
      socket.emit('error:event', { message: 'code:submit requiere roomId.' });
      return;
    }

    const room = getRoom(roomId);
    const submittedCode = String(payload.code ?? '').trim();
    const isValid = Boolean(submittedCode) && submittedCode === room.securityCode;

    const data = {
      ...payload,
      roomId,
      socketId: socket.id,
      receivedAt: Date.now(),
      ok: isValid,
    };

    io.to(roomId).emit('code:submit', data);

    if (isValid) {
      stabilizeRoom(room);
      emitRoomLog(roomId, 'info', 'Código válido. Crisis estabilizada para esta sala.');
      io.to(roomId).emit('code:result', {
        ok: true,
        roomId,
        message: 'Código válido. La crisis de esta sala fue estabilizada.',
      });
      emitRoomState(roomId);
      emitRoomTelemetry(roomId);
      io.to(roomId).emit('security:code', { code: room.securityCode, roomId });
      return;
    }

    emitRoomLog(roomId, 'warning', 'Código inválido recibido por el técnico.');
    io.to(roomId).emit('code:result', {
      ok: false,
      roomId,
      message: 'Código inválido. La crisis permanece activa.',
    });
  });

  socket.on('mission:abort', (payload = {}) => {
    const roomId = String(payload.roomId ?? socket.data.roomId ?? '').trim().toUpperCase();

    if (!roomId) {
      socket.emit('error:event', { message: 'mission:abort requiere roomId.' });
      return;
    }

    const room = getRoom(roomId);
    room.status = ROOM_STATUS.ACTIVE;
    room.telemetry = {
      temperature: 42,
      cpu: 34,
      ddos: 18,
    };
    room.securityCode = generateSecurityCode();

    emitRoomLog(roomId, 'warning', 'Misión abortada por un operador. La sala fue reiniciada.');
    io.to(roomId).emit('mission:state', {
      roomId,
      telemetry: room.telemetry,
      securityCode: room.securityCode,
      status: room.status,
    });
    emitRoomTelemetry(roomId);
  });

  socket.on('disconnect', () => {
    const roomId = socket.data.roomId;
    if (roomId) {
      emitRoomLog(roomId, 'warning', `${socket.data.playerName ?? 'Operador'} desconectado.`);
    }
  });
});

setInterval(() => {
  for (const [roomId, room] of rooms.entries()) {
    if (getRoomSocketCount(roomId) === 0) {
      continue;
    }

    degradeRoom(room);

    const severity = getSeverity(room.telemetry);
    if (severity === 'critical' && !room.criticalRaised) {
      emitRoomLog(roomId, 'critical', 'Estado crítico detectado en la sala.');
      room.criticalRaised = true;
    }

    if (severity !== 'critical') {
      room.criticalRaised = false;
    }

    emitRoomTelemetry(roomId);

    if (severity === 'critical') {
      io.to(roomId).emit('mission:state', {
        roomId,
        telemetry: room.telemetry,
        securityCode: room.securityCode,
        status: room.status,
      });
    }
  }
}, 2000);

httpServer.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Socket server listening on http://localhost:${PORT}`);
});
