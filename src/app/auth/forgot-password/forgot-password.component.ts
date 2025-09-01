import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { AuthService } from '../auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    RouterLink
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  loading = false;
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get f() { return this.forgotPasswordForm.controls; }

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      return;
    }

    this.loading = true;
    const email = this.forgotPasswordForm.value.email;

    this.authService.requestPasswordReset(email).subscribe({
      next: () => {
        this.submitted = true;
        this.snackBar.open(
          'If the email exists, a password reset link has been sent.',
          'Close',
          { duration: 5000, panelClass: ['success-snackbar'] }
        );
      },
      error: (error) => {
        this.loading = false;
        // Always show the same message for security
        this.snackBar.open(
          'If the email exists, a password reset link has been sent.',
          'Close',
          { duration: 5000, panelClass: ['info-snackbar'] }
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
