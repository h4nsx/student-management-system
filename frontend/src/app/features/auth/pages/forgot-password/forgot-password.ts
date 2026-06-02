import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css'
})
export class ForgotPassword {
  email = signal('');
  isLoading = signal(false);
  isSent = signal(false);
  errorMessage = signal('');

  async onSubmit() {
    if (!this.email()) {
      this.errorMessage.set('Vui lòng nhập email.');
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set('');
    await new Promise(r => setTimeout(r, 1500));
    this.isLoading.set(false);
    this.isSent.set(true);
  }

  resend() {
    this.isSent.set(false);
  }
}