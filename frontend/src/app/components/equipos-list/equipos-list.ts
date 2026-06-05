import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Equipo, PaginationMeta } from '../../services/equipos';

export interface FiltrosEquipos {
  texto: string;
  area: string;
  estado: string;
  asignacion: string;
}

@Component({
  selector: 'app-equipos-list',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf],
  templateUrl: './equipos-list.html',
  styleUrls: ['./equipos-list.css']
})
export class EquiposList {
  @Input({ required: true }) equipos: Equipo[] = [];
  @Input({ required: true }) filtros!: FiltrosEquipos;
  @Input({ required: true }) paginacion!: PaginationMeta;

  @Output() filtrar = new EventEmitter<void>();
  @Output() limpiar = new EventEmitter<void>();
  @Output() cambiarPagina = new EventEmitter<number>();
  @Output() seleccionar = new EventEmitter<Equipo>();
}
