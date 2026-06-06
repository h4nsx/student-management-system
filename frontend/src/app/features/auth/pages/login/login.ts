import { Component, signal, isDevMode } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private router = inject(Router);
  private authService = inject(AuthService);

  studentId = signal('');
  password = signal('');
  showPassword = signal(false);
  rememberMe = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');
  isDev = isDevMode();

  fillDemo() {
    this.studentId.set('demo@example.com');
    this.password.set('password123');
  }

  fillAdminDemo() {
    this.studentId.set('admin@example.com');
    this.password.set('admin123');
  }

  onSubmit() {
    if (!this.studentId() || !this.password()) {
      this.errorMessage.set('Vui lòng nhập đầy đủ thông tin.');
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set('');
    
    this.authService.login({ email: this.studentId(), password: this.password() })
      .subscribe({
        next: (res: any) => {
          this.isLoading.set(false);
          // Store role for fallback routing
          if (res.user?.role) {
            localStorage.setItem('userRole', res.user.role);
          }
          if (res.user && res.user.role === 'admin') {
            this.router.navigate(['/admin/dashboard']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
        }
      });
  }
}