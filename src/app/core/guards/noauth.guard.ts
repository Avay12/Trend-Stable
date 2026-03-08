import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { filter, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NoAuthGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(): Observable<boolean> {
    return this.authService.authState$.pipe(
      filter((state) => state.checked), // Wait until auth check completes
      map(() => {
        if (this.authService.isLoggedIn()) {
          if (this.authService.getUserRole() === 'ADMIN') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/dashboard']);
          }
          return false;
        }
        return true;
      }),
    );
  }
}
