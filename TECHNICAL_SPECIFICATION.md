# TECHNICAL_SPECIFICATION.md

## FRONTEND

### Framework

Angular standalone.

Versiones principales desde `frontend/package.json`:

```json
"@angular/common": "^21.2.0",
"@angular/compiler": "^21.2.0",
"@angular/core": "^21.2.0",
"@angular/forms": "^21.2.0",
"@angular/platform-browser": "^21.2.0",
"@angular/router": "^21.2.0",
"rxjs": "~7.8.0",
"typescript": "~5.9.2"
```

### Componentes existentes

Solo componente real:

```text
frontend/src/app/app.ts
```

Selector:

```ts
selector: 'app-root'
```

Standalone:

```ts
standalone: true
```

Imports:

```ts
FormsModule
NgIf
NgFor
DatePipe
```

### Servicios existentes

Archivo:

```text
frontend/src/app/services/equipos.ts
```

Clase:

```ts
export class Equipos
```

Responsabilidades actuales:

- verificar API
- buscar equipo
- obtener dashboard
- listar equipos
- obtener mantenimientos por equipo
- registrar mantenimiento
- obtener evidencias
- subir evidencias
- actualizar mantenimiento
- eliminar mantenimiento
- listar mantenimientos generales
- registrar equipo
- actualizar equipo
- eliminar equipo

### Interfaces

En `equipos.ts`:

```ts
Equipo
Mantenimiento
EvidenciaMantenimiento
MantenimientoReporte
ResumenDashboard
EstadoApi
```

Campos principales:

`Equipo`:

- id
- codigo_barras
- serial
- nombre
- marca
- modelo
- ubicacion
- area
- asignacion
- estado
- fecha_compra
- created_at
- updated_at

`Mantenimiento`:

- id
- equipo_id
- fecha_mantenimiento
- tipo_mantenimiento
- tecnico
- descripcion
- observaciones
- estado
- proxima_fecha
- created_at
- updated_at

`EvidenciaMantenimiento`:

- id
- mantenimiento_id
- nombre_archivo
- ruta_archivo
- tipo_archivo
- created_at

`MantenimientoReporte` extiende `Mantenimiento` y agrega:

- equipo
- codigo_barras
- serial
- area
- asignacion

`ResumenDashboard`:

- total_equipos
- total_mantenimientos
- mantenimientos_pendientes
- proximos_mantenimientos

### Guards

No existen guards.

### Pipes

No hay pipes personalizados.

Se usa `DatePipe` de Angular en template:

```html
{{ fecha | date:'yyyy-MM-dd' }}
```

### Directivas

No hay directivas personalizadas.

Se usan directivas Angular:

- `*ngIf`
- `*ngFor`
- property binding `[class...]`
- event binding `(click)`, `(change)`, `(keyup.enter)`, `(ngSubmit)`
- two-way binding `[(ngModel)]`

### Rutas Angular

`frontend/src/app/app.routes.ts` existe, pero no define navegacion real. La aplicacion usa pestañas internas con estado `vistaActiva`.

### Formularios

Todos los formularios usan template-driven forms con `FormsModule` y `ngModel`.

Formularios:

- Buscar equipo.
- Registrar equipo.
- Editar equipo.
- Registrar mantenimiento.
- Editar mantenimiento.
- Filtros reporte.
- Filtros equipos.
- Inputs file para evidencias.

### Estado de `App`

Variables principales:

- `codigoBusqueda`
- `vistaActiva`
- `apiConectada`
- `estadoApi`
- `equipo`
- `equipos`
- `mantenimientos`
- `evidenciasMantenimiento`
- `archivosNuevoMantenimiento`
- `archivosDetalleMantenimiento`
- `reporteMantenimientos`
- `mantenimientoSeleccionado`
- `mensaje`
- `cargando`
- `alertaMantenimiento`
- `ultimoCodigoNoEncontrado`
- `resumen`
- `filtrosEquipos`
- `filtrosReporte`
- `nuevoMantenimiento`
- `mantenimientoEditando`
- `datosMantenimientoEditando`
- `nuevoEquipo`
- `mostrarFormularioEquipo`
- `mostrarFormularioMantenimiento`
- `mostrarFormularioEdicionEquipo`

### Responsabilidad de archivos frontend

`main.ts`:

- Arranque Angular.
- Usa `bootstrapApplication`.

`app.config.ts`:

- Configura providers.
- Incluye `provideRouter(routes)`.
- Incluye `provideHttpClient()`.

`app.routes.ts`:

- Placeholder de rutas.

`app.ts`:

- Logica completa UI.

`app.html`:

- Template completo.

`app.css`:

- Estilos completos.

`services/equipos.ts`:

- Tipos e integracion HTTP.

## BACKEND

### Framework

Node.js + Express.

Dependencias principales desde `backend/package.json`:

```json
"cors": "^2.8.6",
"dotenv": "^17.4.2",
"express": "^5.2.1",
"multer": "^2.1.1",
"pg": "^8.21.0"
```

Dev:

```json
"nodemon": "^3.1.14"
```

### Archivos backend

`src/db.js`:

- Importa `pg`.
- Carga `.env`.
- Crea `Pool`.
- Exporta `pool`.

`src/server.js`:

- Crea Express.
- Habilita CORS.
- Habilita JSON.
- Sirve `/uploads`.
- Registra rutas.
- Healthcheck `/api/salud`.
- Arranca servidor.
- Crea tabla `evidencias_mantenimiento` si no existe.

`routes/equipos.routes.js`:

- CRUD equipos.
- Busqueda.
- Historial por equipo.

`routes/mantenimientos.routes.js`:

- Reporte general.
- CRUD mantenimientos.
- Evidencias.
- Multer.

`routes/dashboard.routes.js`:

- Resumen dashboard.

### Endpoints

Salud:

```text
GET /api/salud
```

Equipos:

```text
GET    /api/equipos
GET    /api/equipos/buscar/:valor
GET    /api/equipos/:id/mantenimientos
POST   /api/equipos
PUT    /api/equipos/:id
DELETE /api/equipos/:id
```

Mantenimientos:

```text
GET    /api/mantenimientos
POST   /api/mantenimientos
PUT    /api/mantenimientos/:id
DELETE /api/mantenimientos/:id
GET    /api/mantenimientos/:id/evidencias
POST   /api/mantenimientos/:id/evidencias
```

Dashboard:

```text
GET /api/dashboard/resumen
```

Uploads:

```text
GET /uploads/evidencias/:archivo
```

### Validaciones

Validaciones actuales son basicas.

Backend:

- En evidencias, `multer` acepta solo `mimetype` que empieza por `image/`.
- Limite por archivo: 5 MB.
- Maximo archivos por request: 5.
- Se retornan errores 500 con `error.message`.
- En algunos endpoints se valida existencia despues de UPDATE/DELETE.

Frontend:

- Campos obligatorios:
  - equipo: codigo_barras, serial, nombre.
  - mantenimiento: fecha_mantenimiento, tipo_mantenimiento, tecnico, descripcion.
- Confirmaciones antes de eliminar.

### Seguridad

No hay seguridad de autenticacion.

Riesgos:

- CORS abierto.
- Sin rate limit.
- Sin sanitizacion profunda.
- Sin autorizacion.
- Sin proteccion CSRF.
- Uploads locales sin autenticacion.

### Manejo de errores

Backend:

- `try/catch` por endpoint.
- Respuestas JSON con `ok: false`, `mensaje`, `error`.

Frontend:

- En errores HTTP se asigna `mensaje`.
- No hay sistema global de errores.

## BASE DE DATOS

### Motor

PostgreSQL.

### Tabla equipos

Campos esperados:

```sql
id SERIAL PRIMARY KEY
codigo_barras VARCHAR(100) UNIQUE NOT NULL
serial VARCHAR(100) UNIQUE NOT NULL
nombre VARCHAR(150) NOT NULL
marca VARCHAR(100)
modelo VARCHAR(100)
ubicacion VARCHAR(150)
area VARCHAR(150)
asignacion VARCHAR(150)
estado VARCHAR(50) DEFAULT 'activo'
fecha_compra DATE
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### Tabla mantenimientos

Campos esperados:

```sql
id SERIAL PRIMARY KEY
equipo_id INTEGER NOT NULL REFERENCES equipos(id) ON DELETE CASCADE
fecha_mantenimiento DATE NOT NULL
tipo_mantenimiento VARCHAR(80) NOT NULL
tecnico VARCHAR(120) NOT NULL
descripcion TEXT NOT NULL
observaciones TEXT
estado VARCHAR(50) DEFAULT 'terminado'
proxima_fecha DATE
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

Campo eliminado/no usado:

```text
repuestos
```

### Tabla evidencias_mantenimiento

Creada automaticamente en `server.js`:

```sql
CREATE TABLE IF NOT EXISTS evidencias_mantenimiento (
  id SERIAL PRIMARY KEY,
  mantenimiento_id INTEGER NOT NULL REFERENCES mantenimientos(id) ON DELETE CASCADE,
  nombre_archivo VARCHAR(255) NOT NULL,
  ruta_archivo VARCHAR(500) NOT NULL,
  tipo_archivo VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

### Indices

Se sugirieron inicialmente:

```sql
CREATE INDEX idx_equipos_codigo_barras ON equipos(codigo_barras);
CREATE INDEX idx_equipos_serial ON equipos(serial);
CREATE INDEX idx_mantenimientos_equipo_id ON mantenimientos(equipo_id);
```

No se confirmo si estan aplicados en la base actual. Validar en PostgreSQL.

### Migraciones

No hay framework de migraciones.

Pendiente recomendado:

- Crear carpeta `database/migrations`.
- Versionar SQL.
- Mover creacion de `evidencias_mantenimiento` fuera de `server.js`.

## CONFIGURACION

Backend `.env`:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mantenimiento_db
DB_USER=postgres
DB_PASSWORD=...
```

Angular:

- `angular.json` tiene `anyComponentStyle.maximumWarning` en `8kB`.
- `serve` usa configuracion development.
- `build` default production.

## APIs EXTERNAS

No se consumen APIs externas.

No hay tokens externos.

