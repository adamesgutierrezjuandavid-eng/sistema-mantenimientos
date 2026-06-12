import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Mantenimiento } from '../../services/equipos';

@Component({
  selector: 'app-mantenimiento-historial',
  standalone: true,
  imports: [DatePipe, NgFor, NgIf],
  templateUrl: './mantenimiento-historial.html',
  styleUrls: ['./mantenimiento-historial.css']
})
export class MantenimientoHistorial {
  @Input() mantenimientos: Mantenimiento[] = [];

  @Output() exportar = new EventEmitter<void>();
  @Output() verDetalle = new EventEmitter<Mantenimiento>();
}
