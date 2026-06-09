import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface DatosMantenimientoForm {
  fecha_mantenimiento: string;
  tipo_mantenimiento: string;
  tecnico: string;
  descripcion: string;
  observaciones: string;
  estado: string;
  proxima_fecha: string;
}

@Component({
  selector: 'app-mantenimiento-form',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './mantenimiento-form.html',
  styleUrls: ['./mantenimiento-form.css']
})
export class MantenimientoForm {
  @Input({ required: true }) mantenimiento!: DatosMantenimientoForm;
  @Input() archivosSeleccionados: File[] = [];

  @Output() guardar = new EventEmitter<void>();
  @Output() seleccionarFotos = new EventEmitter<Event>();
}
