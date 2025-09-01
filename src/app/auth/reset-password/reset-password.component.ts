import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { AuthService } from '../auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    RouterLink
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  loading = false;
  hidePassword = true;
  hideConfirmPassword = true;
  token: string = '';
  uid: string = '';
  success = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.resetPasswordForm = this.fb.group({
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Get token and uid from URL parameters
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      this.uid = params['uid'] || '';
      
      if (!this.token || !this.uid) {
        this.snackBar.open('Invalid reset link', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.router.navigate(['/auth/forgot-password']);
      }
    });
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password');
    const confirmPassword = formGroup.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else {
      confirmPassword?.setErrors(null);
    }
    
    return null;
  }

  get f() { return this.resetPasswordForm.controls; }

  hasMinLength(): boolean {
    const password = this.resetPasswordForm.get('password')?.value;
    return password ? password.length >= 8 : false;
  }

  hasUppercase(): boolean {
    const password = this.resetPasswordForm.get('password')?.value;
    return password ? /[A-Z]/.test(password) : false;
  }

  hasLowercase(): boolean {
    const password = this.resetPasswordForm.get('password')?.value;
    return password ? /[a-z]/.test(password) : false;
  }

  hasNumber(): boolean {
    const password = this.resetPasswordForm.get('password')?.value;
    return password ? /\d/.test(password) : false;
  }

  hasSpecialChar(): boolean {
    const password = this.resetPasswordForm.get('password')?.value;
    return password ? /[@$!%*?&]/.test(password) : false;
  }

  onSubmit(): void {
    if (this.resetPasswordForm.invalid) {
      return;
    }

    this.loading = true;
    const { password } = this.resetPasswordForm.value;

    this.authService.resetPassword(this.token, this.uid, password).subscribe({
      next: () => {
        this.success = true;
        this.snackBar.open(
          'Password reset successful! Redirecting to login...',
          'Close',
          { duration: 3000, panelClass: ['success-snackbar'] }
        );
        
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 3000);
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open(
          error.error?.message || 'Failed to reset password. The link may be expired.',
          'Close',
          { duration: 5000, panelClass: ['error-snackbar'] }
        );
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}