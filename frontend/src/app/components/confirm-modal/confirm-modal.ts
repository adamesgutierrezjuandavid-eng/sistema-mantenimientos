import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  templateUrl: './confirm-modal.html',
  styleUrls: ['./confirm-modal.css']
})
export class ConfirmModal {
  @Input({ required: true }) titulo = '';
  @Input({ required: true }) mensaje = '';
  @Output() cancelar = new EventEmitter<void>();
  @Output() confirmar = new EventEmitter<void>();
}
