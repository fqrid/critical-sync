# Crisis Control Center

Sistema asimetrico de gestion de crisis para trabajo en parejas:
- Monitor: observa estado, eventos y codigo de seguridad.
- Tecnico: ejecuta acciones y comandos para contencion.

## Estudiante
## Estudiante
- Farid Esteban Castellanos Semanate

## Integrantes
- Integrante 1: [Nombre completo]
- Integrante 2: [Nombre completo]

## Tematica Elegida
Gestion de Data Center (Infraestructura Cloud)

## Estructura del Repositorio
- `/frontend`: aplicacion React + Vite + Zustand + Tailwind
- `/backend`: servidor Node.js + Express + Socket.IO + Swagger UI

## Instalacion
1. Backend
   cd backend
   npm install
   npm start
2. Frontend
   cd frontend
   npm install
   npm run dev

## Frontend
- Archivo de entorno: `/frontend/.env`
- Variable requerida:
  - `VITE_SOCKET_URL=http://localhost:3001`

## Backend
- Servidor principal: `/backend/index.js`
- Dependencias: `express`, `socket.io`, `swagger-ui-express`
- Swagger UI: `http://localhost:3001/api-docs`

## Contrato de Sockets
- Cliente -> Servidor:
  - `session:join`
  - `command:run`
  - `action:quick`
  - `code:submit`
  - `mission:abort`
- Servidor -> Cliente:
  - `telemetry:update`
  - `log:event`
  - `security:code`
  - `mission:state`
  - `code:result`
  - `error:event`

## Notas de Ejecucion
1. El Monitor y el Tecnico deben usar el mismo `roomId` para compartir la misma crisis.
2. La telemetria y la validacion del codigo son gestionadas por sala en el backend.
3. El frontend no contiene logica simulada local para la telemetria; depende del backend.
- /ops/bridge: vista de accion para tecnico.

## Flujo General
1. En el Lobby se define nombre y rol.
2. El layout de operaciones protege acceso si no hay sesion.
3. El store global sincroniza telemetria y acciones en tiempo real via Socket.
4. El tecnico emite acciones/comandos al backend.
5. El monitor refleja cambios instantaneamente sin recargar.
