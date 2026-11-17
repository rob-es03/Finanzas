import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { IonContent } from '@ionic/angular';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, IonContent],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isSigningIn = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  async handleGoogleLogin(): Promise<void> {
    if (this.isSigningIn()) return;

    try {
      // Feedback háptico nativo en Android al presionar el botón
      try {
        await Haptics.impact({ style: ImpactStyle.Light });
      } catch {
        // En navegadores o entornos sin soporte de vibración se ignora
      }

      this.isSigningIn.set(true);
      this.errorMessage.set(null);
      await this.authService.signInWithGoogle();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo iniciar sesión con Google';
      this.errorMessage.set(msg);
      this.isSigningIn.set(false);
    }
  }

  goBack(): void {
    this.router.navigate(['/auth/welcome']);
  }
}
