import { createServer } from 'node:http';
import { Server } from 'socket.io';

const PORT = Number(process.env.PORT ?? 3001);

const httpServer = createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(
      JSON.stringify({
        ok: true,
        service: 'crisis-socket-server',
        uptimeSeconds: Math.floor(process.uptime()),
      }),
    );
    return;
  }

  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Socket server running. Use /health or connect with Socket.IO client.');
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not found');
});

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const clamp = (value) => Math.max(0, Math.min(100, value));

const state = {
  telemetry: {
    temperature: 42,
    cpu: 34,
    ddos: 18,
  },
};

function nextTelemetry() {
  state.telemetry = {
    temperature: clamp(state.telemetry.temperature + (Math.random() > 0.6 ? 4 : 1)),
    cpu: clamp(state.telemetry.cpu + (Math.random() > 0.5 ? 6 : 2)),
    ddos: clamp(state.telemetry.ddos + (Math.random() > 0.55 ? 8 : 3)),
  };

  return state.telemetry;
}

function emitLog(message, severity = 'info') {
  io.emit('log:event', {
    severity,
    message,
    time: new Date().toLocaleTimeString('es-ES', { hour12: false }),
  });
}

io.on('connection', (socket) => {
  emitLog(`Cliente conectado: ${socket.id}`);

  socket.emit('mission:state', {
    telemetry: state.telemetry,
  });

  socket.on('session:join', (payload = {}) => {
    const name = payload.playerName ?? 'Operador';
    const role = payload.playerRole ?? 'unknown';
    emitLog(`${name} se unio como ${role}.`);
  });

  socket.on('command:run', (payload = {}) => {
    const data = {
      ...payload,
      socketId: socket.id,
      receivedAt: Date.now(),
    };

    io.emit('command:run', data);
    emitLog(`Comando recibido: ${payload.command ?? 'sin comando'}`);
  });

  socket.on('action:quick', (payload = {}) => {
    const data = {
      ...payload,
      socketId: socket.id,
      receivedAt: Date.now(),
    };

    io.emit('action:quick', data);
    emitLog(`Accion rapida: ${payload.action ?? 'sin accion'}`);
  });

  socket.on('code:submit', (payload = {}) => {
    const data = {
      ...payload,
      socketId: socket.id,
      receivedAt: Date.now(),
    };

    io.emit('code:submit', data);

    if (payload.code) {
      io.emit('security:code', { code: payload.code });
      emitLog('Codigo de seguridad actualizado por tecnico.');
    } else {
      emitLog('Se recibio code:submit sin codigo.', 'warning');
    }
  });

  socket.on('disconnect', () => {
    emitLog(`Cliente desconectado: ${socket.id}`, 'warning');
  });
});

setInterval(() => {
  const telemetry = nextTelemetry();
  io.emit('telemetry:update', telemetry);
}, 2000);

httpServer.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Socket server listening on http://localhost:${PORT}`);
});
