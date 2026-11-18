import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Movement } from '@finanzas/contracts';
import { MoneyPipe } from '../../pipes/money.pipe';

@Component({
  selector: 'app-movement-row',
  standalone: true,
  imports: [CommonModule, MoneyPipe],
  templateUrl: './movement-row.component.html',
  styleUrls: ['./movement-row.component.scss'],
})
export class MovementRowComponent {
  @Input({ required: true }) movement!: Movement;
  @Output() selectMovement = new EventEmitter<Movement>();

  onRowClick(): void {
    this.selectMovement.emit(this.movement);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.selectMovement.emit(this.movement);
    }
  }
}
