import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  registerForm: FormGroup;
  isSubmitted = false;
  showPassword = false;
  showConfirmPassword = false;
  referralCode: string | null = null;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.referralCode = params['ref'] || params['referralCode'] || null;
    });
  }

  constructor(private formBuilder: FormBuilder) {
    this.registerForm = this.formBuilder.group(
      {
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
      },
      {
        validators: this.passwordMatchValidator,
      },
    );
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // Custom validator to check if password and confirm password match
  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  // Getter for easy access to form fields
  get formControls() {
    return this.registerForm.controls;
  }

  onSubmit() {
    this.isSubmitted = true;

    if (this.registerForm.invalid) {
      console.log('Form is invalid', this.registerForm.errors);
      return;
    }

    console.log('Attempting registration...');
    this.authService
      .register(this.registerForm.value.email, this.registerForm.value.password, this.referralCode)
      .subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Registration error', error);
        },
      });
  }

  continueWithGoogle() {
    this.authService.loginWithGoogle(this.referralCode);
  }
}
