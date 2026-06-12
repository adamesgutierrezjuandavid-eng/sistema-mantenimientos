import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Equipo } from '../../services/equipos';

@Component({
  selector: 'app-equipo-search',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf],
  templateUrl: './equipo-search.html',
  styleUrls: ['./equipo-search.css']
})
export class EquipoSearch {
  @Input() codigo = '';
  @Input() historialBusqueda: string[] = [];
  @Input() sugerenciasBusqueda: string[] = [];
  @Input() sugerenciaActiva = -1;
  @Input() resultadosBusqueda: Equipo[] = [];
  @Input() mensaje = '';
  @Input() cargando = false;
  @Input() ultimoCodigoNoEncontrado = '';
  @Input() mostrarFormularioEquipo = false;

  @Output() codigoChange = new EventEmitter<string>();
  @Output() buscar = new EventEmitter<string>();
  @Output() enterBusqueda = new EventEmitter<string>();
  @Output() moverSugerencia = new EventEmitter<number>();
  @Output() codigoEditado = new EventEmitter<void>();
  @Output() limpiarHistorial = new EventEmitter<void>();
  @Output() usarHistorial = new EventEmitter<string>();
  @Output() seleccionarResultado = new EventEmitter<Equipo>();
  @Output() prepararRegistro = new EventEmitter<void>();
  @Output() alternarRegistro = new EventEmitter<void>();

  actualizarCodigo(valor: string) {
    this.codigoChange.emit(valor);
    this.codigoEditado.emit();
  }
}
