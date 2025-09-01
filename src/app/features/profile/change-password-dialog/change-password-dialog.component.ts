import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MaterialModule } from '../../../shared/material.module';
import { AuthService } from '../../../auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-change-password-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    MatDialogModule
  ],
  templateUrl: './change-password-dialog.component.html',
  styleUrl: './change-password-dialog.component.scss'
})
export class ChangePasswordDialogComponent {
  changePasswordForm: FormGroup;
  loading = false;
  hideOldPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<ChangePasswordDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.changePasswordForm = this.fb.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const newPassword = formGroup.get('newPassword');
    const confirmPassword = formGroup.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else if (confirmPassword?.hasError('passwordMismatch')) {
      confirmPassword.setErrors(null);
    }
    
    return null;
  }

  get f() { return this.changePasswordForm.controls; }

  hasMinLength(): boolean {
    const password = this.changePasswordForm.get('newPassword')?.value;
    return password ? password.length >= 8 : false;
  }

  hasUppercase(): boolean {
    const password = this.changePasswordForm.get('newPassword')?.value;
    return password ? /[A-Z]/.test(password) : false;
  }

  hasLowercase(): boolean {
    const password = this.changePasswordForm.get('newPassword')?.value;
    return password ? /[a-z]/.test(password) : false;
  }

  hasNumber(): boolean {
    const password = this.changePasswordForm.get('newPassword')?.value;
    return password ? /\d/.test(password) : false;
  }

  hasSpecialChar(): boolean {
    const password = this.changePasswordForm.get('newPassword')?.value;
    return password ? /[@$!%*?&]/.test(password) : false;
  }

  onSubmit(): void {
    if (this.changePasswordForm.invalid) {
      return;
    }

    this.loading = true;
    const formData = this.changePasswordForm.value;

    this.authService.changePassword({
      oldPassword: formData.oldPassword,
      newPassword: formData.newPassword,
      confirmPassword: formData.confirmPassword
    }).subscribe({
      next: (response) => {
        this.snackBar.open(
          'Password changed successfully!',
          'Close',
          { duration: 3000, panelClass: ['success-snackbar'] }
        );
        
        // Close dialog with success result
        this.dialogRef.close({ success: true });
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open(
          error.error?.oldPassword?.[0] || error.error?.message || 'Failed to change password',
          'Close',
          { duration: 5000, panelClass: ['error-snackbar'] }
        );
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}