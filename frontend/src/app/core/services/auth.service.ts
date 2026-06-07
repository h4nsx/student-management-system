import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginCredentials, ChangePasswordRequest } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly tokenKey = 'token';

  /**
   * Authenticate user and store JWT token
   * @param credentials User email and password
   * @returns Observable of AuthResponse
   */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.token) {
          this.setToken(response.token);
        }
      })
    );
  }

  /**
   * Request password reset link
   * @param email User email
   */
  forgotPassword(email: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/forgot-password`, { email });
  }

  /**
   * Get current authenticated user profile
   */
  getCurrentUser(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/me`);
  }

  /**
   * Change user password
   * @param data Current and new password
   */
  changePassword(data: ChangePasswordRequest): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(`${this.apiUrl}/change-password`, data);
  }

  /**
   * Clear session and remove token
   */
  logout(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem('userRole'); // Clear role cache as well
    }
  }

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated(): boolean {
    if (this.isBrowser()) {
      return !!localStorage.getItem(this.tokenKey);
    }
    return false;
  }

  /**
   * Helper to set auth token safely
   */
  private setToken(token: string): void {
    if (this.isBrowser()) {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  /**
   * Helper to check if code is running in browser environment
   */
  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }
}
