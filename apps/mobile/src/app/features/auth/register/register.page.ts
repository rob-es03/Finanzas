import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { AuthService } from '../../../core/auth/auth.service';

/** Las dos contraseñas deben coincidir. */
function passwordsIguales(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return password && confirm && password !== confirm ? { noCoinciden: true } : null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, IonContent],
  templateUrl: './register.page.html',
  styleUrls: ['../auth-form.scss', '../login/login.page.scss'],
})
export class RegisterPage {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  /** Mínimo propio, más exigente que el del servidor (6). */
  readonly minPassword = 8;

  readonly isSubmitting = signal<boolean>(false);
  readonly isSigningIn = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly confirmationSent = signal<boolean>(false);
  readonly showPassword = signal<boolean>(false);

  readonly form = this.fb.nonNullable.group(
    {
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordsIguales },
  );

  get email() {
    return this.form.controls.email;
  }

  get password() {
    return this.form.controls.password;
  }

  get confirmPassword() {
    return this.form.controls.confirmPassword;
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
      const faltaConfirmar = await this.authService.signUpWithEmail(email, password);
      if (faltaConfirmar) {
        this.confirmationSent.set(true);
      }
    } catch (err: unknown) {
      this.errorMessage.set(
        err instanceof Error ? err.message : 'No se pudo crear la cuenta.',
      );
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async handleGoogleLogin(): Promise<void> {
    if (this.isSigningIn()) return;
    try {
      this.isSigningIn.set(true);
      this.errorMessage.set(null);
      await this.authService.signInWithGoogle();
    } catch (err: unknown) {
      this.errorMessage.set(
        err instanceof Error ? err.message : 'No se pudo continuar con Google.',
      );
      this.isSigningIn.set(false);
    }
  }

  goBack(): void {
    this.router.navigate(['/auth/login']);
  }
}
