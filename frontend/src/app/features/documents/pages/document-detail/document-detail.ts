import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Navbar } from '../../../../shared/components/navbar/navbar';
import { Sidebar } from '../../../../shared/components/sidebar/sidebar';
import { LoadingSpinner } from '../../../../shared/components/loading-spinner/loading-spinner';

export interface AppDocument {
  id: number;
  class_name: string | null;
  title: string;
  type: string;
  file_url: string;
  uploaded_by_email: string;
  created_at: string;
}

@Component({
  selector: 'app-document-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, Navbar, Sidebar, LoadingSpinner],
  templateUrl: './document-detail.html',
  styleUrl: './document-detail.css',
})
export class DocumentDetail implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);

  document = signal<AppDocument | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fetchDocument(id);
    }
  }

  fetchDocument(id: string) {
    this.http.get<any>(`http://localhost:5000/api/documents/${id}`).subscribe({
      next: (res) => {
        if (res.success) {
          this.document.set(res.data);
        } else {
          this.error.set('Không tìm thấy tài liệu.');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching document', err);
        this.error.set('Có lỗi xảy ra khi tải tài liệu.');
        this.isLoading.set(false);
      }
    });
  }

  getTypeLabel(type: string) {
    switch(type) {
      case 'course_material': return 'Tài liệu môn học';
      case 'class_document': return 'Tài liệu sinh hoạt lớp';
      case 'university_document': return 'Quy định / Sổ tay';
      case 'form': return 'Biểu mẫu';
      default: return 'Tài liệu chung';
    }
  }
}
