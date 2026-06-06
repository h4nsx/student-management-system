import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../../../shared/components/navbar/navbar';
import { Sidebar } from '../../../../shared/components/sidebar/sidebar';

@Component({
  selector: 'app-admin-document-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, Navbar, Sidebar],
  templateUrl: './admin-document-list.html',
  styleUrl: './admin-document-list.css'
})
export class AdminDocumentList implements OnInit {
  private router = inject(Router);
  private http = inject(HttpClient);

  documents = signal<any[]>([]);
  isLoading = signal(true);
  
  searchText = signal('');
  filterType = signal('');
  
  showDeleteConfirm = signal(false);
  selectedDocId = signal<number | null>(null);

  ngOnInit() {
    this.fetchDocuments();
  }

  fetchDocuments() {
    this.isLoading.set(true);
    let url = 'http://localhost:5000/api/admin/documents?';
    if (this.searchText()) url += `search=${encodeURIComponent(this.searchText())}&`;
    if (this.filterType()) url += `type=${encodeURIComponent(this.filterType())}&`;

    this.http.get<any>(url).subscribe({
      next: (res) => {
        if (res.success) this.documents.set(res.data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onSearch() {
    this.fetchDocuments();
  }
  
  onFilterChange(value: string) {
    this.filterType.set(value);
    this.fetchDocuments();
  }

  getCategoryName(type: string): string {
    const map: any = {
      'Course Material': 'Tài liệu môn học',
      'course_material': 'Tài liệu môn học',
      'Class Document': 'Tài liệu lớp học',
      'class_document': 'Tài liệu lớp học',
      'University Regulation': 'Quy định Cao Đẳng',
      'university_document': 'Quy định Cao Đẳng',
      'form': 'Biểu mẫu'
    };
    return map[type] || type;
  }

  confirmDelete(doc: any) {
    this.selectedDocId.set(doc.id);
    this.showDeleteConfirm.set(true);
  }

  deleteDocument() {
    if (this.selectedDocId()) {
      this.http.delete(`http://localhost:5000/api/admin/documents/${this.selectedDocId()}`).subscribe({
        next: () => {
          this.fetchDocuments();
          this.showDeleteConfirm.set(false);
          this.selectedDocId.set(null);
        }
      });
    }
  }
}
