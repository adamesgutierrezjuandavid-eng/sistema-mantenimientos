# PROJECT_CONTEXT.md

## CONTEXTO FUNCIONAL

La aplicacion fue construida desde cero como sistema interno de soporte tecnico para registrar mantenimientos de equipos. Los equipos tienen codigo de barras y serial. La intencion operativa es que el tecnico escanee el codigo, consulte automaticamente la informacion del equipo y registre el mantenimiento sin reescribir datos fijos como area, asignacion, marca, modelo o ubicacion.

El usuario aclaro que:

- Los mantenimientos los realiza soporte tecnico interno.
- No se requiere campo de costo porque no se manejan costos externos por mantenimiento.
- Si interesa evidencia del trabajo con fotos reales.
- La aplicacion debe verse menos basica y mas como sistema.
- El usuario prefiere que el asistente implemente automaticamente y el usuario guie que quiere o no.

## DECISIONES TOMADAS EN CONVERSACION

### Stack seleccionado

- Frontend: Angular standalone.
- Backend: Node.js con Express.
- Base de datos: PostgreSQL.
- Archivos/fotos: almacenamiento local en `backend/uploads/evidencias`.

Razon:

- El usuario ya estaba utilizando Angular standalone, PostgreSQL y Node.js.
- PostgreSQL es adecuado para relaciones equipo-mantenimiento.
- Node/Express permite API simple.
- Angular permite UI de formularios, tablas y estados.

### Separacion de datos

Decision clave:

- Datos del equipo se guardan en `equipos`.
- Datos del mantenimiento se guardan en `mantenimientos`.
- Fotos se guardan como archivos y referencias en `evidencias_mantenimiento`.

Razon:

No repetir datos de equipo en cada mantenimiento.

### Campo `asignacion`

El usuario agrego manualmente `asignacion` despues de `area` en tabla `equipos`.

Uso actual:

- Registro de equipo.
- Edicion de equipo.
- Lista de equipos.
- Reporte general.
- Exportacion CSV.

### Campo `repuestos`

Originalmente se propuso `repuestos`. El usuario lo quito de la tabla `mantenimientos`.

Estado actual:

- El codigo no usa `repuestos`.
- No reintroducir sin confirmacion.

### Evidencias fotograficas

Se decidio implementar foto real, no URL ni placeholder.

Implementacion:

- `multer`.
- Carpeta local.
- Static route `/uploads`.
- Tabla de evidencias.
- Upload multiple.

### Sin autenticacion por ahora

No existe login. No existen roles, guards ni JWT.

Riesgo:

Toda API queda abierta localmente.

Pendiente recomendado:

- Login.
- Roles.
- Auditoria de acciones.

## ESTADO DEL REPOSITORIO

Estructura relevante:

```text
C:\Proyectos\app-mantenimientos
  backend
    .env
    package.json
    package-lock.json
    node_modules
    uploads
      evidencias
        1780589821967-alexandre-debieve-FO7JIlwjOtU-unsplash.jpg
        1780591164830-alexandre-debieve-FO7JIlwjOtU-unsplash.jpg
    src
      db.js
      server.js
      routes
        dashboard.routes.js
        equipos.routes.js
        mantenimientos.routes.js
  database
  frontend
    angular.json
    package.json
    package-lock.json
    tsconfig.json
    tsconfig.app.json
    tsconfig.spec.json
    public
      favicon.ico
    src
      index.html
      main.ts
      styles.css
      app
        app.config.ts
        app.css
        app.html
        app.routes.ts
        app.spec.ts
        app.ts
        services
          equipos.ts
          equipos.spec.ts
```

## CONVENCIONES ACTUALES

- Backend usa CommonJS (`require`, `module.exports`).
- Frontend usa Angular standalone.
- Servicios HTTP centralizados en `frontend/src/app/services/equipos.ts`.
- El componente principal concentra la mayor parte del estado.
- Mensajes de usuario se guardan en `mensaje`.
- Vistas internas se manejan con `vistaActiva`.
- No hay libreria UI externa.
- CSS manual.
- Texto UI en espanol sin tildes mayormente por consistencia con los archivos actuales.

## FLUJOS PRINCIPALES

### Buscar equipo

1. Usuario escribe/escanea `codigoBusqueda`.
2. `App.buscarEquipo()`.
3. `Equipos.buscarEquipo(valor)`.
4. `GET /api/equipos/buscar/:valor`.
5. Backend busca `codigo_barras = valor OR serial = valor`.
6. Si existe:
   - `equipo` se actualiza.
   - `cargarMantenimientos(equipo.id)`.
   - se calcula alerta.
7. Si no existe:
   - mensaje `Equipo no encontrado`.
   - `ultimoCodigoNoEncontrado = valor`.
   - aparece boton `Registrar este equipo`.

### Registrar mantenimiento

1. Equipo debe estar cargado.
2. Usuario abre formulario con `Agregar mantenimiento`.
3. Completa fecha, tipo, tecnico, descripcion, estado, proxima fecha opcional.
4. Puede adjuntar fotos.
5. `registrarMantenimiento()`.
6. POST JSON a `/api/mantenimientos`.
7. Si hay archivos, POST multipart a `/api/mantenimientos/:id/evidencias`.
8. Se recarga historial, dashboard y reporte.

### Ver detalle

1. Usuario presiona `Ver detalle`.
2. `mantenimientoSeleccionado` recibe el mantenimiento.
3. `cargarEvidencias(id)`.
4. Se muestra tarjeta con detalle, descripcion, observaciones, galeria y edicion.

### Editar mantenimiento

1. Desde detalle, boton `Editar`.
2. Se copian datos a `datosMantenimientoEditando`.
3. PUT `/api/mantenimientos/:id`.
4. Se actualizan historial, resumen y reporte.

### Eliminar mantenimiento

1. Desde detalle, boton `Eliminar`.
2. Confirmacion `window.confirm`.
3. DELETE `/api/mantenimientos/:id`.
4. Se recarga historial/resumen/reporte.

### Registrar equipo

1. Manual con boton `Registrar nuevo equipo`, o automatico cuando no se encuentra codigo.
2. POST `/api/equipos`.
3. Se carga el equipo nuevo.
4. Se abre formulario de mantenimiento automaticamente.

### Editar equipo

1. Boton `Editar equipo`.
2. Se copian datos actuales a `nuevoEquipo`.
3. PUT `/api/equipos/:id`.
4. Se actualiza ficha y lista.

### Eliminar equipo

1. Boton `Eliminar equipo`.
2. Confirmacion.
3. DELETE `/api/equipos/:id`.
4. Por `ON DELETE CASCADE` se eliminan mantenimientos.
5. Se limpia UI y se recargan resumen/lista.

## LIMITACIONES CONOCIDAS

- Sin autenticacion.
- Sin validacion fuerte backend.
- Sin paginacion.
- Sin tests reales.
- Sin migraciones.
- Sin manejo robusto de errores de `multer` cuando el archivo no es imagen o excede limite.
- Sin eliminacion de evidencia individual.
- Sin proteccion contra nombres duplicados mas alla de prefijo timestamp.
- Frontend monolitico.

