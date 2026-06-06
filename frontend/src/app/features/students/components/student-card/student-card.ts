import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-student-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-card.html',
  styleUrl: './student-card.css'
})
export class StudentCard {
  student = input.required<any>();

  view = output<any>();
  edit = output<any>();
  delete = output<any>();

  initials = computed(() => {
    const s = this.student();
    if (!s || !s.full_name) return '';
    const parts = s.full_name.split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  });

  gpaClass = computed(() => {
    const g = this.student().gpa;
    if (g >= 3.6) return 'excellent';
    if (g >= 3.2) return 'good';
    if (g >= 2.5) return 'average';
    return 'weak';
  });

  // Unique gradient per student based on id
  avatarGradient = computed(() => {
    const gradients = [
      'linear-gradient(135deg, #6366f1, #8b5cf6)',
      'linear-gradient(135deg, #0ea5e9, #6366f1)',
      'linear-gradient(135deg, #10b981, #0ea5e9)',
      'linear-gradient(135deg, #f59e0b, #ef4444)',
      'linear-gradient(135deg, #ec4899, #8b5cf6)',
      'linear-gradient(135deg, #14b8a6, #6366f1)',
    ];
    return gradients[this.student().id % gradients.length];
  });
}