import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Equipo {
  id: number;
  codigo_barras: string;
  serial: string;
  nombre: string;
  marca: string;
  modelo: string;
  ubicacion: string;
  area: string;
  asignacion: string | null;
  estado: string;
  fecha_compra: string;
  created_at: string;
  updated_at: string;
}

export interface Mantenimiento {
  id: number;
  equipo_id: number;
  fecha_mantenimiento: string;
  tipo_mantenimiento: string;
  tecnico: string;
  descripcion: string;
  observaciones: string;
  estado: string;
  proxima_fecha: string | null;
  evidencias_count?: number;
  created_at: string;
  updated_at: string;
}

export interface EvidenciaMantenimiento {
  id: number;
  mantenimiento_id: number;
  nombre_archivo: string;
  ruta_archivo: string;
  tipo_archivo: string;
  created_at: string;
}

export interface MantenimientoReporte extends Mantenimiento {
  equipo: string;
  codigo_barras: string;
  serial: string;
  area: string;
  asignacion: string | null;
}

export interface ResumenDashboard {
  total_equipos: number;
  total_mantenimientos: number;
  mantenimientos_pendientes: number;
  proximos_mantenimientos: number;
}

export interface EstadoApi {
  ok: boolean;
  mensaje?: string;
  message?: string;
  base_datos?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class Equipos {
  private apiUrl = `${environment.apiUrl}/api/equipos`;
  private dashboardUrl = `${environment.apiUrl}/api/dashboard`;
  private saludUrl = `${environment.apiUrl}/api/salud`;

  constructor(private http: HttpClient) {}

  verificarApi(): Observable<EstadoApi> {
    return this.http.get<EstadoApi>(this.saludUrl);
  }

  buscarEquipo(valor: string): Observable<{ ok: boolean; equipo: Equipo }> {
    return this.http.get<{ ok: boolean; equipo: Equipo }>(
      `${this.apiUrl}/buscar/${valor}`
    );
  }

  obtenerResumen(): Observable<{ ok: boolean; resumen: ResumenDashboard }> {
    return this.http.get<{ ok: boolean; resumen: ResumenDashboard }>(
      `${this.dashboardUrl}/resumen`
    );
  }

  listarEquipos(filtros: {
    texto: string;
    area: string;
    estado: string;
    asignacion: string;
    page?: number;
    limit?: number;
  }): Observable<{ ok: boolean; equipos: Equipo[]; pagination: PaginationMeta }> {
    const params = new URLSearchParams();

    if (filtros.texto) params.set('texto', filtros.texto);
    if (filtros.area) params.set('area', filtros.area);
    if (filtros.estado) params.set('estado', filtros.estado);
    if (filtros.asignacion) params.set('asignacion', filtros.asignacion);
    if (filtros.page) params.set('page', String(filtros.page));
    if (filtros.limit) params.set('limit', String(filtros.limit));

    const query = params.toString();
    const url = query ? `${this.apiUrl}?${query}` : this.apiUrl;

    return this.http.get<{ ok: boolean; equipos: Equipo[]; pagination: PaginationMeta }>(url);
  }

  obtenerMantenimientos(
    equipoId: number
  ): Observable<{ ok: boolean; mantenimientos: Mantenimiento[] }> {
    return this.http.get<{ ok: boolean; mantenimientos: Mantenimiento[] }>(
      `${this.apiUrl}/${equipoId}/mantenimientos`
    );
  }

  registrarMantenimiento(datos: {
    equipo_id: number;
    fecha_mantenimiento: string;
    tipo_mantenimiento: string;
    tecnico: string;
    descripcion: string;
    observaciones: string;
    estado: string;
    proxima_fecha: string | null;
  }): Observable<{ ok: boolean; mensaje: string; mantenimiento: Mantenimiento }> {
    return this.http.post<{ ok: boolean; mensaje: string; mantenimiento: Mantenimiento }>(
      `${environment.apiUrl}/api/mantenimientos`,
      datos
    );
  }

  obtenerEvidencias(
    mantenimientoId: number
  ): Observable<{ ok: boolean; evidencias: EvidenciaMantenimiento[] }> {
    return this.http.get<{ ok: boolean; evidencias: EvidenciaMantenimiento[] }>(
      `${environment.apiUrl}/api/mantenimientos/${mantenimientoId}/evidencias`
    );
  }

  subirEvidencias(
    mantenimientoId: number,
    archivos: File[]
  ): Observable<{ ok: boolean; mensaje: string; evidencias: EvidenciaMantenimiento[] }> {
    const formData = new FormData();

    archivos.forEach((archivo) => {
      formData.append('fotos', archivo);
    });

    return this.http.post<{ ok: boolean; mensaje: string; evidencias: EvidenciaMantenimiento[] }>(
      `${environment.apiUrl}/api/mantenimientos/${mantenimientoId}/evidencias`,
      formData
    );
  }

  eliminarEvidencia(
    evidenciaId: number
  ): Observable<{ ok: boolean; mensaje: string; evidencia: EvidenciaMantenimiento }> {
    return this.http.delete<{ ok: boolean; mensaje: string; evidencia: EvidenciaMantenimiento }>(
      `${environment.apiUrl}/api/mantenimientos/evidencias/${evidenciaId}`
    );
  }

  actualizarMantenimiento(
    mantenimientoId: number,
    datos: {
      fecha_mantenimiento: string;
      tipo_mantenimiento: string;
      tecnico: string;
      descripcion: string;
      observaciones: string;
      estado: string;
      proxima_fecha: string | null;
    }
  ): Observable<{ ok: boolean; mensaje: string; mantenimiento: Mantenimiento }> {
    return this.http.put<{ ok: boolean; mensaje: string; mantenimiento: Mantenimiento }>(
      `${environment.apiUrl}/api/mantenimientos/${mantenimientoId}`,
      datos
    );
  }

  eliminarMantenimiento(
    mantenimientoId: number
  ): Observable<{ ok: boolean; mensaje: string; mantenimiento: Mantenimiento }> {
    return this.http.delete<{ ok: boolean; mensaje: string; mantenimiento: Mantenimiento }>(
      `${environment.apiUrl}/api/mantenimientos/${mantenimientoId}`
    );
  }

  listarMantenimientos(filtros: {
    fecha_inicio: string;
    fecha_fin: string;
    tecnico: string;
    estado: string;
    tipo: string;
    page?: number;
    limit?: number;
  }): Observable<{ ok: boolean; mantenimientos: MantenimientoReporte[]; pagination: PaginationMeta }> {
    const params = new URLSearchParams();

    if (filtros.fecha_inicio) params.set('fecha_inicio', filtros.fecha_inicio);
    if (filtros.fecha_fin) params.set('fecha_fin', filtros.fecha_fin);
    if (filtros.tecnico) params.set('tecnico', filtros.tecnico);
    if (filtros.estado) params.set('estado', filtros.estado);
    if (filtros.tipo) params.set('tipo', filtros.tipo);
    if (filtros.page) params.set('page', String(filtros.page));
    if (filtros.limit) params.set('limit', String(filtros.limit));

    const query = params.toString();
    const url = query
      ? `${environment.apiUrl}/api/mantenimientos?${query}`
      : `${environment.apiUrl}/api/mantenimientos`;

    return this.http.get<{ ok: boolean; mantenimientos: MantenimientoReporte[]; pagination: PaginationMeta }>(url);
  }

  registrarEquipo(datos: {
    codigo_barras: string;
    serial: string;
    nombre: string;
    marca: string;
    modelo: string;
    ubicacion: string;
    area: string;
    asignacion: string;
    estado: string;
    fecha_compra: string | null;
  }): Observable<{ ok: boolean; mensaje: string; equipo: Equipo }> {
    return this.http.post<{ ok: boolean; mensaje: string; equipo: Equipo }>(
      this.apiUrl,
      datos
    );
  }

  actualizarEquipo(
    equipoId: number,
    datos: {
      codigo_barras: string;
      serial: string;
      nombre: string;
      marca: string;
      modelo: string;
      ubicacion: string;
      area: string;
      asignacion: string;
      estado: string;
      fecha_compra: string | null;
    }
  ): Observable<{ ok: boolean; mensaje: string; equipo: Equipo }> {
    return this.http.put<{ ok: boolean; mensaje: string; equipo: Equipo }>(
      `${this.apiUrl}/${equipoId}`,
      datos
    );
  }

  eliminarEquipo(equipoId: number): Observable<{ ok: boolean; mensaje: string; equipo: Equipo }> {
    return this.http.delete<{ ok: boolean; mensaje: string; equipo: Equipo }>(
      `${this.apiUrl}/${equipoId}`
    );
  }
}
