import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule, IonContent],
  templateUrl: './callback.page.html',
  styleUrls: ['./callback.page.scss'],
})
export class AuthCallbackPage implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly statusMessage = signal<string>('Verificando credenciales con Google...');

  async ngOnInit(): Promise<void> {
    try {
      if (typeof window !== 'undefined') {
        const currentUrl = window.location.href;
        this.statusMessage.set('Sincronizando sesión segura con Supabase...');
        await this.authService.handleOAuthRedirectUrl(currentUrl);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error durante la verificación';
      this.router.navigate(['/auth/error'], { queryParams: { message: msg } });
    }
  }
}
