import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-auth-error',
  standalone: true,
  imports: [CommonModule, IonContent],
  templateUrl: './error.page.html',
  styleUrls: ['./error.page.scss'],
})
export class AuthErrorPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly authService = inject(AuthService);

  readonly errorDetail = signal<string>('Ocurrió un error inesperado al procesar la autenticación.');

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['message']) {
        this.errorDetail.set(params['message']);
      } else if (this.authService.authError()) {
        this.errorDetail.set(this.authService.authError()!);
      }
    });
  }

  retryLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  goToWelcome(): void {
    this.router.navigate(['/auth/welcome']);
  }
}
