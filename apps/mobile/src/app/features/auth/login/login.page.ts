import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { IonContent } from '@ionic/angular';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, IonContent],
  templateUrl: './login.page.html',
  styleUrls: ['../auth-form.scss', './login.page.scss'],
})
export class LoginPage {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly isSigningIn = signal<boolean>(false);
  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly showPassword = signal<boolean>(false);

  /**
   * Se llega aquí con `?confirmado=1` cuando el enlace del correo se abrió en
   * otro navegador: la cuenta quedó confirmada, solo falta iniciar sesión.
   */
  readonly justConfirmed = inject(ActivatedRoute).snapshot.queryParamMap.get('confirmado') === '1';

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  get email() {
    return this.form.controls.email;
  }

  get password() {
    return this.form.controls.password;
  }

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  async submit(): Promise<void> {
    if (this.isSubmitting()) return;

    this.errorMessage.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    try {
      this.isSubmitting.set(true);
      const { email, password } = this.form.getRawValue();
      await this.authService.signInWithEmail(email, password);
    } catch (err: unknown) {
      this.errorMessage.set(
        err instanceof Error ? err.message : 'No se pudo iniciar sesión.',
      );
    } finally {
      this.isSubmitting.set(false);
    }
  }

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
