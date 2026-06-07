import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const roleRedirectGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  if (typeof window !== 'undefined') {
    const role = localStorage.getItem('userRole');
    if (role === 'admin') {
      return router.createUrlTree(['/admin/dashboard']);
    }
  }
  
  return router.createUrlTree(['/dashboard']);
};
