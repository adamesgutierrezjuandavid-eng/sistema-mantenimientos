import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { EvidenciaMantenimiento, Mantenimiento } from '../../services/equipos';

export interface DatosMantenimientoEditando {
  fecha_mantenimiento: string;
  tipo_mantenimiento: string;
  tecnico: string;
  descripcion: string;
  observaciones: string;
  estado: string;
  proxima_fecha: string;
}

@Component({
  selector: 'app-mantenimiento-detalle',
  standalone: true,
  imports: [DatePipe, FormsModule, NgFor, NgIf],
  templateUrl: './mantenimiento-detalle.html',
  styleUrls: ['./mantenimiento-detalle.css']
})
export class MantenimientoDetalle {
  @Input({ required: true }) mantenimiento!: Mantenimiento;
  @Input() evidencias: EvidenciaMantenimiento[] = [];
  @Input() cargandoEvidencias = false;
  @Input() mensajeEvidencias = '';
  @Input() archivosSeleccionados: File[] = [];
  @Input() mantenimientoEditando: Mantenimiento | null = null;
  @Input({ required: true }) datosEditando!: DatosMantenimientoEditando;

  @Output() actualizarEvidencias = new EventEmitter<number>();
  @Output() seleccionarFotos = new EventEmitter<Event>();
  @Output() subirFotos = new EventEmitter<void>();
  @Output() editar = new EventEmitter<Mantenimiento>();
  @Output() eliminar = new EventEmitter<void>();
  @Output() cerrar = new EventEmitter<void>();
  @Output() eliminarEvidencia = new EventEmitter<EvidenciaMantenimiento>();
  @Output() guardarEdicion = new EventEmitter<void>();
  @Output() cancelarEdicion = new EventEmitter<void>();

  urlEvidencia(evidencia: EvidenciaMantenimiento) {
    return `${environment.apiUrl}${evidencia.ruta_archivo}`;
  }
}
