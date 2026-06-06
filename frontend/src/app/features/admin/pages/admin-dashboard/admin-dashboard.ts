import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Navbar } from '../../../../shared/components/navbar/navbar';
import { Sidebar } from '../../../../shared/components/sidebar/sidebar';
import { LoadingSpinner } from '../../../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, Navbar, Sidebar, LoadingSpinner],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {
  private http = inject(HttpClient);

  kpis = signal<any>(null);
  charts = signal<any>(null);
  recentActivities = signal<any[]>([]);
  isLoading = signal(true);

  // Pagination for recent activities
  currentPage = signal(1);
  pageSize = 5;
  
  paginatedActivities = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.recentActivities().slice(start, start + this.pageSize);
  });
  
  totalPages = computed(() => Math.ceil(this.recentActivities().length / this.pageSize));

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  ngOnInit() {
    this.http.get<any>('http://localhost:5000/api/admin/dashboard').subscribe({
      next: (res) => {
        if (res.success) {
          this.kpis.set(res.data.kpis);
          
          // Format charts data for CSS rendering
          const c = res.data.charts;
          
          // Faculty max value for bar scaling
          const maxFaculty = Math.max(...c.studentsByFaculty.map((f: any) => parseInt(f.count)), 1);
          c.studentsByFaculty = c.studentsByFaculty.map((f: any) => ({
            ...f,
            percentage: (parseInt(f.count) / maxFaculty) * 100
          }));

          // Registration max value
          const maxReg = Math.max(...c.monthlyRegistration.map((m: any) => parseInt(m.count)), 1);
          c.monthlyRegistration = c.monthlyRegistration.map((m: any) => ({
            ...m,
            percentage: (parseInt(m.count) / maxReg) * 100
          })).reverse(); // chronological order

          this.charts.set(c);
          this.recentActivities.set(res.data.recentActivities);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }

  formatCurrency(value: string | number): string {
    const val = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  }
}
