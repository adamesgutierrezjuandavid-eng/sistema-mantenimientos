import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Equipo } from '../../services/equipos';

@Component({
  selector: 'app-equipo-ficha',
  standalone: true,
  templateUrl: './equipo-ficha.html',
  styleUrls: ['./equipo-ficha.css']
})
export class EquipoFicha {
  @Input({ required: true }) equipo!: Equipo;
  @Input() mostrandoFormularioMantenimiento = false;

  @Output() editar = new EventEmitter<void>();
  @Output() eliminar = new EventEmitter<void>();
  @Output() alternarMantenimiento = new EventEmitter<void>();
}
