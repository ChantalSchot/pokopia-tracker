import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    return true;
  }

  return auth.checkAuth().pipe(
    map(user => {
      if (user) return true;
      router.navigate(['/login']);
      return false;
    })
  );
};

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn() && auth.isAdmin()) {
    return true;
  }

  if (!auth.isLoggedIn()) {
    return auth.checkAuth().pipe(
      map(user => {
        if (user && auth.isAdmin()) return true;
        router.navigate(['/dashboard']);
        return false;
      })
    );
  }

  router.navigate(['/dashboard']);
  return false;
};
