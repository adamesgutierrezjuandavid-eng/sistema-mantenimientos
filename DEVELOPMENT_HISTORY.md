# DEVELOPMENT_HISTORY.md

## CRONOLOGIA DE DESARROLLO

### 1. Definicion inicial

El usuario solicito crear desde cero una aplicacion de registro de mantenimientos. Se propuso inicialmente React/Node/SQLite, pero el usuario aclaro que estaba utilizando:

- Angular standalone
- PostgreSQL
- Node.js

Decision final:

- Angular standalone + Node.js/Express + PostgreSQL.

### 2. Modelo inicial

Se definio que los equipos tienen:

- codigo de barras
- serial
- informacion tecnica

La aplicacion se basa en escanear codigo de barras para mostrar la ficha del equipo y registrar mantenimiento.

### 3. Base de datos

Se creo base:

```text
mantenimiento_db
```

Tablas iniciales:

- `equipos`
- `mantenimientos`

El usuario agrego `asignacion` en `equipos`.

El usuario quito `repuestos` de `mantenimientos`.

Se insertaron datos de prueba:

- codigo: `7701234567890`
- serial: `SER-ABC-001`
- equipo: `Compresor principal`

### 4. Backend inicial

Se creo backend en:

```text
C:\Proyectos\app-mantenimientos\backend
```

Comandos usados:

```bash
npm init -y
npm install express pg cors dotenv
npm install --save-dev nodemon
```

Se configuro `package.json`:

```json
"scripts": {
  "dev": "nodemon src/server.js",
  "start": "node src/server.js"
}
```

Se creo:

- `.env`
- `src/db.js`
- `src/server.js`
- `src/routes/equipos.routes.js`
- `src/routes/mantenimientos.routes.js`

### 5. Conexion PostgreSQL

Endpoint:

```text
GET /api/salud
```

Valida:

```sql
SELECT current_database()
```

Respuesta esperada:

```json
{
  "ok": true,
  "mensaje": "Backend funcionando",
  "base_datos": "mantenimiento_db"
}
```

### 6. Busqueda de equipos

Endpoint:

```text
GET /api/equipos/buscar/:valor
```

Busca por:

```sql
codigo_barras = valor OR serial = valor
```

### 7. Registro de mantenimiento

Endpoint:

```text
POST /api/mantenimientos
```

Se probo con Postman.

### 8. Historial por equipo

Endpoint:

```text
GET /api/equipos/:id/mantenimientos
```

El usuario inicialmente pego la ruta en el archivo incorrecto (`mantenimientos.routes.js`). Se corrigio moviendola a `equipos.routes.js`.

### 9. Frontend Angular

Se creo frontend con Angular standalone:

```bash
ng new frontend --standalone --routing --style=css
```

Problemas encontrados:

- `ng new .` no fue aceptado por Angular CLI con nombre `.`.
- Se corrigio creando proyecto desde carpeta padre con nombre `frontend`.
- Puerto 4200 ocupado; se uso `4201`.
- Error TypeScript `rootDir`; se ajustaron `tsconfig.app.json`/`tsconfig.spec.json`.
- Error `Missing script dev` en backend; se corrigio `package.json`.
- Error `MODULE_NOT_FOUND` por falta de `mantenimientos.routes.js`; se creo archivo.

### 10. Servicio Angular

Se creo:

```text
frontend/src/app/services/equipos.ts
```

Inicialmente Angular genero `equipos.ts` y `equipos.spec.ts`.

### 11. Primera UI

Se implemento:

- campo codigo/serial
- boton buscar
- ficha equipo
- historial
- formulario mantenimiento

### 12. Registro de mantenimiento desde Angular

Se agrego metodo `registrarMantenimiento`.

Problema corregido:

- `proxima_fecha` vacia enviaba `""` a PostgreSQL y podia fallar como DATE.
- Se convirtio a `null`.

### 13. Registro de equipo

Se agrego:

- `POST /api/equipos`
- formulario Angular para registrar equipo
- boton `Registrar nuevo equipo`

### 14. Dashboard

Se agrego:

```text
GET /api/dashboard/resumen
```

Tarjetas:

- equipos
- mantenimientos
- pendientes
- proximos 7 dias

### 15. Lista general de equipos

Se agrego:

```text
GET /api/equipos
```

Filtros:

- texto
- area
- estado
- asignacion

### 16. Estados visuales

Se agregaron badges para estados:

- terminado
- pendiente
- en proceso
- activo
- inactivo
- en mantenimiento

### 17. Formulario plegable

El formulario de mantenimiento paso a mostrarse solo con boton `Agregar mantenimiento`.

### 18. Equipo no encontrado

Si no se encuentra codigo:

- aparece `Registrar este equipo`
- se oculta `Registrar nuevo equipo`
- el codigo buscado se precarga en formulario.

### 19. Alerta de mantenimiento

Se calcula segun `proxima_fecha` mas cercana:

- vencido
- proximo
- al dia
- sin fecha

### 20. Editar equipo

Se agrego:

```text
PUT /api/equipos/:id
```

### 21. Detalle de mantenimiento

Se agrego tarjeta de detalle con descripcion y observaciones.

### 22. Editar mantenimiento

Se agrego:

```text
PUT /api/mantenimientos/:id
```

### 23. Eliminar mantenimiento

Se agrego:

```text
DELETE /api/mantenimientos/:id
```

### 24. Eliminar equipo

Se agrego:

```text
DELETE /api/equipos/:id
```

Advertencia:

- Borra mantenimientos por cascada.

### 25. Exportaciones CSV

Se agrego:

- exportar historial por equipo
- exportar reporte general filtrado

### 26. Pestañas

Se agrego `vistaActiva` con:

- Operacion
- Reportes
- Equipos

### 27. Header e indicador API

Se agrego header:

- Sistema de Mantenimientos
- estado real de backend

### 28. Mejora visual general

Se reemplazo CSS con version mas profesional.

### 29. Evidencia fotografica real

Se instalo:

```bash
npm install multer
```

Se agrego:

- carpeta `backend/uploads/evidencias`
- static `/uploads`
- tabla `evidencias_mantenimiento`
- `GET /api/mantenimientos/:id/evidencias`
- `POST /api/mantenimientos/:id/evidencias`
- input file en formulario de mantenimiento
- subida desde detalle
- galeria de evidencias

## PROBLEMAS Y SOLUCIONES

### Carpetas duplicadas

El proyecto se habia creado dos veces:

```text
app-mantenimientos\app-mantenimientos
backend\backend
```

Se reinicio estructura correctamente.

### `npm install --save dev nodemon`

El usuario ejecuto `--save dev` en vez de `--save-dev`.

Solucion:

```bash
npm install --save-dev nodemon
```

### Puerto 4200 ocupado

Solucion:

```bash
ng serve --port 4201
```

### `Cannot GET`

Hubo rutas pegadas en archivo incorrecto o URLs mezcladas.

Solucion:

- rutas correctas.
- usar URL completa unica.

### Angular pantalla inicial

El usuario seguia viendo la pagina inicial Angular porque no se habia guardado o editado `app.html`.

Solucion:

- guardar archivos.
- recargar.

### CSS budget warning

Angular advertia:

```text
app.css exceeded maximum budget
```

Solucion:

`angular.json`:

```json
"maximumWarning": "8kB"
```

### Permisos para crear uploads

Crear `backend/uploads/evidencias` fallo inicialmente por permisos.

Solucion:

- crear carpeta con permiso elevado.

## CODIGO GENERADO POR IA

Generado principalmente por IA:

- backend completo.
- frontend completo.
- CSS.
- rutas API.
- servicio Angular.
- documentacion handoff.

Modificado manualmente por usuario:

- Base PostgreSQL en pgAdmin.
- Agrego campo `asignacion`.
- Quito `repuestos`.
- Probo endpoints.
- Inserto/edito datos de prueba.
- Corrigio/pego fragmentos durante desarrollo guiado.

Partes que requieren revision futura:

- seguridad
- validaciones
- migraciones
- refactor frontend
- manejo de errores de uploads
- pruebas automatizadas

