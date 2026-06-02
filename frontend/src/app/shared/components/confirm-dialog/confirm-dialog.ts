import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css'
})
export class ConfirmDialog {
  title = input<string>('Xác nhận');
  message = input<string>('Bạn có chắc chắn muốn thực hiện hành động này?');
  confirmLabel = input<string>('Xác nhận');
  cancelLabel = input<string>('Hủy');
  type = input<'danger' | 'warning' | 'info'>('danger');
  visible = input<boolean>(false);

  confirmed = output<void>();
  cancelled = output<void>();

  onConfirm() {
    this.confirmed.emit();
  }

  onCancel() {
    this.cancelled.emit();
  }
}