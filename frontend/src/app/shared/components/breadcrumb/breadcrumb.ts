import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

interface Breadcrumb {
  label: string;
  url: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="breadcrumb-nav" aria-label="breadcrumb">
      <ol class="breadcrumb-list">
        <li class="breadcrumb-item">
          <a routerLink="/admin/dashboard" class="breadcrumb-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </a>
        </li>
        @for (item of breadcrumbs; track item.url; let last = $last) {
          <li class="breadcrumb-separator">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </li>
          <li class="breadcrumb-item" [class.active]="last">
            @if (last) {
              <span class="breadcrumb-text">{{ item.label }}</span>
            } @else {
              <a [routerLink]="item.url" class="breadcrumb-link">{{ item.label }}</a>
            }
          </li>
        }
      </ol>
    </nav>
  `,
  styleUrl: './breadcrumb.css'
})
export class BreadcrumbComponent {
  @Input() customBreadcrumbs?: Breadcrumb[];
  
  breadcrumbs: Breadcrumb[] = [];
  
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit() {
    if (this.customBreadcrumbs) {
      this.breadcrumbs = this.customBreadcrumbs;
    } else {
      this.buildBreadcrumbs();
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe(() => {
        this.buildBreadcrumbs();
      });
    }
  }

  private buildBreadcrumbs() {
    // A simplified auto-breadcrumb logic based on URL
    const url = this.router.url;
    const parts = url.split('/').filter(p => p);
    
    let currentUrl = '';
    const crumbs: Breadcrumb[] = [];
    
    // Skip 'admin' root in breadcrumbs since Home icon covers it
    const startIdx = parts[0] === 'admin' ? 1 : 0;
    
    for (let i = startIdx; i < parts.length; i++) {
      const part = parts[i];
      currentUrl += `/${parts[i - 1] === 'admin' && i === 1 ? 'admin/' : ''}${part}`;
      
      // Auto-label mapping
      let label = part.charAt(0).toUpperCase() + part.slice(1);
      if (part === 'students') label = 'Sinh viên';
      if (part === 'classes') label = 'Lớp học';
      if (part === 'schedules') label = 'Lịch học';
      if (part === 'documents') label = 'Tài liệu';
      if (part === 'announcements') label = 'Thông báo';
      if (part === 'create') label = 'Thêm mới';
      if (part === 'edit') label = 'Chỉnh sửa';
      if (part.match(/^[0-9]+$/)) label = 'Chi tiết'; // ID
      
      crumbs.push({ label, url: currentUrl });
    }
    
    this.breadcrumbs = crumbs;
  }
}
