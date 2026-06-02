import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Student } from '../../pages/student-list/student-list';

@Component({
  selector: 'app-student-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-card.html',
  styleUrl: './student-card.css'
})
export class StudentCard {
  student = input.required<Student>();

  view = output<Student>();
  edit = output<Student>();
  delete = output<Student>();

  initials = computed(() => {
    return this.student().fullName
      .split(' ')
      .map(n => n[0])
      .slice(-2)
      .join('')
      .toUpperCase();
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