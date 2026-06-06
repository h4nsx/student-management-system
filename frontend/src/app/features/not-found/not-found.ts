import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="not-found-page">
      <div class="not-found-content">
        <div class="error-code">404</div>
        <h1>Không tìm thấy trang</h1>
        <p>Trang bạn tìm kiếm không tồn tại hoặc đã bị di chuyển.</p>
        <a routerLink="/dashboard" class="btn-back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Quay về trang chủ
        </a>
      </div>
    </div>
  `,
  styles: [`
    .not-found-page {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #0f172a;
      font-family: 'Inter', system-ui, sans-serif;
    }
    .not-found-content {
      text-align: center;
      padding: 40px;
    }
    .error-code {
      font-size: 120px;
      font-weight: 900;
      background: linear-gradient(135deg, #6366f1, #3b82f6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      line-height: 1;
      margin-bottom: 16px;
    }
    h1 {
      font-size: 28px;
      color: #f1f5f9;
      margin: 0 0 12px;
    }
    p {
      font-size: 16px;
      color: #94a3b8;
      margin: 0 0 32px;
    }
    .btn-back {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: #6366f1;
      color: #fff;
      border-radius: 10px;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      transition: background 0.2s;
    }
    .btn-back:hover {
      background: #4f46e5;
    }
  `]
})
export class NotFound {}
