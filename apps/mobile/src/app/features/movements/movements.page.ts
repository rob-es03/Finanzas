import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Movement } from '@finanzas/contracts';
import { IonContent, IonHeader, IonToolbar } from '@ionic/angular';
import { FinancialStateService } from '../../data/financial-state.service';
import { MovementDetailModalComponent } from '../../shared/components/movement-detail/movement-detail-modal.component';
import { MovementRowComponent } from '../../shared/components/movement-row/movement-row.component';
import { QuickRecordModalComponent } from '../../shared/components/quick-record/quick-record-modal.component';

@Component({
  selector: 'app-movements',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    MovementRowComponent,
    QuickRecordModalComponent,
    MovementDetailModalComponent,
  ],
  templateUrl: './movements.page.html',
  styleUrls: ['./movements.page.scss'],
})
export class MovementsPage {
  readonly stateService = inject(FinancialStateService);
  private readonly router = inject(Router);

  // Estados modales
  showRecordModal = false;
  selectedMovementForDetail?: Movement;
  movementToEdit?: Movement;

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.stateService.filterSearch.set(input.value);
  }

  onMonthChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.stateService.filterMonth.set(input.value);
  }

  setCurrentMonth(): void {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    this.stateService.filterMonth.set(currentMonth);
  }

  setTypeFilter(type: 'all' | 'income' | 'expense'): void {
    this.stateService.filterType.set(type);
  }

  clearAllFilters(): void {
    this.stateService.clearFilters();
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
}
