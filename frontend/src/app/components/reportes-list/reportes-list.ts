import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MantenimientoReporte, PaginationMeta } from '../../services/equipos';

export interface FiltrosReporte {
  fecha_inicio: string;
  fecha_fin: string;
  tecnico: string;
  estado: string;
  tipo: string;
}

@Component({
  selector: 'app-reportes-list',
  standalone: true,
  imports: [DatePipe, FormsModule, NgFor, NgIf],
  templateUrl: './reportes-list.html',
  styleUrls: ['./reportes-list.css']
})
export class ReportesList {
  @Input({ required: true }) mantenimientos: MantenimientoReporte[] = [];
  @Input({ required: true }) filtros!: FiltrosReporte;
  @Input({ required: true }) paginacion!: PaginationMeta;

  @Output() filtrar = new EventEmitter<void>();
  @Output() limpiar = new EventEmitter<void>();
  @Output() exportar = new EventEmitter<void>();
  @Output() cambiarPagina = new EventEmitter<number>();
}
