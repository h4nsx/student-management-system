import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { inject } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private router = inject(Router);

  studentId = signal('');
  password = signal('');
  showPassword = signal(false);
  rememberMe = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');

  async onSubmit() {
    if (!this.studentId() || !this.password()) {
      this.errorMessage.set('Vui lòng nhập đầy đủ thông tin.');
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set('');
    // Simulate API call
    await new Promise(r => setTimeout(r, 1500));
    this.isLoading.set(false);
    this.router.navigate(['/dashboard']);
  }
}