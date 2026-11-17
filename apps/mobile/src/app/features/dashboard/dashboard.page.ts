import { Component } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';

/**
 * Pantalla vacía de arranque (T-001).
 * El contenido real lo definen T-020/T-021 (Antigravity) y la capa de datos (T-002+).
 */
@Component({
  selector: 'app-dashboard',
  imports: [IonHeader, IonToolbar, IonTitle, IonContent],
  templateUrl: './dashboard.page.html',
})
export class DashboardPage {}
