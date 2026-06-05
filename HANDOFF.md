# HANDOFF.md

Documento de transferencia para continuar el desarrollo de la aplicacion de registro de mantenimientos.

## RESUMEN GENERAL

### Objetivo de la aplicacion

La aplicacion permite gestionar equipos identificados por codigo de barras y serial, consultar su informacion tecnica, registrar mantenimientos asociados, adjuntar evidencias fotograficas, consultar historial, generar reportes y exportar informacion a CSV.

El flujo principal definido con el usuario es:

1. El usuario escanea o escribe el codigo de barras o serial del equipo.
2. El frontend consulta el backend.
3. El backend busca el equipo en PostgreSQL.
4. Si el equipo existe, se muestra la ficha tecnica.
5. Se muestra alerta de estado de mantenimiento segun la proxima fecha.
6. Se muestra historial de mantenimientos.
7. El usuario puede registrar un nuevo mantenimiento sin volver a escribir datos del equipo.
8. El mantenimiento queda asociado al equipo mediante `equipo_id`.
9. El usuario puede adjuntar fotos reales como evidencia del trabajo.

### Problema que resuelve

El problema operativo es evitar registros manuales dispersos y repetitivos. Antes, para registrar un mantenimiento se tendrian que escribir datos del equipo repetidamente. La aplicacion separa:

- Datos del equipo: tabla `equipos`.
- Datos del trabajo realizado: tabla `mantenimientos`.
- Evidencias fotograficas: tabla `evidencias_mantenimiento` y archivos en disco.

Esto permite rastrear historial por equipo, consultar estado de mantenimiento, filtrar reportes y exportar informacion.

### Estado actual del desarrollo

Estado funcional actual:

- Backend Node.js/Express corriendo en `http://localhost:3000`.
- Frontend Angular standalone corriendo normalmente en `http://localhost:4201`.
- Base de datos PostgreSQL `mantenimiento_db`.
- Conectividad frontend-backend validada.
- CRUD parcial/completo:
  - Equipos: crear, buscar, listar, editar, eliminar.
  - Mantenimientos: crear, listar, editar, eliminar, ver detalle.
  - Evidencias: subir fotos y listar fotos por mantenimiento.
- Reportes:
  - Dashboard.
  - Reporte general de mantenimientos con filtros.
  - Exportacion CSV de historial del equipo.
  - Exportacion CSV de reporte general.

### Funcionalidades implementadas

- Busqueda por codigo de barras o serial.
- Registro de equipo nuevo.
- Registro rapido de equipo si el codigo buscado no existe.
- Ficha tecnica de equipo.
- Edicion de equipo.
- Eliminacion de equipo con cascada sobre mantenimientos.
- Registro de mantenimiento asociado automaticamente al equipo cargado.
- Formulario de mantenimiento plegable.
- Edicion de mantenimiento.
- Eliminacion de mantenimiento con confirmacion.
- Historial de mantenimientos por equipo.
- Detalle de mantenimiento.
- Estados visuales de mantenimiento.
- Alerta de mantenimiento vencido/proximo/al dia/sin fecha.
- Dashboard de totales.
- Reporte general de mantenimientos.
- Filtros de reportes por fecha, tecnico, estado y tipo.
- Lista general de equipos con filtros.
- Exportacion CSV.
- Subida real de fotos con `multer`.
- Galeria de evidencias en el detalle del mantenimiento.
- Indicador de conexion al backend consultando `/api/salud`.
- Pestañas internas: `Operacion`, `Reportes`, `Equipos`.
- CSS mejorado tipo panel administrativo.

### Funcionalidades en progreso

La ultima funcionalidad implementada fue evidencia fotografica real:

- `multer` instalado.
- Carpeta `backend/uploads/evidencias` creada.
- Rutas de evidencia agregadas.
- Tabla `evidencias_mantenimiento` creada automaticamente al arrancar backend.
- Frontend permite seleccionar fotos al registrar mantenimiento.
- Frontend permite subir fotos adicionales desde el detalle del mantenimiento.
- Frontend muestra miniaturas y links a fotos.

Debe probarse manualmente despues de reiniciar backend.

### Funcionalidades pendientes

Pendientes razonables:

- Login/autenticacion.
- Roles: administrador, tecnico, consulta.
- Auditoria: usuario que crea/edita/elimina registros.
- Confirmacion mas robusta para eliminar equipos.
- Eliminacion individual de evidencias fotograficas.
- Compresion o redimensionamiento de imagenes.
- Validaciones backend mas estrictas.
- Migraciones formales SQL.
- Pruebas automatizadas.
- Paginacion de listas/reportes.
- Exportar PDF.
- Generar etiquetas QR/codigo de barras.
- Despliegue.
- Separar frontend en componentes reales en lugar de concentrar todo en `App`.

## COMO LEVANTAR EL PROYECTO

Backend:

```bash
cd C:\Proyectos\app-mantenimientos\backend
npm install
npm run dev
```

Frontend:

```bash
cd C:\Proyectos\app-mantenimientos\frontend
npm install
ng serve --port 4201
```

URLs principales:

```text
Frontend: http://localhost:4201
Backend salud: http://localhost:3000/api/salud
Backend uploads: http://localhost:3000/uploads/evidencias/NOMBRE_ARCHIVO
```

## CONFIGURACION CRITICA

Archivo esperado:

```text
backend/.env
```

Variables:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mantenimiento_db
DB_USER=postgres
DB_PASSWORD=TU_PASSWORD_DE_POSTGRES
```

No copiar contraseñas reales en documentacion. La IA siguiente debe solicitar o preservar el `.env` local existente sin exponerlo.

## ARCHIVOS PRINCIPALES

Backend:

- `backend/src/server.js`: arranque Express, CORS, JSON, rutas, static uploads, healthcheck, creacion automatica de tabla de evidencias.
- `backend/src/db.js`: conexion `pg.Pool` con variables `.env`.
- `backend/src/routes/equipos.routes.js`: CRUD y busqueda de equipos, historial por equipo.
- `backend/src/routes/mantenimientos.routes.js`: CRUD de mantenimientos, reportes, evidencias fotograficas.
- `backend/src/routes/dashboard.routes.js`: resumen de totales.

Frontend:

- `frontend/src/app/app.ts`: estado principal, metodos de UI, llamadas al servicio.
- `frontend/src/app/app.html`: template unico con header, dashboard, vistas y formularios.
- `frontend/src/app/app.css`: estilos completos.
- `frontend/src/app/services/equipos.ts`: servicio HTTP e interfaces.
- `frontend/src/app/app.config.ts`: providers, router, `provideHttpClient`.
- `frontend/src/app/app.routes.ts`: rutas Angular vacias.

## COMANDOS DE VALIDACION USADOS

Frontend:

```bash
npm run build
```

Backend:

```bash
node --check src\server.js
node --check src\routes\equipos.routes.js
node --check src\routes\mantenimientos.routes.js
```

## ADVERTENCIAS PARA LA SIGUIENTE IA

1. El proyecto real esta en `C:\Proyectos\app-mantenimientos`, no en la carpeta temporal de Codex.
2. No modificar `node_modules`, `dist` ni archivos de `uploads` salvo que se este gestionando almacenamiento.
3. No exponer `.env`.
4. No asumir que existen migraciones formales. La tabla `evidencias_mantenimiento` se crea desde `server.js`; `equipos` y `mantenimientos` fueron creadas manualmente en pgAdmin.
5. La aplicacion no tiene autenticacion.
6. La mayor parte del frontend esta en un solo componente `App`. Esto funciona, pero para escalar conviene refactorizar.
7. Hay confirmaciones `window.confirm` para eliminar equipo y mantenimiento.
8. El borrado de equipo elimina mantenimientos por `ON DELETE CASCADE`.
9. La subida de fotos acepta imagenes con limite de 5 MB por archivo y maximo 5 archivos por request.
10. Si el backend se reinicia, `server.js` asegura la tabla de evidencias, pero no recrea tablas base.

