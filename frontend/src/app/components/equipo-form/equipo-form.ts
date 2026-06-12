import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface DatosEquipoForm {
  codigo_barras: string;
  serial: string;
  nombre: string;
  marca: string;
  empresa: string;
  ubicacion: string;
  area: string;
  asignacion: string;
  estado: string;
  fecha_compra: string;
}

@Component({
  selector: 'app-equipo-form',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './equipo-form.html',
  styleUrls: ['./equipo-form.css']
})
export class EquipoForm {
  @Input({ required: true }) equipo!: DatosEquipoForm;
  @Input() titulo = 'Equipo';
  @Input() submitLabel = 'Guardar';
  @Input() namePrefix = 'equipo';
  @Input() mostrarCancelar = false;

  @Output() guardar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();
}
