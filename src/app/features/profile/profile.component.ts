import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {DatePipe, NgIf} from '@angular/common';
import {MaterialModule} from '../../shared/material.module';
import {AuthService} from '../../auth/auth.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog} from '@angular/material/dialog';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {Profile} from '../../shared/models/profile.interface';
import {ChangePasswordDialogComponent} from './change-password-dialog/change-password-dialog.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    MaterialModule,
    FormsModule,
    DatePipe,
    NgIf
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit, OnDestroy {
  user: Profile | null = null;
  originalUser: Profile | null = null;
  isEditing = false;
  loading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProfile(): void {
    this.loading = true;
    this.authService.getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user: any) => {
          // Store the profile data
          if (user) {
            this.user = user as Profile;
            this.originalUser = {...user} as Profile;
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading profile:', error);
          this.loading = false;
          // Don't show error snackbar for now to avoid confusion
          // this.snackBar.open(
          //   'Failed to load profile. Please try again.',
          //   'Close',
          //   {duration: 3000, panelClass: ['error-snackbar']}
          // );
        }
      });
  }

  toggleEdit(): void {
    if (this.isEditing) {
      // If canceling edit, restore original values
      this.user = {...this.originalUser!};
    }
    this.isEditing = !this.isEditing;
  }

  saveProfile(): void {
    if (!this.user) return;

    // Prepare the data for backend
    const profileData: any = {...this.user};

    this.loading = true;
    this.authService.updateProfile(profileData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedUser: any) => {
          // Store the updated profile data
          if (updatedUser) {
            this.user = updatedUser as Profile;
            this.originalUser = {...updatedUser} as Profile;
          }
          this.isEditing = false;
          this.loading = false;
          this.snackBar.open(
            'Profile updated successfully',
            'Close',
            {duration: 3000, panelClass: ['success-snackbar']}
          );
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          this.loading = false;
          this.snackBar.open(
            'Failed to update profile. Please try again.',
            'Close',
            {duration: 3000, panelClass: ['error-snackbar']}
          );
        }
      });
  }

  cancelEdit(): void {
    // Restore original values
    if (this.originalUser) {
      this.user = {...this.originalUser};
    }
    this.isEditing = false;
  }

  changePassword(): void {
    const dialogRef = this.dialog.open(ChangePasswordDialogComponent, {
      width: '500px',
      disableClose: false,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        this.snackBar.open(
          'Your password has been changed successfully',
          'Close',
          {duration: 3000, panelClass: ['success-snackbar']}
        );
      }
    });
  }

  uploadAvatar(): void {
    // TODO: Implement avatar upload
    this.snackBar.open(
      'Avatar upload feature coming soon',
      'Close',
      {duration: 3000, panelClass: ['info-snackbar']}
    );
  }
}
