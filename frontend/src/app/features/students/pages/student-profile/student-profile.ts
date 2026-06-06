import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Navbar } from '../../../../shared/components/navbar/navbar';
import { Sidebar } from '../../../../shared/components/sidebar/sidebar';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, Navbar, Sidebar],
  templateUrl: './student-profile.html',
  styleUrl: './student-profile.css'
})
export class StudentProfile implements OnInit {
  private http = inject(HttpClient);
  private authService: AuthService = inject(AuthService);

  student = signal<any>({});
  user = signal<any>({});
  isLoading = signal(true);

  ngOnInit() {
    this.authService.getCurrentUser().subscribe({
      next: (res: any) => {
        if (res.data) {
          this.user.set(res.data);
          this.loadRealProfile();
        }
      },
      error: () => this.loadRealProfile()
    });
  }

  loadRealProfile() {
    this.http.get<any>('http://localhost:5000/api/students/profile').subscribe({
      next: (res) => {
        this.student.set(res.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }



  initials = computed(() => {
    const name = this.student().full_name || 'A';
    return name.split(' ').map((n: string) => n[0]).slice(-2).join('').toUpperCase();
  });
}