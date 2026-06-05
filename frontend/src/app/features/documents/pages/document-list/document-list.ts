import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
  selector: 'app-document-list',
  standalone: true,
  imports: [CommonModule, RouterModule, Navbar, Sidebar, LoadingSpinner],
  templateUrl: './document-list.html',
  styleUrl: './document-list.css',
})
export class DocumentList implements OnInit {
  private http = inject(HttpClient);

  documents = signal<AppDocument[]>([]);
  isLoading = signal(true);
  
  searchQuery = signal('');
  filterType = signal('all'); // all, course_material, class_document, university_document, form

  ngOnInit() {
    this.http.get<any>('http://localhost:5000/api/documents/class').subscribe({
      next: (res) => {
        if (res.success) {
          this.documents.set(res.data);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching documents', err);
        this.isLoading.set(false);
      }
    });
  }

  filteredDocs = computed(() => {
    let docs = this.documents();
    
    // Filter
    if (this.filterType() !== 'all') {
      docs = docs.filter(d => d.type === this.filterType());
    }
    
    // Search
    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      docs = docs.filter(d => 
        d.title.toLowerCase().includes(q) || 
        (d.class_name && d.class_name.toLowerCase().includes(q))
      );
    }
    
    return docs;
  });

  // Group course materials by class_name
  groupedCourseMaterials = computed(() => {
    const courseDocs = this.filteredDocs().filter(d => d.type === 'course_material');
    const grouped: Record<string, AppDocument[]> = {};
    for (const doc of courseDocs) {
      const course = doc.class_name || 'Tài liệu chung';
      if (!grouped[course]) grouped[course] = [];
      grouped[course].push(doc);
    }
    return Object.entries(grouped).map(([course, docs]) => ({ course, docs }));
  });

  getDocsByType(type: string) {
    return this.filteredDocs().filter(d => d.type === type);
  }
}
