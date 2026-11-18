import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Movement, MovementType, QuickPreset } from '@finanzas/contracts';
import { FinancialStateService } from '../../../data/financial-state.service';

@Component({
  selector: 'app-quick-record-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quick-record-modal.component.html',
  styleUrls: ['./quick-record-modal.component.scss'],
})
export class QuickRecordModalComponent implements OnInit {
  readonly stateService = inject(FinancialStateService);

  @Input() editMovement?: Movement;
  @Output() closeModal = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Movement>();

  // Campos del formulario
  type: MovementType = 'expense';
  amountInput = '';
  description = '';
  selectedAccountId = '';
  selectedCategoryId = '';
  date = '';
  note = '';

  isSaving = false;
  errorMessage: string | null = null;
  showDiscardConfirm = false;

  ngOnInit(): void {
    if (this.editMovement) {
      // Modo edición
      this.type = this.editMovement.type;
      this.amountInput = (this.editMovement.amountCents / 100).toFixed(2);
      this.description = this.editMovement.description;
      this.selectedAccountId = this.editMovement.accountId;
      this.selectedCategoryId = this.editMovement.categoryId;
      this.date = this.editMovement.date;
      this.note = this.editMovement.note || '';
    } else {
      // Modo creación: valores por defecto propuestos
      this.type = 'expense';
      const today = new Date().toISOString().split('T')[0];
      this.date = today;

      // Si hay una cuenta activa específica seleccionada, usarla; si no, la primera cuenta bancaria
      const activeAcc = this.stateService.selectedAccountId();
      this.selectedAccountId = activeAcc !== 'all' ? activeAcc : this.stateService.accounts()[1]?.id || '';
      this.updateDefaultCategory();
    }
  }

  setType(newType: MovementType): void {
    if (this.type === newType) return;
    this.type = newType;
    this.updateDefaultCategory();
    this.triggerHaptic();
  }

  get availableCategories() {
    return this.stateService.categories().filter((c) => c.type === this.type);
  }

  get availablePresets(): QuickPreset[] {
    return this.stateService.presets().filter((p) => p.type === this.type);
  }

  updateDefaultCategory(): void {
    const cats = this.availableCategories;
    if (cats.length > 0) {
      this.selectedCategoryId = cats[0].id;
    }
  }

  /**
   * Ruta rápida de 3 toques: Abrir -> Elegir atajo -> Guardar
   */
  applyPreset(preset: QuickPreset): void {
    this.type = preset.type;
    this.amountInput = (preset.amountCents / 100).toFixed(2);
    this.description = preset.description;
    this.selectedCategoryId = preset.categoryId;
    this.selectedAccountId = preset.accountId;
    this.errorMessage = null;
    this.triggerHaptic();
  }

  async save(): Promise<void> {
    if (this.isSaving) return;

    // Validaciones
    const parsedAmount = parseFloat(this.amountInput.replace(/,/g, ''));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      this.errorMessage = 'Ingresa un monto positivo válido (ej. 15.50).';
      return;
    }

    if (!this.description.trim()) {
      this.errorMessage = 'La descripción es obligatoria.';
      return;
    }

    if (!this.selectedAccountId) {
      this.errorMessage = 'Selecciona una cuenta válida.';
      return;
    }

    if (!this.selectedCategoryId) {
      this.errorMessage = 'Selecciona una categoría válida.';
      return;
    }

    try {
      this.isSaving = true;
      this.errorMessage = null;
      this.triggerHaptic();

      const amountCents = Math.round(parsedAmount * 100);

      const savedMovement = await this.stateService.saveMovement({
        id: this.editMovement?.id,
        type: this.type,
        description: this.description.trim(),
        amountCents,
        date: this.date,
        accountId: this.selectedAccountId,
        categoryId: this.selectedCategoryId,
        note: this.note.trim() || undefined,
      });

      this.saved.emit(savedMovement);
    } catch (err: unknown) {
      // En caso de fallo, CONSERVA todos los datos en el formulario para reintento
      this.errorMessage = err instanceof Error ? err.message : 'Error al guardar el movimiento.';
      this.isSaving = false;
    }
  }

  onBackdropClick(): void {
    if (this.amountInput || this.description) {
      this.showDiscardConfirm = true;
    } else {
      this.closeModal.emit();
    }
  }

  cancelDiscard(): void {
    this.showDiscardConfirm = false;
  }

  confirmDiscard(): void {
    this.closeModal.emit();
  }

  private triggerHaptic(): void {
    try {
      Haptics.impact({ style: ImpactStyle.Light });
    } catch {
      // Ignorar en navegadores
    }
  }
}
