export const SOCKET_EVENTS = {
  connect: 'connect',
  disconnect: 'disconnect',
  telemetryUpdate: 'telemetry:update',
  logEvent: 'log:event',
  securityCode: 'security:code',
  missionState: 'mission:state',
  errorEvent: 'error:event',
  joinSession: 'session:join',
  commandRun: 'command:run',
  quickAction: 'action:quick',
  submitCode: 'code:submit',
  abortMission: 'mission:abort',
} as const;
