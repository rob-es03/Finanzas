import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, IonContent],
  templateUrl: './forgot-password.page.html',
  styleUrls: ['../auth-form.scss', '../login/login.page.scss'],
})
export class ForgotPasswordPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly isSubmitting = signal<boolean>(false);
  readonly sent = signal<boolean>(false);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  get email() {
    return this.form.controls.email;
  }

  async submit(): Promise<void> {
    if (this.isSubmitting()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    try {
      await this.authService.sendPasswordReset(this.form.getRawValue().email);
    } finally {
      this.isSubmitting.set(false);
      // Respuesta siempre igual, exista o no la cuenta: lo contrario permitiría
      // averiguar qué direcciones están registradas.
      this.sent.set(true);
    }
  }

  goBack(): void {
    this.router.navigate(['/auth/login']);
  }
}
