import { Routes } from '@angular/router';
import { DashboardHome } from './features/dashboard/pages/dashboard-home/dashboard-home';
import { Login } from './features/auth/pages/login/login';
import { ForgotPassword } from './features/auth/pages/forgot-password/forgot-password';
import { authGuard } from './core/guards/auth.guard';
import { roleRedirectGuard } from './core/guards/role-redirect.guard';

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
  { path: 'admin', redirectTo: 'admin/dashboard', pathMatch: 'full' },
  { path: 'admin/dashboard', component: AdminDashboard, canActivate: [authGuard] },
  { path: 'admin/users', component: AdminUsers, canActivate: [authGuard] },
  { path: 'admin/settings', component: AdminSettings, canActivate: [authGuard] },
  { path: 'admin/students/create', loadComponent: () => import('./features/admin/pages/admin-student-create/admin-student-create').then(m => m.AdminStudentCreate), canActivate: [authGuard] },
  { path: 'admin/students/:id', loadComponent: () => import('./features/admin/pages/admin-student-detail/admin-student-detail').then(m => m.AdminStudentDetail), canActivate: [authGuard] },
  { path: 'admin/classes', loadComponent: () => import('./features/admin/pages/admin-class-list/admin-class-list').then(m => m.AdminClassList), canActivate: [authGuard] },
  { path: 'admin/classes/create', loadComponent: () => import('./features/admin/pages/admin-class-create/admin-class-create').then(m => m.AdminClassCreate), canActivate: [authGuard] },
  { path: 'admin/classes/:id', loadComponent: () => import('./features/admin/pages/admin-class-detail/admin-class-detail').then(m => m.AdminClassDetail), canActivate: [authGuard] },
  { path: 'admin/schedules', loadComponent: () => import('./features/admin/pages/admin-schedule-list/admin-schedule-list').then(m => m.AdminScheduleList), canActivate: [authGuard] },
  { path: 'admin/schedules/create', loadComponent: () => import('./features/admin/pages/admin-schedule-create/admin-schedule-create').then(m => m.AdminScheduleCreate), canActivate: [authGuard] },
  { path: 'admin/schedules/edit/:id', loadComponent: () => import('./features/admin/pages/admin-schedule-edit/admin-schedule-edit').then(m => m.AdminScheduleEdit), canActivate: [authGuard] },
  { path: 'admin/documents', loadComponent: () => import('./features/admin/pages/admin-document-list/admin-document-list').then(m => m.AdminDocumentList), canActivate: [authGuard] },
  { path: 'admin/documents/upload', loadComponent: () => import('./features/admin/pages/admin-document-upload/admin-document-upload').then(m => m.AdminDocumentUpload), canActivate: [authGuard] },
  { path: 'admin/announcements', loadComponent: () => import('./features/admin/pages/admin-announcement-list/admin-announcement-list').then(m => m.AdminAnnouncementList), canActivate: [authGuard] },
  { path: 'admin/announcements/create', loadComponent: () => import('./features/admin/pages/admin-announcement-create/admin-announcement-create').then(m => m.AdminAnnouncementCreate), canActivate: [authGuard] },
  { path: 'admin/announcements/edit/:id', loadComponent: () => import('./features/admin/pages/admin-announcement-edit/admin-announcement-edit').then(m => m.AdminAnnouncementEdit), canActivate: [authGuard] },
  
  // Verification Routes
  { path: 'verifications', component: VerificationList, canActivate: [authGuard] },
  { path: 'verifications/:id', component: VerificationDetail, canActivate: [authGuard] },
  
  // Fallbacks
  { path: '', pathMatch: 'full', canActivate: [roleRedirectGuard], children: [] },
  { path: '**', loadComponent: () => import('./features/not-found/not-found').then(m => m.NotFound) }
];
