import { Component, Input } from '@angular/core';
import { ResumenDashboard } from '../../services/equipos';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard {
  @Input({ required: true }) resumen!: ResumenDashboard;
}
