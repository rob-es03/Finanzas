import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { InitialAccountSetup, SupportedCurrency } from '@finanzas/contracts';
import { IonContent } from '@ionic/angular';
import { AuthService } from '../../../core/auth/auth.service';

interface FormAccount {
  name: string;
  type: 'bank' | 'cash' | 'credit_card' | 'savings';
  balanceInput: string;
  color: string;
  icon: string;
}

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent],
  templateUrl: './onboarding.page.html',
  styleUrls: ['./onboarding.page.scss'],
})
export class OnboardingPage implements OnInit {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Pasos: 1 = Nombre/Moneda, 2 = Cuentas y Saldos Iniciales
  readonly currentStep = signal<number>(1);
  readonly isSaving = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  // Form fields
  fullName = '';
  selectedCurrency: SupportedCurrency = 'USD';

  // Cuentas preconfiguradas basadas en el prototipo histórico
  accounts: FormAccount[] = [
    { name: 'Banco Bolivariano', type: 'bank', balanceInput: '0.00', color: '#4f46e5', icon: 'business-outline' },
    { name: 'Produbanco', type: 'bank', balanceInput: '0.00', color: '#059669', icon: 'business-outline' },
    { name: 'Efectivo en mano', type: 'cash', balanceInput: '0.00', color: '#f59e0b', icon: 'cash-outline' },
  ];

  readonly currencies: { code: SupportedCurrency; name: string; symbol: string }[] = [
    { code: 'USD', name: 'Dólar Estadounidense (Ecuador, Panamá)', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'COP', name: 'Peso Colombiano', symbol: '$' },
    { code: 'MXN', name: 'Peso Mexicano', symbol: '$' },
    { code: 'PEN', name: 'Sol Peruano', symbol: 'S/.' },
  ];

  ngOnInit(): void {
    const profile = this.authService.profile();
    if (profile?.fullName) {
      this.fullName = profile.fullName;
    }
  }

  nextStep(): void {
    if (this.currentStep() === 1) {
      if (!this.fullName.trim()) {
        this.errorMessage.set('Por favor ingresa tu nombre para personalizar tu panel.');
        return;
      }
      this.errorMessage.set(null);
      this.currentStep.set(2);
      this.triggerHaptic();
    }
  }

  prevStep(): void {
    if (this.currentStep() === 2) {
      this.currentStep.set(1);
      this.triggerHaptic();
    }
  }

  addAccount(): void {
    this.accounts.push({
      name: 'Nueva cuenta',
      type: 'bank',
      balanceInput: '0.00',
      color: '#6366f1',
      icon: 'wallet-outline',
    });
    this.triggerHaptic();
  }

  removeAccount(index: number): void {
    if (this.accounts.length <= 1) return;
    this.accounts.splice(index, 1);
    this.triggerHaptic();
  }

  async finishOnboarding(): Promise<void> {
    if (this.isSaving()) return;

    try {
      this.isSaving.set(true);
      this.errorMessage.set(null);
      this.triggerHaptic();

      // Transformar cuentas y convertir saldos a CENTAVOS ENTEROS
      const initialAccounts: InitialAccountSetup[] = this.accounts.map((acc) => {
        const parsed = parseFloat(acc.balanceInput.replace(/,/g, '')) || 0;
        const initialBalanceCents = Math.round(parsed * 100); // Conversión exacta a centavos

        return {
          name: acc.name.trim() || 'Cuenta',
          type: acc.type,
          initialBalanceCents,
          color: acc.color,
          icon: acc.icon,
        };
      });

      await this.authService.completeOnboarding({
        fullName: this.fullName.trim(),
        currency: this.selectedCurrency,
        accounts: initialAccounts,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar la configuración inicial';
      this.errorMessage.set(msg);
      this.isSaving.set(false);
    }
  }

  private triggerHaptic(): void {
    try {
      Haptics.impact({ style: ImpactStyle.Light });
    } catch {
      // Ignorar en plataformas sin motor háptico
    }
  }
}
