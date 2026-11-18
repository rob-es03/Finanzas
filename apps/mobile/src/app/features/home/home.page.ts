import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Movement } from '@finanzas/contracts';
import { IonContent, IonHeader, IonToolbar } from '@ionic/angular';
import { FinancialStateService } from '../../data/financial-state.service';
import { MovementDetailModalComponent } from '../../shared/components/movement-detail/movement-detail-modal.component';
import { MovementRowComponent } from '../../shared/components/movement-row/movement-row.component';
import { QuickRecordModalComponent } from '../../shared/components/quick-record/quick-record-modal.component';
import { MoneyPipe } from '../../shared/pipes/money.pipe';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonToolbar,
    MoneyPipe,
    MovementRowComponent,
    QuickRecordModalComponent,
    MovementDetailModalComponent,
  ],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  readonly stateService = inject(FinancialStateService);
  private readonly router = inject(Router);

  // Estados modales
  showRecordModal = false;
  selectedMovementForDetail?: Movement;
  movementToEdit?: Movement;

  // Acceso al perfil
  goToProfile(): void {
    this.router.navigate(['/auth/welcome']);
  }

  // Navegar a Movimientos
  goToMovements(): void {
    this.router.navigate(['/movements']);
  }

  onAccountChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.stateService.setSelectedAccount(select.value);
  }

  openRecordModal(): void {
    this.movementToEdit = undefined;
    this.showRecordModal = true;
  }

  closeRecordModal(): void {
    this.showRecordModal = false;
    this.movementToEdit = undefined;
  }

  onMovementSaved(): void {
    this.showRecordModal = false;
    this.movementToEdit = undefined;
  }

  openDetail(movement: Movement): void {
    this.selectedMovementForDetail = movement;
  }

  closeDetail(): void {
    this.selectedMovementForDetail = undefined;
  }

  editFromDetail(movement: Movement): void {
    this.selectedMovementForDetail = undefined;
    this.movementToEdit = movement;
    this.showRecordModal = true;
  }

  deleteFromDetail(movement: Movement): void {
    this.stateService.deleteMovement(movement.id);
    this.selectedMovementForDetail = undefined;
  }

  retryLoad(): void {
    this.stateService.hasPartialError.set(false);
  }
}
