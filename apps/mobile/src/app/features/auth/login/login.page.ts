import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { IonContent } from '@ionic/angular';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, RouterLink],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isSigningIn = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  readonly mode = signal<'login' | 'register' | 'recover' | 'reset'>(
    inject(ActivatedRoute).snapshot.data['passwordReset'] ? 'reset' : 'login',
  );
  readonly notice = signal<string | null>(null);
  readonly emailBusy = signal(false);

  setMode(mode: 'login' | 'register' | 'recover'): void {
    this.mode.set(mode);
    this.errorMessage.set(null);
    this.notice.set(null);
  }

  async submitEmail(email: string, password: string): Promise<void> {
    if (this.emailBusy()) return;
    this.emailBusy.set(true);
    this.errorMessage.set(null);
    this.notice.set(null);
    try {
      switch (this.mode()) {
        case 'login':
          await this.authService.signInWithEmail(email.trim(), password);
          break;
        case 'register':
          await this.authService.registerWithEmail(email.trim(), password);
          this.notice.set('Si el registro está disponible, recibirás un correo de confirmación.');
          break;
        case 'recover':
          await this.authService.requestPasswordReset(email.trim());
          this.notice.set('Si existe una cuenta con ese correo, recibirás un enlace de recuperación.');
          break;
        case 'reset':
          await this.authService.resetPassword(password);
          break;
      }
    } catch (error: unknown) {
      const code = (error as { code?: string } | null)?.code;
      const message = this.mode() === 'recover' &&
        (code === 'user_not_found' || code === 'email_address_not_authorized')
        ? 'Si existe una cuenta con ese correo, recibirás un enlace de recuperación.'
        : code === 'email_not_confirmed' ? 'Confirma tu correo antes de iniciar sesión.'
        : code === 'invalid_credentials' ? 'Revisa el correo y la contraseña.'
        : code === 'weak_password' ? 'Elige una contraseña más segura.'
        : code === 'over_email_send_rate_limit' ? 'Se alcanzó el límite de correos. Intenta más tarde.'
        : 'No pudimos completar la solicitud. Intenta de nuevo.';
      if (this.mode() === 'recover' && (code === 'user_not_found' || code === 'email_address_not_authorized')) {
        this.notice.set(message);
      } else {
        this.errorMessage.set(message);
      }
    } finally {
      this.emailBusy.set(false);
    }
  }

  async handleGoogleLogin(): Promise<void> {
    if (this.isSigningIn() || this.emailBusy()) return;

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
