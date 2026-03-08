import { Component, inject } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { AuthService } from '../../../core/services/auth.service';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-setting',
  imports: [DatePipe, ReactiveFormsModule],
  templateUrl: './setting.html',
  styleUrl: './setting.css',
  animations: [
    trigger('fadeInUp', [
      state('void', style({ opacity: 0, transform: 'translateY(20px)' })),
      state('*', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => *', animate('600ms cubic-bezier(0.4, 0, 0.2, 1)'))
    ])
  ]
})
export class Setting {
  authService = inject(AuthService);
  toastService = inject(ToastrService);


  changePasswordForm: FormGroup;
  isSubmitted = false;

  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  constructor(private formBuilder: FormBuilder) {
    this.changePasswordForm = this.formBuilder.group(
      {
        currentPassword: ['', [Validators.required]],
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }

  // Custom validator to check if new password and confirm password match
  passwordMatchValidator(group: FormGroup) {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  // Getter for easy access to form fields
  get formControls() {
    return this.changePasswordForm.controls;
  }

  onChangePassword() {
    this.isSubmitted = true;

    if (this.changePasswordForm.invalid) {

      return;
    }

    const { currentPassword, newPassword } = this.changePasswordForm.value;

    this.authService.changePassword(currentPassword, newPassword).subscribe({
      next: () => {

        this.changePasswordForm.reset();
        this.isSubmitted = false;
        this.showCurrentPassword = false;
        this.showNewPassword = false;
        this.showConfirmPassword = false;
        this.toastService.success('Password changed successfully');
      },
      error: (error) => {
        console.error('Change password error:', error);
        this.toastService.error('Failed to change password');
      },
    });
  }

  toggleCurrentPasswordVisibility() {
    this.showCurrentPassword = !this.showCurrentPassword;
  }

  toggleNewPasswordVisibility() {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
