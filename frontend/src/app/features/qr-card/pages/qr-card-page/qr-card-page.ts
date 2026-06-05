import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Navbar } from '../../../../shared/components/navbar/navbar';
import { Sidebar } from '../../../../shared/components/sidebar/sidebar';
import { LoadingSpinner } from '../../../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-qr-card-page',
  standalone: true,
  imports: [CommonModule, Navbar, Sidebar, LoadingSpinner],
  templateUrl: './qr-card-page.html',
  styleUrl: './qr-card-page.css',
})
export class QrCardPage implements OnInit {
  private http = inject(HttpClient);

  isLoading = signal(true);
  
  // Student Data
  studentInfo = signal<any>(null);
  
  // QR Data
  qrToken = signal<string>('');
  qrExpiresAt = signal<string>('');
  
  // History
  scanHistory = signal<any[]>([]);

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    this.isLoading.set(true);
    
    // Fetch Profile
    this.http.get<any>('http://localhost:5000/api/students/profile').subscribe({
      next: (res) => {
        if (res.success) {
          this.studentInfo.set(res.data);
        }
      }
    });

    // Fetch QR Token
    this.http.get<any>('http://localhost:5000/api/students/qr').subscribe({
      next: (res) => {
        if (res.success) {
          this.qrToken.set(res.data.token);
          this.qrExpiresAt.set(res.data.expires_at);
        }
      }
    });

    // Fetch History
    this.http.get<any>('http://localhost:5000/api/students/qr/history').subscribe({
      next: (res) => {
        if (res.success) {
          this.scanHistory.set(res.data);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  refreshQr() {
    // In a real app, this might POST to a refresh endpoint
    // For now we just re-fetch the existing one
    this.http.get<any>('http://localhost:5000/api/students/qr').subscribe({
      next: (res) => {
        if (res.success) {
          this.qrToken.set(res.data.token);
        }
      }
    });
  }

  printCard() {
    window.print();
  }

  downloadCard() {
    alert("Chức năng tải thẻ đang được phát triển.");
  }
}
