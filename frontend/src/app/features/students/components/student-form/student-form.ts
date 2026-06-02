import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { inject } from '@angular/core';
import { Navbar } from '../../../../shared/components/navbar/navbar';
import { Sidebar } from '../../../../shared/components/sidebar/sidebar';
import { LoadingSpinner } from '../../../../shared/components/loading-spinner/loading-spinner';

type FormStep = 'personal' | 'academic' | 'account';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Navbar, Sidebar, LoadingSpinner],
  templateUrl: './student-form.html',
  styleUrl: './student-form.css'
})
export class StudentForm {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEditMode = signal(false);
  currentStep = signal<FormStep>('personal');
  isSaving = signal(false);

  steps: { key: FormStep; label: string; icon: string }[] = [
    { key: 'personal', label: 'Thông tin cá nhân', icon: 'user' },
    { key: 'academic', label: 'Thông tin học tập', icon: 'book' },
    { key: 'account', label: 'Tài khoản', icon: 'lock' },
  ];

  currentStepIndex = computed(() =>
    this.steps.findIndex(s => s.key === this.currentStep())
  );

  form = signal({
    // Personal
    fullName: '',
    dob: '',
    gender: 'Nam',
    ethnicity: 'Kinh',
    religion: 'Không',
    nationality: 'Việt Nam',
    idCard: '',
    idDate: '',
    idPlace: '',
    phone: '',
    email: '',
    address: '',
    hometown: '',
    // Academic
    studentId: '',
    faculty: '',
    major: '',
    course: '',
    classId: '',
    advisor: '',
    enrollDate: '',
    status: 'Đang học',
    // Account
    username: '',
    password: '',
    confirmPassword: '',
  });

  errors = signal<Record<string, string>>({});

  faculties = [
    'Khoa Công nghệ Thông tin',
    'Khoa Kinh tế',
    'Khoa Kỹ thuật',
    'Khoa Ngoại ngữ',
  ];

  majors: Record<string, string[]> = {
    'Khoa Công nghệ Thông tin': ['Kỹ thuật Phần mềm', 'Công nghệ thông tin', 'Hệ thống thông tin', 'Khoa học máy tính'],
    'Khoa Kinh tế': ['Quản trị kinh doanh', 'Kế toán', 'Tài chính ngân hàng'],
    'Khoa Kỹ thuật': ['Kỹ thuật điện tử', 'Kỹ thuật cơ khí'],
    'Khoa Ngoại ngữ': ['Tiếng Anh', 'Tiếng Nhật', 'Tiếng Hàn'],
  };

  availableMajors = computed(() => {
    return this.majors[this.form().faculty] ?? [];
  });

  validateCurrentStep(): boolean {
    const f = this.form();
    const errs: Record<string, string> = {};

    if (this.currentStep() === 'personal') {
      if (!f.fullName.trim()) errs['fullName'] = 'Vui lòng nhập họ tên';
      if (!f.dob) errs['dob'] = 'Vui lòng chọn ngày sinh';
      if (!f.idCard.trim()) errs['idCard'] = 'Vui lòng nhập số CMND/CCCD';
      if (!f.phone.trim()) errs['phone'] = 'Vui lòng nhập số điện thoại';
      if (!f.email.trim()) errs['email'] = 'Vui lòng nhập email';
    }

    if (this.currentStep() === 'academic') {
      if (!f.studentId.trim()) errs['studentId'] = 'Vui lòng nhập mã sinh viên';
      if (!f.faculty) errs['faculty'] = 'Vui lòng chọn khoa';
      if (!f.major) errs['major'] = 'Vui lòng chọn ngành';
      if (!f.classId.trim()) errs['classId'] = 'Vui lòng nhập lớp';
    }

    if (this.currentStep() === 'account') {
      if (!f.password) errs['password'] = 'Vui lòng nhập mật khẩu';
      if (f.password !== f.confirmPassword) errs['confirmPassword'] = 'Mật khẩu không khớp';
    }

    this.errors.set(errs);
    return Object.keys(errs).length === 0;
  }

  nextStep() {
    if (!this.validateCurrentStep()) return;
    const idx = this.currentStepIndex();
    if (idx < this.steps.length - 1) {
      this.currentStep.set(this.steps[idx + 1].key);
    }
  }

  prevStep() {
    const idx = this.currentStepIndex();
    if (idx > 0) {
      this.currentStep.set(this.steps[idx - 1].key);
      this.errors.set({});
    }
  }

  async onSubmit() {
    if (!this.validateCurrentStep()) return;
    this.isSaving.set(true);
    await new Promise(r => setTimeout(r, 1400));
    this.isSaving.set(false);
    this.router.navigate(['/students/list']);
  }

  updateField(field: string, value: string) {
    this.form.update(f => ({ ...f, [field]: value }));
    // Clear error on change
    if (this.errors()[field]) {
      this.errors.update(e => { const copy = { ...e }; delete copy[field]; return copy; });
    }
    // Reset major when faculty changes
    if (field === 'faculty') {
      this.form.update(f => ({ ...f, major: '' }));
    }
  }

  getError(field: string): string {
    return this.errors()[field] ?? '';
  }
}