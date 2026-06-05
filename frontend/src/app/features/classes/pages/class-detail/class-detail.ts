import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Navbar } from '../../../../shared/components/navbar/navbar';
import { Sidebar } from '../../../../shared/components/sidebar/sidebar';
import { LoadingSpinner } from '../../../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-class-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, Navbar, Sidebar, LoadingSpinner],
  templateUrl: './class-detail.html',
  styleUrl: './class-detail.css',
})
export class ClassDetail implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);

  course = signal<any>(null);
  activeTab = signal<'announcements' | 'students' | 'documents'>('announcements');
  isLoading = signal(true);

  ngOnInit() {
    const courseId = this.route.snapshot.paramMap.get('id');
    if (courseId) {
      this.http.get<any>(`http://localhost:5000/api/students/classes/${courseId}`).subscribe({
        next: (res) => {
          if (res.success) {
            this.course.set(res.data);
          }
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error(err);
          this.isLoading.set(false);
        }
      });
    }
  }
}
