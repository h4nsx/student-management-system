import { Routes } from '@angular/router';
import { DashboardHome } from './features/dashboard/pages/dashboard-home/dashboard-home';
import { Login } from './features/auth/pages/login/login';
import { ForgotPassword } from './features/auth/pages/forgot-password/forgot-password';
import { authGuard } from './core/guards/auth.guard';

import { StudentProfile } from './features/students/pages/student-profile/student-profile';
import { StudentList } from './features/students/pages/student-list/student-list';
import { StudentDetail } from './features/students/pages/student-detail/student-detail';
import { DocumentList } from './features/documents/pages/document-list/document-list';
import { DocumentDetail } from './features/documents/pages/document-detail/document-detail';
import { NotificationList } from './features/notifications/pages/notification-list/notification-list';
import { QrCardPage } from './features/qr-card/pages/qr-card-page/qr-card-page';
import { AdminDashboard } from './features/admin/pages/admin-dashboard/admin-dashboard';
import { AdminUsers } from './features/admin/pages/admin-users/admin-users';
import { AdminSettings } from './features/admin/pages/admin-settings/admin-settings';
import { VerificationList } from './features/verification/pages/verification-list/verification-list';
import { VerificationDetail } from './features/verification/pages/verification-detail/verification-detail';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'forgot-password', component: ForgotPassword },
  
  // Protected Routes
  { path: 'dashboard', component: DashboardHome, canActivate: [authGuard] },
  { path: 'students/profile', component: StudentProfile, canActivate: [authGuard] },
  { path: 'students/list', component: StudentList, canActivate: [authGuard] },
  { path: 'students/detail', component: StudentDetail, canActivate: [authGuard] },
  { path: 'documents', component: DocumentList, canActivate: [authGuard] },
  { path: 'documents/:id', component: DocumentDetail, canActivate: [authGuard] },
  { path: 'notifications', component: NotificationList, canActivate: [authGuard] },
  { path: 'qr-card', component: QrCardPage, canActivate: [authGuard] },
  { path: 'classes', loadComponent: () => import('./features/classes/pages/class-list/class-list').then(m => m.ClassList), canActivate: [authGuard] },
  { path: 'classes/:id', loadComponent: () => import('./features/classes/pages/class-detail/class-detail').then(m => m.ClassDetail), canActivate: [authGuard] },
  
  // Admin Routes
  { path: 'admin', component: AdminDashboard, canActivate: [authGuard] },
  { path: 'admin/users', component: AdminUsers, canActivate: [authGuard] },
  { path: 'admin/settings', component: AdminSettings, canActivate: [authGuard] },
  
  // Verification Routes
  { path: 'verifications', component: VerificationList, canActivate: [authGuard] },
  { path: 'verifications/:id', component: VerificationDetail, canActivate: [authGuard] },
  
  // Fallbacks
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' }
];
