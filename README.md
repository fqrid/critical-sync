# Crisis Control Center

Sistema asimetrico de gestion de crisis para trabajo en parejas:
- Monitor: observa estado, eventos y codigo de seguridad.
- Tecnico: ejecuta acciones y comandos para contencion.

## Estudiante
- Farid Esteban Castellanos Semanate


## Tematica Elegida
Gestion de Data Center (Infraestructura Cloud)

## Enlace al Repositorio
- GitHub: [Pegar URL del repositorio]

## Stack Tecnologico
- React + Vite
- React Router v7
- Zustand
- Socket.IO Client
- Tailwind CSS
- Lucide React

## Configuracion Socket Backend
1. Crear archivo .env en la raiz del proyecto.
2. Definir la URL del backend:

    VITE_SOCKET_URL=http://localhost:3001

3. Levantar backend y frontend.

### Eventos Esperados (contrato sugerido)
- Cliente -> Servidor
   - session:join
   - command:run
   - action:quick
   - code:submit
   - mission:abort

- Servidor -> Cliente
   - telemetry:update
   - log:event
   - security:code
   - mission:state
   - error:event

## Instalacion
1. Instalar dependencias:
   npm install
2. Ejecutar backend Socket.io:
   npm run server
3. Ejecutar frontend en desarrollo:
   npm run dev
4. Build de produccion:
   npm run build
5. Vista previa de build:
   npm run preview

## Backend Socket.io Basico
- Archivo: server/index.js
- Puerto por defecto: 3001 (variable PORT opcional)
- URL frontend esperada: VITE_SOCKET_URL=http://localhost:3001

Eventos que recibe y reenvia a todos los clientes:
- command:run
- action:quick
- code:submit

Eventos adicionales que emite:
- telemetry:update (cada 2 segundos)
- log:event
- mission:state (al conectar)
- security:code (cuando llega code:submit con code)

## Rutas Principales
- /: Lobby para registro y seleccion de rol.
- /ops/monitor: vista de solo lectura para monitor.
- /ops/bridge: vista de accion para tecnico.

## Flujo General
1. En el Lobby se define nombre y rol.
2. El layout de operaciones protege acceso si no hay sesion.
3. El store global sincroniza telemetria y acciones en tiempo real via Socket.
4. El tecnico emite acciones/comandos al backend.
5. El monitor refleja cambios instantaneamente sin recargar.
