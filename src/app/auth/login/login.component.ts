import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from '../../core/services/auth.service';
import {MATERIAL_COMMON_MODULES, MATERIAL_FORM_MODULES} from '../../shared/material.module';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ...MATERIAL_COMMON_MODULES,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MATERIAL_FORM_MODULES
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
  }

  ngOnInit(): void {
    this.initializeForm();

    // Check if already authenticated
    this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.navigateToReturnUrl();
      }
    });
  }

  initializeForm(): void {
    // Check if credentials were saved previously
    const savedUsername = localStorage.getItem('savedUsername');
    const encodedPassword = localStorage.getItem('savedPassword');
    const savedPassword = encodedPassword ? atob(encodedPassword) : ''; // Decode base64
    const rememberMe = localStorage.getItem('rememberCredentials') === 'true';
    
    this.loginForm = this.fb.group({
      username: [savedUsername || '', [Validators.required]],
      password: [savedPassword || '', [Validators.required, Validators.minLength(6)]],
      rememberMe: [rememberMe]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    this.loading = true;
    const credentials = this.loginForm.value;
    
    // Save or clear credentials based on Remember Me checkbox
    if (credentials.rememberMe) {
      // Save credentials for next time (encode password for minimal security)
      localStorage.setItem('savedUsername', credentials.username);
      localStorage.setItem('savedPassword', btoa(credentials.password)); // Encode as base64
      localStorage.setItem('rememberCredentials', 'true');
    } else {
      // Clear saved credentials
      localStorage.removeItem('savedUsername');
      localStorage.removeItem('savedPassword');
      localStorage.removeItem('rememberCredentials');
    }

    this.authService.login(credentials).subscribe({
      next: () => {
        this.snackBar.open('Login successful!', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
        this.navigateToReturnUrl();
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open(
          error.message || 'Login failed. Please check your credentials.',
          'Close',
          {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          }
        );
      }
    });
  }

  private navigateToReturnUrl(): void {
    const returnUrl = sessionStorage.getItem('returnUrl') || '/dashboard';
    sessionStorage.removeItem('returnUrl');
    this.router.navigate([returnUrl]);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getErrorMessage(field: string): string {
    const control = this.loginForm.get(field);
    if (control?.hasError('required')) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }
    if (control?.hasError('minlength')) {
      return `Password must be at least 6 characters`;
    }
    return '';
  }
}
