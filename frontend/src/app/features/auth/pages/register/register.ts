import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { inject } from '@angular/core';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  private router = inject(Router);

  fullName = signal('');
  studentId = signal('');
  email = signal('');
  password = signal('');
  confirmPassword = signal('');
  showPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');

  currentStep = signal(1);

  passwordStrength = computed(() => {
    const pw = this.password();
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  });

  strengthLabel = computed(() => {
    const s = this.passwordStrength();
    if (s === 0) return '';
    if (s === 1) return 'Yếu';
    if (s === 2) return 'Trung bình';
    if (s === 3) return 'Mạnh';
    return 'Rất mạnh';
  });

  async onSubmit() {
    if (this.password() !== this.confirmPassword()) {
      this.errorMessage.set('Mật khẩu xác nhận không khớp.');
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set('');
    await new Promise(r => setTimeout(r, 1500));
    this.isLoading.set(false);
    this.router.navigate(['/auth/login']);
  }
}