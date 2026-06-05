import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Navbar } from '../../../../shared/components/navbar/navbar';
import { Sidebar } from '../../../../shared/components/sidebar/sidebar';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { LoadingSpinner } from '../../../../shared/components/loading-spinner/loading-spinner';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Navbar, Sidebar, ConfirmDialog, LoadingSpinner],
  templateUrl: './student-detail.html',
  styleUrl: './student-detail.css'
})
export class StudentDetail implements OnInit {
  private http = inject(HttpClient);
  private authService: AuthService = inject(AuthService);

  isEditing = signal(false);
  isSaving = signal(false);
  showConfirmSave = signal(false);

  student = signal<any>({});
  user = signal<any>({});
  
  editForm = signal({
    phone: '',
    email: '',
    address: '',
    avatar: ''
  });

  isLoading = signal(true);

  ngOnInit() {
    this.authService.getCurrentUser().subscribe({
      next: (res: any) => {
        if (res.data) {
          this.user.set(res.data);
          if (res.data.email === 'demo@example.com') {
            this.loadMockData();
          } else {
            this.loadRealData();
          }
        }
      },
      error: () => this.loadMockData()
    });
  }

  loadRealData() {
    this.http.get<any>('http://localhost:5000/api/students/profile').subscribe({
      next: (res) => {
        this.student.set(res.data);
        this.editForm.set({
          phone: res.data.phone || '',
          email: this.user().email || '',
          address: res.data.permanent_address || '',
          avatar: res.data.avatar_url || ''
        });
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }

  loadMockData() {
    this.user.set({ email: 'demo@example.com', status: 'active' });
    this.student.set({
      full_name: 'Nguyễn Văn An',
      student_code: 'SV2021001',
      faculty_name: 'Khoa Công nghệ Thông tin',
      major: 'Kỹ thuật Phần mềm',
      enrollment_year: '2021',
      phone: '0901234567',
      permanent_address: '123 Nguyễn Văn Linh, TP.HCM'
    });
    this.editForm.set({
      phone: '0901234567',
      email: 'demo@example.com',
      address: '123 Nguyễn Văn Linh, TP.HCM',
      avatar: ''
    });
    this.isLoading.set(false);
  }

  toggleEdit() {
    if (this.isEditing()) {
      this.showConfirmSave.set(true);
    } else {
      this.isEditing.set(true);
    }
  }

  confirmSave() {
    this.showConfirmSave.set(false);
    this.isSaving.set(true);

    if (this.user().email === 'demo@example.com') {
      setTimeout(() => {
        this.student.update(s => ({ ...s, phone: this.editForm().phone, permanent_address: this.editForm().address }));
        this.user.update(u => ({ ...u, email: this.editForm().email }));
        this.isSaving.set(false);
        this.isEditing.set(false);
      }, 1000);
      return;
    }

    const payload = {
      phone: this.editForm().phone,
      permanent_address: this.editForm().address,
      avatar_url: this.editForm().avatar,
      requested_email: this.editForm().email
    };

    this.http.put('http://localhost:5000/api/students/profile', payload).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.isEditing.set(false);
        
        // Update local state to reflect changes
        this.student.update(s => ({ 
          ...s, 
          phone: payload.phone, 
          permanent_address: payload.permanent_address,
          avatar_url: payload.avatar_url
        }));
        this.user.update(u => ({ ...u, email: payload.requested_email }));
        
        alert('Đã cập nhật thông tin thành công!');
      },
      error: (err) => {
        console.error(err);
        this.isSaving.set(false);
        alert('Có lỗi xảy ra khi cập nhật thông tin.');
      }
    });
  }

  cancelSave() {
    this.showConfirmSave.set(false);
    this.isEditing.set(false);
    this.editForm.set({
      phone: this.student().phone || '',
      email: this.user().email || '',
      address: this.student().permanent_address || '',
      avatar: this.student().avatar_url || ''
    });
  }
}