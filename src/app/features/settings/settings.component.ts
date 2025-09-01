import {Component, OnInit, OnDestroy} from '@angular/core';
import {
  MatSlideToggleModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatButtonModule,
  MatIconModule,
  MatDividerModule,
  MatExpansionModule,
  MatProgressSpinnerModule,
  MatProgressBarModule
} from '../../shared/material.module';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {SettingsService, GeneralSettings, NotificationSettings, SecuritySettings, DisplaySettings, StorageInfo} from './settings.service';
import {MatDialog} from '@angular/material/dialog';
import {ChangePasswordDialogComponent} from '../profile/change-password-dialog/change-password-dialog.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatSnackBarModule,
    FormsModule
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit, OnDestroy {
  // Loading states
  loading = false;
  loadingSection: string | null = null;
  
  // Storage info
  storageInfo: StorageInfo | null = null;
  
  // Destroy subject for cleanup
  private destroy$ = new Subject<void>();
  
  // General Settings
  generalSettings: GeneralSettings = {
    language: 'en',
    timezone: 'UTC-5',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD'
  };

  // Notification Settings
  notifications: NotificationSettings = {
    emailNotifications: true,
    pushNotifications: false,
    smsNotifications: false,
    weeklyReports: true,
    inventoryAlerts: true,
    salesAlerts: true,
    systemUpdates: false
  };

  // Security Settings
  security: SecuritySettings = {
    twoFactorAuth: false,
    sessionTimeout: '30',
    passwordExpiry: '90'
  };

  // Display Settings
  display: DisplaySettings = {
    theme: 'light',
    compactView: false,
    showSidebar: true,
    itemsPerPage: '10'
  };
  
  constructor(
    private settingsService: SettingsService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}
  
  ngOnInit(): void {
    this.loadAllSettings();
    this.loadStorageInfo();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  loadAllSettings(): void {
    this.loading = true;
    this.settingsService.getAllSettings()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (settings) => {
          if (settings) {
            this.generalSettings = settings.generalSettings;
            this.notifications = settings.notifications;
            this.security = settings.security;
            this.display = settings.display;
            // Apply the loaded theme
            this.applyTheme(this.display.theme);
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading settings:', error);
          this.loading = false;
          // Apply default theme on error
          this.applyTheme('light');
          this.snackBar.open(
            'Failed to load settings. Please try again.',
            'Close',
            { duration: 3000, panelClass: ['error-snackbar'] }
          );
        }
      });
  }
  
  loadStorageInfo(): void {
    this.settingsService.getStorageInfo()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (info) => {
          this.storageInfo = info;
        },
        error: (error) => {
          console.error('Error loading storage info:', error);
        }
      });
  }

  saveGeneralSettings() {
    this.loadingSection = 'general';
    this.settingsService.updateGeneralSettings(this.generalSettings)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.loadingSection = null;
          this.snackBar.open(
            'General settings saved successfully!',
            'Close',
            { duration: 3000, panelClass: ['success-snackbar'] }
          );
        },
        error: (error) => {
          this.loadingSection = null;
          this.snackBar.open(
            'Failed to save general settings. Please try again.',
            'Close',
            { duration: 3000, panelClass: ['error-snackbar'] }
          );
        }
      });
  }

  saveNotificationSettings() {
    this.loadingSection = 'notifications';
    this.settingsService.updateNotificationSettings(this.notifications)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.loadingSection = null;
          this.snackBar.open(
            'Notification settings saved successfully!',
            'Close',
            { duration: 3000, panelClass: ['success-snackbar'] }
          );
        },
        error: (error) => {
          this.loadingSection = null;
          this.snackBar.open(
            'Failed to save notification settings. Please try again.',
            'Close',
            { duration: 3000, panelClass: ['error-snackbar'] }
          );
        }
      });
  }

  saveSecuritySettings() {
    this.loadingSection = 'security';
    this.settingsService.updateSecuritySettings(this.security)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.loadingSection = null;
          this.snackBar.open(
            'Security settings saved successfully!',
            'Close',
            { duration: 3000, panelClass: ['success-snackbar'] }
          );
        },
        error: (error) => {
          this.loadingSection = null;
          this.snackBar.open(
            'Failed to save security settings. Please try again.',
            'Close',
            { duration: 3000, panelClass: ['error-snackbar'] }
          );
        }
      });
  }

  saveDisplaySettings() {
    this.loadingSection = 'display';
    // Apply theme immediately for instant feedback
    this.applyTheme(this.display.theme);
    
    this.settingsService.updateDisplaySettings(this.display)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.loadingSection = null;
          this.snackBar.open(
            'Display settings saved successfully!',
            'Close',
            { duration: 3000, panelClass: ['success-snackbar'] }
          );
        },
        error: (error) => {
          this.loadingSection = null;
          // Revert theme on error
          this.loadAllSettings();
          this.snackBar.open(
            'Failed to save display settings. Please try again.',
            'Close',
            { duration: 3000, panelClass: ['error-snackbar'] }
          );
        }
      });
  }
  
  /**
   * Apply theme immediately without saving
   */
  applyTheme(theme: string): void {
    console.log('Applying theme:', theme);
    const body = document.body;
    
    // Remove existing theme classes
    body.classList.remove('light-theme', 'dark-theme', 'auto-theme');
    
    // Apply new theme
    if (theme === 'dark') {
      body.classList.add('dark-theme');
      console.log('Dark theme applied');
    } else if (theme === 'auto') {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      body.classList.add(prefersDark ? 'dark-theme' : 'light-theme');
      console.log('Auto theme applied:', prefersDark ? 'dark' : 'light');
    } else {
      body.classList.add('light-theme');
      console.log('Light theme applied');
    }
    console.log('Body classes:', body.className);
    
    // Store theme in localStorage for quick loading on next visit
    localStorage.setItem('theme', theme);
  }
  
  /**
   * Handle theme change without saving (for preview)
   */
  onThemeChange(): void {
    this.applyTheme(this.display.theme);
  }

  exportData() {
    this.loadingSection = 'export';
    this.settingsService.exportData('json', true)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          // Create download link
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `olive_crm_export_${new Date().getTime()}.json`;
          link.click();
          window.URL.revokeObjectURL(url);
          
          this.loadingSection = null;
          this.snackBar.open(
            'Data exported successfully!',
            'Close',
            { duration: 3000, panelClass: ['success-snackbar'] }
          );
        },
        error: (error) => {
          this.loadingSection = null;
          this.snackBar.open(
            'Failed to export data. Please try again.',
            'Close',
            { duration: 3000, panelClass: ['error-snackbar'] }
          );
        }
      });
  }

  clearCache() {
    this.loadingSection = 'cache';
    this.settingsService.clearCache()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.loadingSection = null;
          this.snackBar.open(
            'Cache cleared successfully!',
            'Close',
            { duration: 3000, panelClass: ['success-snackbar'] }
          );
        },
        error: (error) => {
          this.loadingSection = null;
          this.snackBar.open(
            'Failed to clear cache. Please try again.',
            'Close',
            { duration: 3000, panelClass: ['error-snackbar'] }
          );
        }
      });
  }

  saveAllSettings() {
    this.loading = true;
    const allSettings = {
      generalSettings: this.generalSettings,
      notifications: this.notifications,
      security: this.security,
      display: this.display
    };
    
    this.settingsService.updateAllSettings(allSettings)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.snackBar.open(
            'All settings saved successfully!',
            'Close',
            { duration: 3000, panelClass: ['success-snackbar'] }
          );
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open(
            'Failed to save settings. Please try again.',
            'Close',
            { duration: 3000, panelClass: ['error-snackbar'] }
          );
        }
      });
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
          { duration: 3000, panelClass: ['success-snackbar'] }
        );
      }
    });
  }
  
  getStoragePercentage(): number {
    if (!this.storageInfo) return 0;
    return (this.storageInfo.storage_used_mb / this.storageInfo.max_storage_mb) * 100;
  }
  
  formatDate(dateString: string): string {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  }
}
