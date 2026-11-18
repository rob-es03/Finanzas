import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
  ],
  templateUrl: './dashboard.page.html',
})
export class DashboardPage {
  readonly authService = inject(AuthService);

  async handleSignOut(): Promise<void> {
    await this.authService.signOut();
  }
}
