import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css'
})
export class ForgotPassword {
  private authService = inject(AuthService);

  email = signal('');
  isLoading = signal(false);
  isSent = signal(false);
  errorMessage = signal('');

  onSubmit() {
    if (!this.email()) {
      this.errorMessage.set('Vui lòng nhập email.');
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set('');
    
    this.authService.forgotPassword(this.email()).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.isSent.set(true);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
      }
    });
  }

  resend() {
    this.isSent.set(false);
  }
}