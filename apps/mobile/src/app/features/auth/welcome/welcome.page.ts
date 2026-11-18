import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [IonContent],
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
})
export class WelcomePage {
  private readonly router = inject(Router);
  readonly authService = inject(AuthService);

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
