export interface User {
  id: string | number;
  email: string;
  role: 'student' | 'admin' | 'staff';
  status: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token: string;
  user?: User;
}

export interface LoginCredentials {
  email?: string;
  password?: string;
}

export interface ChangePasswordRequest {
  currentPassword?: string;
  newPassword?: string;
}
