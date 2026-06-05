# CURRENT_STATUS.md

## ESTADO ACTUAL

Fecha de referencia de esta transferencia: 2026-06-04.

Proyecto local:

```text
C:\Proyectos\app-mantenimientos
```

Backend:

```text
C:\Proyectos\app-mantenimientos\backend
```

Frontend:

```text
C:\Proyectos\app-mantenimientos\frontend
```

Base de datos:

```text
PostgreSQL / mantenimiento_db
```

## ULTIMA FUNCIONALIDAD IMPLEMENTADA

Evidencia fotografica real para mantenimientos.

Incluye:

- `multer`.
- carpeta `uploads/evidencias`.
- rutas de subida/listado.
- tabla `evidencias_mantenimiento`.
- input file al registrar mantenimiento.
- input file desde detalle.
- galeria de imagenes.

Debe reiniciarse backend para activar:

```bash
cd C:\Proyectos\app-mantenimientos\backend
npm run dev
```

## ESTADO DE VALIDACION

Ultimas validaciones ejecutadas:

```bash
npm run build
node --check src\server.js
node --check src\routes\mantenimientos.routes.js
```

Resultado:

- Angular compila correctamente.
- Backend sin errores de sintaxis.

## COMO PROBAR FUNCIONALIDAD PRINCIPAL

1. Levantar PostgreSQL.
2. Levantar backend:

```bash
cd C:\Proyectos\app-mantenimientos\backend
npm run dev
```

3. Levantar frontend:

```bash
cd C:\Proyectos\app-mantenimientos\frontend
ng serve --port 4201
```

4. Abrir:

```text
http://localhost:4201
```

5. Verificar backend:

```text
http://localhost:3000/api/salud
```

6. Buscar equipo de prueba si existe:

```text
7701234567890
SER-ABC-001
```

7. Registrar mantenimiento.
8. Adjuntar foto.
9. Abrir detalle.
10. Ver galeria.

## FUNCIONALIDADES COMPLETAS

- Buscar equipo.
- Registrar equipo.
- Editar equipo.
- Eliminar equipo.
- Registrar mantenimiento.
- Editar mantenimiento.
- Eliminar mantenimiento.
- Ver detalle.
- Subir evidencias.
- Listar evidencias.
- Dashboard.
- Alertas.
- Reportes.
- Exportacion CSV.
- Lista de equipos.
- Filtros.
- UI con pestañas.
- Validaciones robustas en backend (duplicidad de codigo/serial, existencia de equipo, fechas validas).
- Configuracion de URLs de API mediante variables de entorno (environments) en Angular.
- Sincronizacion de UI al agregar o eliminar evidencias (actualiza conteos en tiempo real).

## PENDIENTES PRIORITARIOS

1. Probar manualmente evidencia fotografica despues de reiniciar backend.
2. Crear migraciones SQL reales (sacar creacion de tabla de `server.js`).
3. Agregar autenticacion (login y roles).
4. Separar frontend en componentes reutilizables (Refactor Angular).
5. Agregar tests unitarios y de integracion.

## RIESGOS TECNICOS

- No hay autenticacion.
- No hay autorizacion.
- Uploads se guardan localmente; si se despliega, debe decidirse storage persistente.
- `server.js` crea solo tabla de evidencias automaticamente.
- No hay backup de base de datos documentado.
- `App` esta creciendo demasiado.
- El backend devuelve `error.message` en ciertos errores no validados. En produccion no conviene exponer detalles.
- No hay paginacion en reportes/listas.

## NO TOCAR SIN ANALISIS

- Relacion `mantenimientos.equipo_id REFERENCES equipos(id) ON DELETE CASCADE`.
- Rutas de uploads.
- Nombres de campos `codigo_barras`, `serial`, `asignacion`, `proxima_fecha`.
- Conversion de fechas vacias a `null`.
- Flujo de equipo no encontrado.

## SIGUIENTES MEJORAS RECOMENDADAS

1. Confirmar que subida de fotos funciona con imagen real.
2. Refactor Angular:
   - HeaderComponent
   - DashboardComponent
   - OperacionComponent
   - EquipoFormComponent
   - MantenimientoFormComponent
   - ReportesComponent
   - EquiposListComponent
3. Agregar login.
4. Agregar auditoria.

