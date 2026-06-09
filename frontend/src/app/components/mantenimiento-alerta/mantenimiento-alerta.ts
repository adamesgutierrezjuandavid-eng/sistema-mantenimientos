import { Component, Input } from '@angular/core';

export interface AlertaMantenimiento {
  estado: string;
  titulo: string;
  detalle: string;
}

@Component({
  selector: 'app-mantenimiento-alerta',
  standalone: true,
  templateUrl: './mantenimiento-alerta.html',
  styleUrls: ['./mantenimiento-alerta.css']
})
export class MantenimientoAlerta {
  @Input({ required: true }) alerta!: AlertaMantenimiento;
}
