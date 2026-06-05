# ARCHITECTURE.md

## ARQUITECTURA COMPLETA DEL SISTEMA

Arquitectura actual:

```text
Angular standalone frontend
  |
  | HTTP JSON / multipart
  v
Node.js + Express backend
  |
  | SQL via pg Pool
  v
PostgreSQL mantenimiento_db

Backend filesystem:
  backend/uploads/evidencias
```

## COMPONENTES

### Frontend

Ubicacion:

```text
frontend
```

Responsabilidades:

- UI.
- Formularios.
- Navegacion interna por pestañas.
- Validaciones basicas de campos obligatorios.
- Consumo de API.
- Estado de pantalla.
- Exportacion CSV desde datos cargados.
- Seleccion de archivos para evidencia.

### Backend

Ubicacion:

```text
backend
```

Responsabilidades:

- API REST.
- Conexion a PostgreSQL.
- CRUD equipos.
- CRUD mantenimientos.
- Reportes.
- Dashboard.
- Recepcion de fotos por `multer`.
- Servir imagenes subidas con `express.static`.

### Base de datos

Motor:

```text
PostgreSQL
```

Base:

```text
mantenimiento_db
```

Tablas:

- `equipos`
- `mantenimientos`
- `evidencias_mantenimiento`

## PATRONES UTILIZADOS

### API REST simple

Endpoints organizados por recurso:

- `/api/equipos`
- `/api/mantenimientos`
- `/api/dashboard`
- `/api/salud`

### Separacion por rutas Express

Cada archivo en `backend/src/routes` representa un grupo de endpoints:

- `equipos.routes.js`
- `mantenimientos.routes.js`
- `dashboard.routes.js`

### Servicio Angular centralizado

`frontend/src/app/services/equipos.ts` centraliza las llamadas HTTP.

Aunque el nombre del servicio es `Equipos`, actualmente tambien maneja:

- mantenimientos
- reportes
- dashboard
- evidencias
- salud API

Refactor futuro recomendado:

- `equipos.service.ts`
- `mantenimientos.service.ts`
- `dashboard.service.ts`
- `evidencias.service.ts`

### Estado local en componente

`App` mantiene todo el estado:

- equipo seleccionado
- listas
- formularios
- filtros
- archivos seleccionados
- vista activa
- mensajes

Esto es aceptable para prototipo funcional, pero conviene separar en componentes si crece.

## FLUJO DE DATOS

### Lectura

```text
Angular component -> Angular service -> Express route -> PostgreSQL -> JSON -> Angular state -> template
```

### Escritura JSON

```text
Angular form -> ngModel -> App method -> service HTTP POST/PUT/DELETE -> Express -> SQL -> JSON response -> refresh state
```

### Escritura multipart para fotos

```text
input type=file -> File[] -> FormData -> POST multipart -> multer -> filesystem -> SQL evidence row -> JSON -> Angular gallery refresh
```

## FLUJO DE AUTENTICACION

No existe autenticacion.

No existe:

- login
- registro de usuarios
- JWT
- sesiones
- cookies de auth
- guards Angular
- middleware de autorizacion
- roles

Estado de seguridad:

- API local abierta.
- CORS habilitado sin restricciones explicitas.
- Cualquier cliente que llegue al backend puede ejecutar endpoints.

Recomendacion futura:

1. Tabla `usuarios`.
2. Hash de password con `bcrypt`.
3. Login `POST /api/auth/login`.
4. JWT.
5. Middleware `authRequired`.
6. Roles `admin`, `tecnico`, `consulta`.
7. Guard Angular.
8. Auditoria de acciones.

## FLUJO ENTRE FRONTEND Y BACKEND

Base URL hardcodeada en Angular:

```text
http://localhost:3000
```

Esto aparece en `frontend/src/app/services/equipos.ts`.

Riesgo:

- Para produccion, debe moverse a environment/config.

Frontend se sirve por Angular dev server:

```text
http://localhost:4201
```

Backend:

```text
http://localhost:3000
```

Uploads:

```text
http://localhost:3000/uploads/evidencias/archivo.jpg
```

## DECISIONES DE DISEÑO

### Pestañas internas

Se agrego `vistaActiva` para no mostrar todo en una sola pagina larga.

Valores:

- `operacion`
- `reportes`
- `equipos`

### Dashboard siempre visible

El header, dashboard y tabs siempre aparecen. Las secciones inferiores cambian segun `vistaActiva`.

### Formularios plegables

El formulario de mantenimiento no aparece siempre; aparece con `Agregar mantenimiento`.

### Boton especial para equipo no encontrado

Si no existe el codigo, solo aparece `Registrar este equipo`; se oculto `Registrar nuevo equipo` para evitar confusion.

### Eliminaciones con confirmacion

Se usa `window.confirm`.

### Evidencia fotografica como archivos locales

No se eligio base64 ni guardar binarios en PostgreSQL.

Razon:

- Menos peso en base de datos.
- Mas simple servir imagenes.
- PostgreSQL guarda metadata/ruta.

