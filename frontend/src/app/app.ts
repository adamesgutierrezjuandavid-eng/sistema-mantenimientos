import { Component, OnInit } from '@angular/core';
import { DatePipe, NgFor, NgIf, SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Equipos, Equipo, EstadoApi, EvidenciaMantenimiento, Mantenimiento, MantenimientoReporte, PaginationMeta, ResumenDashboard } from './services/equipos';
import { AuthService, UsuarioSesion } from './services/auth';
import { ConfirmModal } from './components/confirm-modal/confirm-modal';
import { Dashboard } from './components/dashboard/dashboard';
import { EquipoFicha } from './components/equipo-ficha/equipo-ficha';
import { EquipoForm } from './components/equipo-form/equipo-form';
import { EquiposList } from './components/equipos-list/equipos-list';
import { MantenimientoAlerta } from './components/mantenimiento-alerta/mantenimiento-alerta';
import { MantenimientoDetalle } from './components/mantenimiento-detalle/mantenimiento-detalle';
import { MantenimientoForm } from './components/mantenimiento-form/mantenimiento-form';
import { ReportesList } from './components/reportes-list/reportes-list';

type AccionConfirmacion = 'eliminar-evidencia' | 'eliminar-mantenimiento' | 'eliminar-equipo';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    NgFor,
    DatePipe,
    SlicePipe,
    ConfirmModal,
    Dashboard,
    EquipoFicha,
    EquipoForm,
    EquiposList,
    MantenimientoAlerta,
    MantenimientoDetalle,
    MantenimientoForm,
    ReportesList
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {
  codigoBusqueda = '';
  vistaActiva = 'operacion';
  apiConectada = false;
  estadoApi = 'Verificando conexion...';
  equipo: Equipo | null = null;
  equipos: Equipo[] = [];
  mantenimientos: Mantenimiento[] = [];
  evidenciasMantenimiento: EvidenciaMantenimiento[] = [];
  cargandoEvidencias = false;
  mensajeEvidencias = '';
  archivosNuevoMantenimiento: File[] = [];
  archivosDetalleMantenimiento: File[] = [];
  reporteMantenimientos: MantenimientoReporte[] = [];
  resumenTecnicos: { tecnico: string; proximos: number; pendientes: number; vencidos: number; total: number }[] = [];
  tareasTecnicoSeleccionado: string | null = null;
  tareasTecnicoDetalle: MantenimientoReporte[] = [];
  paginaTareasDetalle = 1;
  tareasPorPagina = 5;
  mantenimientoSeleccionado: Mantenimiento | null = null;
  mensaje = '';
  mensajeLogin = '';
  cargando = false;
  cargandoLogin = false;
  usuarioSesion: UsuarioSesion | null = null;
  credenciales = {
    usuario: '',
    password: ''
  };
  alertaMantenimiento = {
    estado: 'sin-fecha',
    titulo: 'Sin proxima fecha',
    detalle: 'Este equipo no tiene una proxima fecha de mantenimiento registrada.'
  };

  tecnicos: UsuarioSesion[] = [];
  ultimoCodigoNoEncontrado = '';
  historialBusqueda: string[] = [];
  sugerenciasBusqueda: string[] = [];
  sugerenciaActiva = -1;
  resultadosBusqueda: Equipo[] = [];
  busquedaRealizada = false;
  busquedaAutoTimeout: any = null;
  busquedaAutoDelay = 500;
  resumen: ResumenDashboard = {
    total_equipos: 0,
    total_mantenimientos: 0,
    mantenimientos_pendientes: 0,
    proximos_mantenimientos: 0
  };

  filtrosEquipos = {
    texto: '',
    area: '',
    estado: '',
    asignacion: ''
  };

  filtrosReporte = {
    fecha_inicio: '',
    fecha_fin: '',
    tecnico: '',
    estado: '',
    tipo: ''
  };

  paginacionEquipos: PaginationMeta = {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  };

  paginacionReporte: PaginationMeta = {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  };

  confirmacion: {
    visible: boolean;
    titulo: string;
    mensaje: string;
    accion: AccionConfirmacion | null;
    evidencia: EvidenciaMantenimiento | null;
  } = {
    visible: false,
    titulo: '',
    mensaje: '',
    accion: null,
    evidencia: null
  };

  nuevoMantenimiento = {
  fecha_mantenimiento: '',
  tipo_mantenimiento: 'preventivo',
  tecnico: '',
  tecnico_id: null as number | null,
  descripcion: '',
  observaciones: '',
  estado: 'terminado',
  proxima_fecha: ''
};
  mantenimientoEditando: Mantenimiento | null = null;
  datosMantenimientoEditando = {
  fecha_mantenimiento: '',
  tipo_mantenimiento: 'preventivo',
  tecnico: '',
  tecnico_id: null as number | null,
  descripcion: '',
  observaciones: '',
  estado: 'terminado',
  proxima_fecha: ''
};
  nuevoEquipo = {
  codigo_barras: '',
  serial: '',
  nombre: '',
  marca: '',
  empresa: '',
  ubicacion: '',
  area: '',
  asignacion: '',
  estado: 'activo',
  fecha_compra: ''
};

mostrarFormularioEquipo = false;
mostrarFormularioMantenimiento = false;
mostrarFormularioEdicionEquipo = false;

  constructor(private equiposService: Equipos, private authService: AuthService) {}

  ngOnInit() {
    this.verificarApi();
    this.historialBusqueda = JSON.parse(localStorage.getItem('mantenimientos_search_history') || '[]');
    this.actualizarSugerencias();
    const usuarioAlmacenado = this.authService.obtenerUsuario();

    if (!usuarioAlmacenado) {
      return;
    }

    this.authService.obtenerSesion().subscribe({
      next: (respuesta) => {
        this.usuarioSesion = respuesta.usuario;
        this.inicializarDatos();
      },
      error: () => {
        this.authService.cerrarSesion();
        this.usuarioSesion = null;
        this.mensajeLogin = 'Sesion expirada. Inicie sesion de nuevo.';
      }
    });
  }

  inicializarDatos() {
    this.cargarResumen();
    this.listarEquipos();
    this.listarReporteMantenimientos();
    this.cargarTecnicos();
  }

  iniciarSesion(usuario?: string, password?: string) {
    const usuarioLogin = usuario?.trim() ?? this.credenciales.usuario?.trim();
    const passwordLogin = password ?? this.credenciales.password;

    if (!usuarioLogin || !passwordLogin) {
      this.mensajeLogin = 'Ingrese usuario y contrasena.';
      return;
    }

    this.cargandoLogin = true;
    this.mensajeLogin = '';

    this.authService.login(usuarioLogin, passwordLogin).subscribe({
      next: (respuesta) => {
        this.usuarioSesion = respuesta.usuario;
        this.credenciales = { usuario: '', password: '' };
        this.cargandoLogin = false;
        this.mensaje = 'Sesion iniciada correctamente.';
        this.inicializarDatos();
      },
      error: () => {
        this.cargandoLogin = false;
        this.mensajeLogin = 'Usuario o contrasena incorrectos.';
      }
    });
  }

  cerrarSesion() {
    this.authService.cerrarSesion();
    this.usuarioSesion = null;
    this.equipo = null;
    this.equipos = [];
    this.mantenimientos = [];
    this.reporteMantenimientos = [];
    this.mantenimientoSeleccionado = null;
    this.tecnicos = [];
    this.mensaje = '';
  }

  verificarApi() {
    this.equiposService.verificarApi().subscribe({
      next: (respuesta: EstadoApi) => {
        this.apiConectada = respuesta.ok;
        this.estadoApi = respuesta.base_datos
          ? `Backend conectado - ${respuesta.base_datos}`
          : 'Backend conectado';
      },
      error: () => {
        this.apiConectada = false;
        this.estadoApi = 'Backend desconectado';
      }
    });
  }

  cargarResumen() {
    this.equiposService.obtenerResumen().subscribe({
      next: (respuesta: { ok: boolean; resumen: ResumenDashboard }) => {
        this.resumen = respuesta.resumen;
      },
      error: () => {
        this.mensaje = 'No se pudo cargar el resumen del sistema.';
      }
    });
  }

  listarEquipos(page = this.paginacionEquipos.page) {
    this.paginacionEquipos.page = page;
    this.equiposService.listarEquipos({
      ...this.filtrosEquipos,
      page: this.paginacionEquipos.page,
      limit: this.paginacionEquipos.limit
    }).subscribe({
      next: (respuesta: { ok: boolean; equipos: Equipo[]; pagination: PaginationMeta }) => {
        this.equipos = respuesta.equipos;
        this.paginacionEquipos = respuesta.pagination;
      },
      error: () => {
        this.mensaje = 'No se pudo cargar la lista de equipos.';
      }
    });
  }

  limpiarFiltrosEquipos() {
    this.filtrosEquipos = {
      texto: '',
      area: '',
      estado: '',
      asignacion: ''
    };

    this.listarEquipos(1);
  }

  listarReporteMantenimientos(page = this.paginacionReporte.page) {
    this.paginacionReporte.page = page;
    this.equiposService.listarMantenimientos({
      ...this.filtrosReporte,
      page: this.paginacionReporte.page,
      limit: this.paginacionReporte.limit
    }).subscribe({
      next: (respuesta: { ok: boolean; mantenimientos: MantenimientoReporte[]; pagination: PaginationMeta }) => {
        this.reporteMantenimientos = respuesta.mantenimientos;
        this.paginacionReporte = respuesta.pagination;
        this.actualizarResumenTecnicos();
      },
      error: () => {
        this.mensaje = 'No se pudo cargar el reporte de mantenimientos.';
      }
    });
  }

  actualizarResumenTecnicos() {
    const resumenMap = new Map<string, { tecnico: string; proximos: number; pendientes: number; vencidos: number; total: number }>();
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const proximosLimite = new Date(hoy);
    proximosLimite.setDate(hoy.getDate() + 7);

    for (const mantenimiento of this.reporteMantenimientos) {
      const tecnico = mantenimiento.tecnico || 'Sin tecnico';
      if (!resumenMap.has(tecnico)) {
        resumenMap.set(tecnico, { tecnico, proximos: 0, pendientes: 0, vencidos: 0, total: 0 });
      }

      const resumen = resumenMap.get(tecnico)!;
      resumen.total += 1;

      const proximaFecha = mantenimiento.proxima_fecha ? new Date(mantenimiento.proxima_fecha) : null;
      const estado = mantenimiento.estado?.toLowerCase() || '';

      if (estado === 'pendiente' || estado === 'en proceso') {
        resumen.pendientes += 1;
      }

      if (proximaFecha) {
        proximaFecha.setHours(0, 0, 0, 0);
        if (proximaFecha < hoy) {
          resumen.vencidos += 1;
        } else if (proximaFecha <= proximosLimite) {
          resumen.proximos += 1;
        }
      }
    }

    this.resumenTecnicos = Array.from(resumenMap.values()).sort((a, b) => b.total - a.total);
    if (this.tareasTecnicoSeleccionado) {
      this.verTareasTecnico(this.tareasTecnicoSeleccionado);
    }
  }

  verTareasTecnico(tecnico: string) {
    this.tareasTecnicoSeleccionado = tecnico;
    this.paginaTareasDetalle = 1;
    this.tareasTecnicoDetalle = this.reporteMantenimientos
      .filter((m) => (m.tecnico || 'Sin tecnico') === tecnico)
      .sort((a, b) => {
        const fechaA = a.proxima_fecha ? new Date(a.proxima_fecha).getTime() : 0;
        const fechaB = b.proxima_fecha ? new Date(b.proxima_fecha).getTime() : 0;
        return fechaA - fechaB;
      });
  }

  cambiarPaginaTareasDetalle(page: number) {
    this.paginaTareasDetalle = page;
  }

  obtenerTotalPaginasTareas(): number {
    return Math.max(1, Math.ceil(this.tareasTecnicoDetalle.length / this.tareasPorPagina));
  }

  cargarTecnicos() {
    this.authService.obtenerTecnicos().subscribe({
      next: (respuesta) => {
        this.tecnicos = respuesta.usuarios || [];
      },
      error: () => {
        this.tecnicos = [];
        this.mensaje = 'No se pudo cargar la lista de tecnicos.';
      }
    });
  }

  limpiarFiltrosReporte() {
    this.filtrosReporte = {
      fecha_inicio: '',
      fecha_fin: '',
      tecnico: '',
      estado: '',
      tipo: ''
    };

    this.listarReporteMantenimientos(1);
  }

  seleccionarEquipo(equipo: Equipo) {
    this.vistaActiva = 'operacion';
    this.equipo = equipo;
    this.codigoBusqueda = equipo.codigo_barras;
    this.mensaje = '';
    this.mostrarFormularioMantenimiento = false;
    this.mostrarFormularioEdicionEquipo = false;
    this.cargarMantenimientos(equipo.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  buscarEquipo(valor?: string) {
    const texto = ((valor ?? this.codigoBusqueda) || '').trim();
    if (!texto) {
      this.mensaje = 'Ingrese o escanee un codigo de barras o serial.';
      return;
    }

    this.codigoBusqueda = texto;
    this.actualizarSugerencias();
    this.cargando = true;
    this.mensaje = '';
    this.ultimoCodigoNoEncontrado = '';
    this.equipo = null;
    this.mantenimientos = [];
    this.mantenimientoSeleccionado = null;
    this.resultadosBusqueda = [];
    this.busquedaRealizada = true;

    this.equiposService
      .listarEquipos({ texto, area: '', estado: '', asignacion: '', page: 1, limit: 5 })
      .subscribe({
        next: (respuesta) => {
          const equipos = respuesta.equipos || [];
          if (equipos.length === 1) {
            this.cargarResultadoBusqueda(equipos[0]);
          } else if (equipos.length > 1) {
            this.resultadosBusqueda = equipos;
            this.cargando = false;
          } else {
            this.mensaje = 'Equipo no encontrado.';
            this.ultimoCodigoNoEncontrado = texto;
            this.cargando = false;
          }
        },
        error: () => {
          this.mensaje = 'Error al buscar equipos.';
          this.ultimoCodigoNoEncontrado = texto;
          this.cargando = false;
        }
      });
  }

  cargarResultadoBusqueda(equipo: Equipo) {
    this.registrarBusquedaHistorial(this.codigoBusqueda);
    this.resultadosBusqueda = [];
    this.mensaje = '';
    this.equipo = equipo;
    this.mostrarFormularioMantenimiento = false;
    this.mostrarFormularioEdicionEquipo = false;
    this.cargarMantenimientos(equipo.id);
    this.cargando = false;
  }

  prepararRegistroEquipo() {
    this.mostrarFormularioEquipo = true;
    this.nuevoEquipo.codigo_barras = this.ultimoCodigoNoEncontrado || this.codigoBusqueda.trim();
    this.nuevoEquipo.serial = '';
    this.nuevoEquipo.nombre = '';
    this.mensaje = 'Complete los datos del equipo para registrarlo.';
  }

  registrarBusquedaHistorial(codigo: string) {
    const valor = codigo.trim();
    if (!valor) {
      return;
    }

    this.historialBusqueda = [valor, ...this.historialBusqueda.filter((item) => item !== valor)].slice(0, 5);
    localStorage.setItem('mantenimientos_search_history', JSON.stringify(this.historialBusqueda));
    this.actualizarSugerencias();
  }

  usarBusquedaHistorial(codigo: string) {
    this.codigoBusqueda = codigo;
    this.sugerenciaActiva = -1;
    this.cancelarBusquedaAutomatica();
    this.actualizarSugerencias();
    this.buscarEquipo(codigo);
  }

  manejarEnterInput(valor?: string) {
    this.cancelarBusquedaAutomatica();

    if (this.sugerenciasBusqueda.length > 0 && this.sugerenciaActiva >= 0) {
      this.usarBusquedaHistorial(this.sugerenciasBusqueda[this.sugerenciaActiva]);
      return;
    }

    this.buscarEquipo(valor);
  }

  moverSugerencia(direccion: number) {
    if (!this.sugerenciasBusqueda.length) {
      return;
    }

    const cantidad = this.sugerenciasBusqueda.length;
    this.sugerenciaActiva = (this.sugerenciaActiva + direccion + cantidad) % cantidad;
    this.codigoBusqueda = this.sugerenciasBusqueda[this.sugerenciaActiva];
  }

  onCodigoInput() {
    this.resultadosBusqueda = [];
    this.busquedaRealizada = false;
    this.actualizarSugerencias();
    this.programarBusquedaAutomatica();
  }

  programarBusquedaAutomatica() {
    this.cancelarBusquedaAutomatica();

    const texto = this.codigoBusqueda.trim();
    if (!texto) {
      return;
    }

    this.busquedaAutoTimeout = setTimeout(() => {
      if (this.sugerenciaActiva < 0) {
        this.buscarEquipo(this.codigoBusqueda);
      }
    }, this.busquedaAutoDelay);
  }

  cancelarBusquedaAutomatica() {
    if (this.busquedaAutoTimeout) {
      clearTimeout(this.busquedaAutoTimeout);
      this.busquedaAutoTimeout = null;
    }
  }

  limpiarHistorialBusqueda() {
    this.historialBusqueda = [];
    this.sugerenciasBusqueda = [];
    this.sugerenciaActiva = -1;
    this.cancelarBusquedaAutomatica();
    localStorage.removeItem('mantenimientos_search_history');
  }

  actualizarSugerencias() {
    const texto = this.codigoBusqueda.trim().toLowerCase();
    this.sugerenciasBusqueda = texto
      ? this.historialBusqueda.filter((item) => item.toLowerCase().includes(texto)).slice(0, 5)
      : [];
    this.sugerenciaActiva = -1;
  }

  cargarMantenimientos(equipoId: number) {
   this.equiposService.obtenerMantenimientos(equipoId).subscribe({
  next: (respuesta: { ok: boolean; mantenimientos: Mantenimiento[] }) => {
    this.mantenimientos = respuesta.mantenimientos;
    if (this.mantenimientoSeleccionado) {
      this.mantenimientoSeleccionado =
        this.mantenimientos.find(
          (mantenimiento) => mantenimiento.id === this.mantenimientoSeleccionado!.id
        ) || null;
    }
    this.calcularAlertaMantenimiento();
  },
  error: () => {
    this.mantenimientos = [];
    this.mantenimientoSeleccionado = null;
    this.calcularAlertaMantenimiento();
  }
});
  }

verDetalleMantenimiento(mantenimiento: Mantenimiento) {
  this.mantenimientoSeleccionado = mantenimiento;
  this.evidenciasMantenimiento = [];
  this.mensajeEvidencias = '';
  this.archivosDetalleMantenimiento = [];
  this.cargarEvidencias(mantenimiento.id);
}

cerrarDetalleMantenimiento() {
  this.mantenimientoSeleccionado = null;
  this.mantenimientoEditando = null;
  this.evidenciasMantenimiento = [];
  this.archivosDetalleMantenimiento = [];
}

cargarEvidencias(mantenimientoId: number) {
  this.cargandoEvidencias = true;
  this.mensajeEvidencias = '';
  this.evidenciasMantenimiento = [];

  this.equiposService.obtenerEvidencias(mantenimientoId).subscribe({
    next: (respuesta: { ok: boolean; evidencias: EvidenciaMantenimiento[] }) => {
      if (this.mantenimientoSeleccionado?.id !== mantenimientoId) {
        return;
      }

      this.evidenciasMantenimiento = respuesta.evidencias;
      this.cargandoEvidencias = false;
    },
    error: () => {
      if (this.mantenimientoSeleccionado?.id !== mantenimientoId) {
        return;
      }

      this.evidenciasMantenimiento = [];
      this.cargandoEvidencias = false;
      this.mensajeEvidencias = 'No se pudieron cargar las evidencias. Intente actualizar.';
    }
  });
}

seleccionarFotosNuevoMantenimiento(evento: Event) {
  const input = evento.target as HTMLInputElement;
  this.archivosNuevoMantenimiento = Array.from(input.files || []);
}

seleccionarFotosDetalle(evento: Event) {
  const input = evento.target as HTMLInputElement;
  this.archivosDetalleMantenimiento = Array.from(input.files || []);
}

subirFotosDetalle() {
  if (!this.mantenimientoSeleccionado) {
    return;
  }

  if (this.archivosDetalleMantenimiento.length === 0) {
    this.cargarEvidencias(this.mantenimientoSeleccionado.id);
    this.mensaje = 'Evidencias actualizadas.';
    return;
  }

  this.equiposService
    .subirEvidencias(this.mantenimientoSeleccionado.id, this.archivosDetalleMantenimiento)
    .subscribe({
      next: () => {
        this.mensaje = 'Evidencias subidas correctamente.';
        this.archivosDetalleMantenimiento = [];
        this.cargarEvidencias(this.mantenimientoSeleccionado!.id);
        if (this.equipo) {
          this.cargarMantenimientos(this.equipo.id);
        }
        this.cargarResumen();
        this.listarReporteMantenimientos();
      },
      error: () => {
        this.mensaje = 'Error al subir evidencias.';
      }
    });
}

eliminarEvidencia(evidencia: EvidenciaMantenimiento) {
  if (!this.mantenimientoSeleccionado) return;

  this.abrirConfirmacion(
    'Eliminar evidencia',
    'Esta foto se eliminara del mantenimiento y tambien del almacenamiento del servidor.',
    'eliminar-evidencia',
    evidencia
  );
}

confirmarEliminarEvidencia(evidencia: EvidenciaMantenimiento) {
  this.equiposService.eliminarEvidencia(evidencia.id).subscribe({
    next: () => {
      this.mensaje = 'Evidencia eliminada correctamente.';
      this.cargarEvidencias(this.mantenimientoSeleccionado!.id);
      if (this.equipo) {
        this.cargarMantenimientos(this.equipo.id);
      }
      this.cargarResumen();
      this.listarReporteMantenimientos();
    },
    error: () => {
      this.mensaje = 'Error al eliminar la evidencia.';
    }
  });
}

exportarHistorialCsv() {
  if (!this.equipo || this.mantenimientos.length === 0) {
    this.mensaje = 'No hay historial para exportar.';
    return;
  }

  const encabezados = [
    'Equipo',
    'Codigo barras',
    'Serial',
    'Fecha mantenimiento',
    'Tipo',
    'Tecnico',
    'Estado',
    'Descripcion',
    'Observaciones',
    'Proxima fecha'
  ];

  const filas = this.mantenimientos.map((mantenimiento) => [
    this.equipo!.nombre,
    this.equipo!.codigo_barras,
    this.equipo!.serial,
    this.formatearFechaCsv(mantenimiento.fecha_mantenimiento),
    mantenimiento.tipo_mantenimiento,
    mantenimiento.tecnico,
    mantenimiento.estado,
    mantenimiento.descripcion,
    mantenimiento.observaciones || '',
    this.formatearFechaCsv(mantenimiento.proxima_fecha)
  ]);

  const contenido = [encabezados, ...filas]
    .map((fila) => fila.map((valor) => this.escaparCsv(valor)).join(','))
    .join('\n');

  const blob = new Blob([`\uFEFF${contenido}`], {
    type: 'text/csv;charset=utf-8;'
  });
  const url = window.URL.createObjectURL(blob);
  const enlace = document.createElement('a');

  enlace.href = url;
  enlace.download = `historial-${this.equipo.codigo_barras}.csv`;
  enlace.click();
  window.URL.revokeObjectURL(url);
}

exportarReporteCsv() {
  if (this.reporteMantenimientos.length === 0) {
    this.mensaje = 'No hay mantenimientos para exportar.';
    return;
  }

  const encabezados = [
    'Fecha',
    'Equipo',
    'Codigo barras',
    'Serial',
    'Area',
    'Asignacion',
    'Tipo',
    'Tecnico',
    'Estado',
    'Descripcion',
    'Observaciones',
    'Proxima fecha'
  ];

  const filas = this.reporteMantenimientos.map((mantenimiento) => [
    this.formatearFechaCsv(mantenimiento.fecha_mantenimiento),
    mantenimiento.equipo,
    mantenimiento.codigo_barras,
    mantenimiento.serial,
    mantenimiento.area || '',
    mantenimiento.asignacion || '',
    mantenimiento.tipo_mantenimiento,
    mantenimiento.tecnico,
    mantenimiento.estado,
    mantenimiento.descripcion,
    mantenimiento.observaciones || '',
    this.formatearFechaCsv(mantenimiento.proxima_fecha)
  ]);

  const contenido = [encabezados, ...filas]
    .map((fila) => fila.map((valor) => this.escaparCsv(valor)).join(','))
    .join('\n');

  const blob = new Blob([`\uFEFF${contenido}`], {
    type: 'text/csv;charset=utf-8;'
  });
  const url = window.URL.createObjectURL(blob);
  const enlace = document.createElement('a');

  enlace.href = url;
  enlace.download = 'reporte-mantenimientos.csv';
  enlace.click();
  window.URL.revokeObjectURL(url);
}

formatearFechaCsv(fecha: string | null) {
  if (!fecha) return '';
  return fecha.substring(0, 10);
}

escaparCsv(valor: string) {
  const texto = String(valor ?? '');
  return `"${texto.replace(/"/g, '""')}"`;
}

editarMantenimiento(mantenimiento: Mantenimiento) {
  this.mantenimientoEditando = mantenimiento;
  this.datosMantenimientoEditando = {
    fecha_mantenimiento: mantenimiento.fecha_mantenimiento
      ? mantenimiento.fecha_mantenimiento.substring(0, 10)
      : '',
    tipo_mantenimiento: mantenimiento.tipo_mantenimiento,
    tecnico: mantenimiento.tecnico,
    tecnico_id: mantenimiento.tecnico_id ?? null,
    descripcion: mantenimiento.descripcion,
    observaciones: mantenimiento.observaciones || '',
    estado: mantenimiento.estado,
    proxima_fecha: mantenimiento.proxima_fecha
      ? mantenimiento.proxima_fecha.substring(0, 10)
      : ''
  };
}

cancelarEdicionMantenimiento() {
  this.mantenimientoEditando = null;
}

actualizarMantenimiento() {
  if (!this.equipo || !this.mantenimientoEditando) return;

  if (
    !this.datosMantenimientoEditando.fecha_mantenimiento ||
    !this.datosMantenimientoEditando.tipo_mantenimiento ||
    !this.datosMantenimientoEditando.tecnico_id ||
    !this.datosMantenimientoEditando.descripcion
  ) {
    this.mensaje = 'Complete los campos obligatorios del mantenimiento.';
    return;
  }

  const datos = {
    ...this.datosMantenimientoEditando,
    proxima_fecha: this.datosMantenimientoEditando.proxima_fecha || null
  };

  this.equiposService.actualizarMantenimiento(this.mantenimientoEditando.id, datos).subscribe({
    next: (respuesta: { ok: boolean; mensaje: string; mantenimiento: Mantenimiento }) => {
      this.mensaje = 'Mantenimiento actualizado correctamente.';
      this.mantenimientoSeleccionado = respuesta.mantenimiento;
      this.mantenimientoEditando = null;
      this.cargarMantenimientos(this.equipo!.id);
      this.cargarResumen();
      this.listarReporteMantenimientos();
    },
    error: () => {
      this.mensaje = 'Error al actualizar el mantenimiento.';
    }
  });
}

calcularAlertaMantenimiento() {
  const fechas = this.mantenimientos
    .filter((mantenimiento) => mantenimiento.proxima_fecha)
    .map((mantenimiento) => new Date(mantenimiento.proxima_fecha as string))
    .sort((a, b) => a.getTime() - b.getTime());

  if (fechas.length === 0) {
    this.alertaMantenimiento = {
      estado: 'sin-fecha',
      titulo: 'Sin proxima fecha',
      detalle: 'Este equipo no tiene una proxima fecha de mantenimiento registrada.'
    };
    return;
  }

  const proximaFecha = fechas[0];
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  proximaFecha.setHours(0, 0, 0, 0);

  const diferenciaDias = Math.ceil(
    (proximaFecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
  );

  const fechaTexto = proximaFecha.toLocaleDateString('es-CO');

  if (diferenciaDias < 0) {
    this.alertaMantenimiento = {
      estado: 'vencido',
      titulo: 'Mantenimiento vencido',
      detalle: `La proxima fecha era ${fechaTexto}. Tiene ${Math.abs(diferenciaDias)} dia(s) de retraso.`
    };
    return;
  }

  if (diferenciaDias <= 7) {
    this.alertaMantenimiento = {
      estado: 'proximo',
      titulo: 'Mantenimiento proximo',
      detalle: `La proxima fecha es ${fechaTexto}. Faltan ${diferenciaDias} dia(s).`
    };
    return;
  }

  this.alertaMantenimiento = {
    estado: 'al-dia',
    titulo: 'Mantenimiento al dia',
    detalle: `La proxima fecha es ${fechaTexto}. Faltan ${diferenciaDias} dia(s).`
  };
  }

  cargarEquipoParaEditar() {
    if (!this.equipo) return;

    this.nuevoEquipo = {
      codigo_barras: this.equipo.codigo_barras,
      serial: this.equipo.serial,
      nombre: this.equipo.nombre,
      marca: this.equipo.marca || '',
      empresa: this.equipo.empresa || '',
      ubicacion: this.equipo.ubicacion || '',
      area: this.equipo.area || '',
      asignacion: this.equipo.asignacion || '',
      estado: this.equipo.estado || 'activo',
      fecha_compra: this.equipo.fecha_compra ? this.equipo.fecha_compra.substring(0, 10) : ''
    };

    this.mostrarFormularioEdicionEquipo = true;
    this.mostrarFormularioEquipo = false;
    this.mostrarFormularioMantenimiento = false;
  }

  actualizarEquipo() {
    if (!this.equipo) return;

    if (
      !this.nuevoEquipo.codigo_barras ||
      !this.nuevoEquipo.serial ||
      !this.nuevoEquipo.nombre
    ) {
      this.mensaje = 'Complete codigo de barras, serial y nombre del equipo.';
      return;
    }

    const datos = {
      ...this.nuevoEquipo,
      fecha_compra: this.nuevoEquipo.fecha_compra || null
    };

    this.equiposService.actualizarEquipo(this.equipo.id, datos).subscribe({
      next: (respuesta: { ok: boolean; mensaje: string; equipo: Equipo }) => {
        this.mensaje = 'Equipo actualizado correctamente.';
        this.equipo = respuesta.equipo;
        this.codigoBusqueda = respuesta.equipo.codigo_barras;
        this.mostrarFormularioEdicionEquipo = false;
        this.listarEquipos();
      },
      error: () => {
        this.mensaje = 'Error al actualizar el equipo. Revise si el codigo o serial ya existen.';
      }
  });
}

eliminarMantenimiento() {
  if (!this.equipo || !this.mantenimientoSeleccionado) return;

  this.abrirConfirmacion(
    'Eliminar mantenimiento',
    'Esta accion eliminara el mantenimiento y sus evidencias asociadas. No se puede deshacer.',
    'eliminar-mantenimiento'
  );
}

confirmarEliminarMantenimiento() {
  if (!this.equipo || !this.mantenimientoSeleccionado) return;

  this.equiposService.eliminarMantenimiento(this.mantenimientoSeleccionado.id).subscribe({
    next: () => {
      this.mensaje = 'Mantenimiento eliminado correctamente.';
      this.mantenimientoSeleccionado = null;
      this.mantenimientoEditando = null;
      this.cargarMantenimientos(this.equipo!.id);
      this.cargarResumen();
      this.listarReporteMantenimientos();
    },
    error: () => {
      this.mensaje = 'Error al eliminar el mantenimiento.';
      }
    });
  }

  eliminarEquipo() {
    if (!this.equipo) return;

    this.abrirConfirmacion(
      'Eliminar equipo',
      'Tambien se eliminara todo su historial de mantenimientos y evidencias asociadas.',
      'eliminar-equipo'
    );
  }

  confirmarEliminarEquipo() {
    if (!this.equipo) return;

    this.equiposService.eliminarEquipo(this.equipo.id).subscribe({
      next: () => {
        this.mensaje = 'Equipo eliminado correctamente.';
        this.equipo = null;
        this.codigoBusqueda = '';
        this.mantenimientos = [];
        this.mantenimientoSeleccionado = null;
        this.mantenimientoEditando = null;
        this.mostrarFormularioMantenimiento = false;
        this.mostrarFormularioEdicionEquipo = false;
        this.cargarResumen();
        this.listarEquipos();
      },
      error: () => {
        this.mensaje = 'Error al eliminar el equipo.';
      }
    });
  }

  abrirConfirmacion(
    titulo: string,
    mensaje: string,
    accion: AccionConfirmacion,
    evidencia: EvidenciaMantenimiento | null = null
  ) {
    this.confirmacion = {
      visible: true,
      titulo,
      mensaje,
      accion,
      evidencia
    };
  }

  cancelarConfirmacion() {
    this.confirmacion.visible = false;
    this.confirmacion.accion = null;
    this.confirmacion.evidencia = null;
  }

  ejecutarConfirmacion() {
    const { accion, evidencia } = this.confirmacion;
    this.cancelarConfirmacion();

    if (accion === 'eliminar-evidencia' && evidencia) {
      this.confirmarEliminarEvidencia(evidencia);
      return;
    }

    if (accion === 'eliminar-mantenimiento') {
      this.confirmarEliminarMantenimiento();
      return;
    }

    if (accion === 'eliminar-equipo') {
      this.confirmarEliminarEquipo();
    }
  }
registrarMantenimiento() {
  if (!this.equipo) {
    this.mensaje = 'Primero busque un equipo.';
    return;
  }

  if (
    !this.nuevoMantenimiento.fecha_mantenimiento ||
    !this.nuevoMantenimiento.tipo_mantenimiento ||
    !this.nuevoMantenimiento.tecnico_id ||
    !this.nuevoMantenimiento.descripcion
  ) {
    this.mensaje = 'Complete los campos obligatorios del mantenimiento.';
    return;
  }

  const tecnicoSeleccionado = this.tecnicos.find(
    (t) => t.id === this.nuevoMantenimiento.tecnico_id
  );

  const datos = {
    equipo_id: this.equipo.id,
    fecha_mantenimiento: this.nuevoMantenimiento.fecha_mantenimiento,
    tipo_mantenimiento: this.nuevoMantenimiento.tipo_mantenimiento,
    tecnico: tecnicoSeleccionado ? tecnicoSeleccionado.nombre : this.nuevoMantenimiento.tecnico,
    tecnico_id: this.nuevoMantenimiento.tecnico_id,
    descripcion: this.nuevoMantenimiento.descripcion,
    observaciones: this.nuevoMantenimiento.observaciones,
    estado: this.nuevoMantenimiento.estado,
    proxima_fecha: this.nuevoMantenimiento.proxima_fecha || null
  };

  this.equiposService.registrarMantenimiento(datos).subscribe({
    next: (respuesta: { ok: boolean; mensaje: string; mantenimiento: Mantenimiento }) => {
      this.mensaje = 'Mantenimiento registrado correctamente.';
      const archivos = [...this.archivosNuevoMantenimiento];

      this.nuevoMantenimiento = {
        fecha_mantenimiento: '',
        tipo_mantenimiento: 'preventivo',
        tecnico: '',
        tecnico_id: null,
        descripcion: '',
        observaciones: '',
        estado: 'terminado',
        proxima_fecha: ''
      };
      this.archivosNuevoMantenimiento = [];

      if (archivos.length > 0) {
        this.equiposService.subirEvidencias(respuesta.mantenimiento.id, archivos).subscribe({
          next: () => {
            this.mensaje = 'Mantenimiento y evidencias registrados correctamente.';
            this.mostrarFormularioMantenimiento = false;
            this.cargarMantenimientos(this.equipo!.id);
            this.cargarResumen();
            this.listarReporteMantenimientos();
          },
          error: () => {
            this.mensaje = 'Mantenimiento registrado, pero hubo error al subir las evidencias.';
            this.mostrarFormularioMantenimiento = false;
            this.cargarMantenimientos(this.equipo!.id);
            this.cargarResumen();
            this.listarReporteMantenimientos();
          }
        });
        return;
      }

      this.mostrarFormularioMantenimiento = false;
      this.cargarMantenimientos(this.equipo!.id);
      this.cargarResumen();
      this.listarReporteMantenimientos();
    },
    error: () => {
      this.mensaje = 'Error al registrar el mantenimiento.';
    }
  });
}
registrarEquipo() {
  if (
    !this.nuevoEquipo.codigo_barras ||
    !this.nuevoEquipo.serial ||
    !this.nuevoEquipo.nombre
  ) {
    this.mensaje = 'Complete codigo de barras, serial y nombre del equipo.';
    return;
  }

  const datos = {
    ...this.nuevoEquipo,
    fecha_compra: this.nuevoEquipo.fecha_compra || null
  };

  this.equiposService.registrarEquipo(datos).subscribe({
    next: (respuesta: { ok: boolean; mensaje: string; equipo: Equipo }) => {
      this.mensaje = 'Equipo registrado correctamente.';
      this.vistaActiva = 'operacion';
      this.equipo = respuesta.equipo;
      this.mantenimientos = [];
      this.codigoBusqueda = respuesta.equipo.codigo_barras;
      this.mostrarFormularioMantenimiento = true;

      this.nuevoEquipo = {
        codigo_barras: '',
        serial: '',
        nombre: '',
        marca: '',
        empresa: '',
        ubicacion: '',
        area: '',
        asignacion: '',
        estado: 'activo',
        fecha_compra: ''
      };

      this.mostrarFormularioEquipo = false;
        this.cargarResumen();
        this.listarEquipos();
        this.listarReporteMantenimientos();
      },
    error: () => {
      this.mensaje = 'Error al registrar el equipo. Revise si el codigo o serial ya existen.';
    }
  });
}
}
