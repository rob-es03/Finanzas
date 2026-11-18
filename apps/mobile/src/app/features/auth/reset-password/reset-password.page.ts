import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
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

function passwordsIguales(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return password && confirm && password !== confirm ? { noCoinciden: true } : null;
}

/**
 * Pantalla a la que llega el enlace de recuperación.
 * Supabase deja una sesión de recuperación activa al abrirlo; sin ella el
 * enlace está caducado o ya se usó.
 */
@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, IonContent],
  templateUrl: './reset-password.page.html',
  styleUrls: ['../auth-form.scss', '../login/login.page.scss'],
})
export class ResetPasswordPage implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly minPassword = 8;
  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly enlaceValido = signal<boolean>(true);
  readonly showPassword = signal<boolean>(false);

  readonly form = this.fb.nonNullable.group(
    {
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordsIguales },
  );

  get password() {
    return this.form.controls.password;
  }

  get confirmPassword() {
    return this.form.controls.confirmPassword;
  }

  async ngOnInit(): Promise<void> {
    await this.authService.whenReady();
    if (typeof window === 'undefined') return;
    // El enlace llega con `?code=`; hay que canjearlo aquí sin redirigir.
    const haySesion = await this.authService.exchangeRecoveryCode(window.location.href);
    this.enlaceValido.set(haySesion);
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
      await this.authService.updatePassword(this.form.getRawValue().password);
      await this.router.navigate(['/dashboard']);
    } catch (err: unknown) {
      this.errorMessage.set(
        err instanceof Error ? err.message : 'No se pudo cambiar la contraseña.',
      );
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
