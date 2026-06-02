import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-spinner.html',
  styleUrl: './loading-spinner.css'
})
export class LoadingSpinner {
  size = input<'sm' | 'md' | 'lg'>('md');
  message = input<string>('Đang tải...');
  overlay = input<boolean>(false);
}