import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, catchError, of, take } from 'rxjs';


export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);


  // Check if we already have a current user
  if (authService.currentUser()) {
    return true;
  }

  // If not, wait for the auth state to be determined
  return authService.getAuthState().pipe(
    take(1), // Take only the first emission to complete the observable
    map((auth) => {
      if (auth.isAuthenticated) {
        return true;
      } else {
        // Redirect to login with return URL
        router.navigate(['/login'], {
          queryParams: { returnUrl: state.url },
        });
        return false;
      }
    }),
    catchError((error) => {
      // Handle any errors that might occur
      console.error('Auth guard error:', error);
      router.navigate(['/login'], {
        queryParams: { returnUrl: state.url },
      });
      return of(false);
    })
  );
};
