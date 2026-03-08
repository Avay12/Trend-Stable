import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-oauth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <div class="flex flex-col items-center gap-4">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p class="text-muted-foreground animate-pulse">Completing login...</p>
      </div>
    </div>
  `
})
export class OAuthCallbackComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  ngOnInit() {
    // Determine if user is new or existing based on query param
    const isNewUser = this.route.snapshot.queryParams['is_new_user'] === 'true';
    
    // The backend successfully authenticated and set the cookie.
    // Now we verify the session on the frontend.
    this.authService.getUserInfo().subscribe({
      next: (user) => {
        // Manually update auth state since we bypassed the normal login() flow
        localStorage.setItem('isAuthenticated', 'true');
        this.authService.isLoggedIn.set(true);
        // We can access the private subject via the public method if we expose one, 
        // or re-trigger a check. For now, forcing a reload or subsequent navigation works.
        
        // Use a slight timeout to ensure state propagation if needed, then redirect
        setTimeout(() => {
          if (isNewUser) {
             // Maybe go to a welcome page or onboarding? 
             // For now, dashboard is fine.
             this.router.navigate(['/dashboard']);
          } else {
             this.router.navigate(['/dashboard']);
          }
        }, 500);
      },
      error: (err) => {
        console.error('OAuth Callback Error:', err);
        // If getting user info fails, redirect to login with error
        this.router.navigate(['/login'], { queryParams: { error: 'oauth_failed' } });
      }
    });
  }
}
