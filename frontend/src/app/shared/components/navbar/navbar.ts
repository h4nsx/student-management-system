import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  private router = inject(Router);

  currentUser = signal({
    name: 'Nguyễn Văn An',
    studentId: 'SV2021001',
    avatar: null as string | null
  });

  notificationCount = signal(3);
  isProfileMenuOpen = signal(false);
  currentTime = signal(new Date());

  greeting = computed(() => {
    const hour = this.currentTime().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  });

  avatarInitials = computed(() => {
    const name = this.currentUser().name;
    return name.split(' ').map(n => n[0]).slice(-2).join('').toUpperCase();
  });

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
    this.router.navigate(['/auth/login']);
  }
}