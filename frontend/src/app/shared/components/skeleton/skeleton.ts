import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-table">
      <div class="skeleton-header">
        <div class="skeleton-box" *ngFor="let i of [1,2,3,4,5]"></div>
      </div>
      <div class="skeleton-row" *ngFor="let i of rowsArray">
        <div class="skeleton-box" *ngFor="let j of [1,2,3,4,5]"></div>
      </div>
    </div>
  `,
  styleUrl: './skeleton.css'
})
export class SkeletonTable {
  @Input() rows: number = 5;

  get rowsArray() {
    return Array(this.rows).fill(0);
  }
}

@Component({
  selector: 'app-skeleton-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-card">
      <div class="skeleton-box skeleton-icon"></div>
      <div class="skeleton-card-content">
        <div class="skeleton-box skeleton-text-short"></div>
        <div class="skeleton-box skeleton-text-long"></div>
      </div>
    </div>
  `,
  styleUrl: './skeleton.css'
})
export class SkeletonCard {}
