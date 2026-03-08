import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private toatrService = inject(ToastrService);

  email = '';
  password = '';
  showPassword = false;
  loginForm: FormGroup;
  returnUrl: string = '/dashboard';
  isSubmitted = false;

  constructor(private formBuilder: FormBuilder) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    // Get the returnUrl from query parameters or default to '/dashboard'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  get formControls() {
    return this.loginForm.controls;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  handleSignIn() {
    this.isSubmitted = true;

    if (this.loginForm.invalid) {
      return;
    }

    this.authService.login(this.loginForm.value.email, this.loginForm.value.password).subscribe({
      next: (user) => {
        if (user.user.role === 'ADMIN') {
          this.router.navigateByUrl('/admin');
        } else {
          // Check if returnUrl is restricted (starts with /admin)
          // If a regular user tries to go to admin, redirect them to dashboard instead
          if (this.returnUrl && this.returnUrl.startsWith('/admin')) {
            this.router.navigateByUrl('/dashboard');
          } else {
            // Redirect to the originally requested URL or default
            this.router.navigateByUrl(this.returnUrl);
          }
        }
        this.loginForm.reset();
      },
      error: (error) => {
        this.toatrService.error('Invalid Username or Password');
      },
    });
  }

   continueWithGoogle() {
    this.authService.loginWithGoogle();
  }
}
