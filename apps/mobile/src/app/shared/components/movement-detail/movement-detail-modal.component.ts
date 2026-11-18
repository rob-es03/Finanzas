import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Movement } from '@finanzas/contracts';
import { MoneyPipe } from '../../pipes/money.pipe';

@Component({
  selector: 'app-movement-detail-modal',
  standalone: true,
  imports: [CommonModule, MoneyPipe],
  templateUrl: './movement-detail-modal.component.html',
  styleUrls: ['./movement-detail-modal.component.scss'],
})
export class MovementDetailModalComponent {
  @Input({ required: true }) movement!: Movement;
  @Output() closeModal = new EventEmitter<void>();
  @Output() edit = new EventEmitter<Movement>();
  @Output() delete = new EventEmitter<Movement>();

  showDeleteConfirm = false;

  onEdit(): void {
    this.edit.emit(this.movement);
  }

  askDelete(): void {
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
  }

  confirmDelete(): void {
    this.delete.emit(this.movement);
  }

  onClose(): void {
    this.closeModal.emit();
  }
}
