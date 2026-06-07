import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Navbar } from '../../../../shared/components/navbar/navbar';
import { Sidebar } from '../../../../shared/components/sidebar/sidebar';
import { SkeletonTable } from '../../../../shared/components/skeleton/skeleton';

@Component({
  selector: 'app-admin-class-list',
  standalone: true,
  imports: [CommonModule, RouterModule, Navbar, Sidebar, SkeletonTable],
  templateUrl: './admin-class-list.html',
  styleUrl: './admin-class-list.css'
})
export class AdminClassList implements OnInit {
  private router = inject(Router);
  private http = inject(HttpClient);

  classes = signal<any[]>([]);
  isLoading = signal(true);
  searchText = signal('');

  ngOnInit() {
    this.fetchClasses();
  }

  fetchClasses() {
    this.isLoading.set(true);
    let url = 'http://localhost:5000/api/admin/classes';
    if (this.searchText()) {
      url += `?search=${encodeURIComponent(this.searchText())}`;
    }
    
    this.http.get<any>(url).subscribe({
      next: (res) => {
        if (res.success) this.classes.set(res.data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onSearch() {
    this.fetchClasses();
  }

  viewDetail(id: number) {
    this.router.navigate(['/admin/classes', id]);
  }
}
