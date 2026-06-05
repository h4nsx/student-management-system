import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
  roles?: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar implements OnInit {
  private router = inject(Router);
  private authService: AuthService = inject(AuthService);

  isCollapsed = signal(false);

  allNavItems: NavItem[] = [
    { label: 'Dashboard', icon: 'home', route: '/dashboard', roles: ['student', 'admin', 'staff'] },
    { label: 'Danh sách SV', icon: 'users', route: '/students/list', roles: ['admin', 'staff'] },
    { label: 'Hồ sơ cá nhân', icon: 'user', route: '/students/profile', roles: ['student'] },
    { label: 'Thông tin chi tiết', icon: 'file-text', route: '/students/detail', roles: ['student', 'admin', 'staff'] },
    { label: 'Tài liệu', icon: 'folder', route: '/documents', roles: ['student', 'admin', 'staff'] },
    { label: 'Lớp học', icon: 'book', route: '/classes', roles: ['student'] },
    { label: 'Thông báo', icon: 'bell', route: '/notifications', badge: 0, roles: ['student', 'admin', 'staff'] },
    { label: 'Mã QR', icon: 'grid', route: '/qr-card', roles: ['student'] },
  ];

  navItems = signal<NavItem[]>([]);

  ngOnInit() {
    this.authService.getCurrentUser().subscribe({
      next: (res: any) => {
        const userRole = res.data?.role || 'student';
        this.filterNavItems(userRole);
      },
      error: () => {
        this.filterNavItems('student');
      }
    });
  }

  filterNavItems(role: string) {
    const filtered = this.allNavItems.filter(item => !item.roles || item.roles.includes(role));
    this.navItems.set(filtered);
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }

  toggleCollapse() {
    this.isCollapsed.update(v => !v);
  }
}