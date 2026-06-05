import { Component, inject, signal, computed, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit {
  private router = inject(Router);
  private authService: AuthService = inject(AuthService);

  currentUser = signal({
    name: 'Đang tải...',
    studentId: '...',
    avatar: null as string | null
  });

  notificationCount = signal(0);
  isProfileMenuOpen = signal(false);
  currentTime = signal(new Date());

  ngOnInit() {
    this.authService.getCurrentUser().subscribe({
      next: (res: any) => {
        if (res.data) {
          this.currentUser.set({
            name: res.data.profile?.full_name || res.data.email || 'Người dùng',
            studentId: res.data.profile?.student_code || 'N/A',
            avatar: res.data.profile?.avatar_url || null
          });
        }
      },
      error: () => {
        // Fallback for demo or error
        this.currentUser.set({
          name: 'Demo Student',
          studentId: 'demo@example.com',
          avatar: null
        });
      }
    });

    setInterval(() => {
      this.currentTime.set(new Date());
    }, 60000);
  }

  greeting = computed(() => {
    const hour = this.currentTime().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  });

  firstName = computed(() => {
    const parts = this.currentUser().name.trim().split(' ');
    return parts.length > 0 ? parts[parts.length - 1] : '';
  });

  avatarInitials = computed(() => {
    const name = this.currentUser().name;
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  });

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-wrapper')) {
      this.isProfileMenuOpen.set(false);
    }
  }

  toggleProfileMenu() {
    this.isProfileMenuOpen.update(v => !v);
  }

  closeProfileMenu() {
    this.isProfileMenuOpen.set(false);
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
    this.closeProfileMenu();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}