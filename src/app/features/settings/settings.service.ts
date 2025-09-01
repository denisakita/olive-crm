import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface GeneralSettings {
  language: string;
  timezone: string;
  dateFormat: string;
  currency: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  weeklyReports: boolean;
  inventoryAlerts: boolean;
  salesAlerts: boolean;
  systemUpdates: boolean;
}

export interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: string;
  passwordExpiry: string;
}

export interface DisplaySettings {
  theme: string;
  compactView: boolean;
  showSidebar: boolean;
  itemsPerPage: string;
}

export interface StorageInfo {
  storage_used: number;
  database_size: number;
  storage_used_mb: number;
  database_size_mb: number;
  max_storage_mb: number;
  last_calculated: string;
}

export interface AllSettings {
  generalSettings: GeneralSettings;
  notifications: NotificationSettings;
  security: SecuritySettings;
  display: DisplaySettings;
  metadata?: {
    createdAt: string;
    updatedAt: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private baseUrl = `${environment.apiUrl}/settings`;
  
  // Store settings in memory for quick access
  private settingsSubject = new BehaviorSubject<AllSettings | null>(null);
  public settings$ = this.settingsSubject.asObservable();
  
  // Store current theme for system preference monitoring
  private currentTheme: string = 'light';
  
  constructor(private http: HttpClient) {
    // Listen for system theme changes when in auto mode
    this.setupSystemThemeListener();
  }
  
  /**
   * Get all user settings
   */
  getAllSettings(): Observable<AllSettings> {
    return this.http.get<AllSettings>(this.baseUrl).pipe(
      tap(settings => this.settingsSubject.next(settings)),
      catchError(this.handleError)
    );
  }
  
  /**
   * Update all settings at once
   */
  updateAllSettings(settings: AllSettings): Observable<AllSettings> {
    return this.http.post<AllSettings>(this.baseUrl, settings).pipe(
      tap(updatedSettings => this.settingsSubject.next(updatedSettings)),
      catchError(this.handleError)
    );
  }
  
  /**
   * Get general settings
   */
  getGeneralSettings(): Observable<GeneralSettings> {
    return this.http.get<GeneralSettings>(`${this.baseUrl}/general/`).pipe(
      catchError(this.handleError)
    );
  }
  
  /**
   * Update general settings
   */
  updateGeneralSettings(settings: GeneralSettings): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/general/`, settings).pipe(
      tap(() => this.refreshSettings()),
      catchError(this.handleError)
    );
  }
  
  /**
   * Get notification settings
   */
  getNotificationSettings(): Observable<NotificationSettings> {
    return this.http.get<NotificationSettings>(`${this.baseUrl}/notifications/`).pipe(
      catchError(this.handleError)
    );
  }
  
  /**
   * Update notification settings
   */
  updateNotificationSettings(settings: NotificationSettings): Observable<any> {
    // Convert camelCase to snake_case for backend
    const backendSettings = {
      email_notifications: settings.emailNotifications,
      push_notifications: settings.pushNotifications,
      sms_notifications: settings.smsNotifications,
      weekly_reports: settings.weeklyReports,
      inventory_alerts: settings.inventoryAlerts,
      sales_alerts: settings.salesAlerts,
      system_updates: settings.systemUpdates
    };
    
    return this.http.patch<any>(`${this.baseUrl}/notifications/`, backendSettings).pipe(
      tap(() => this.refreshSettings()),
      catchError(this.handleError)
    );
  }
  
  /**
   * Get security settings
   */
  getSecuritySettings(): Observable<SecuritySettings> {
    return this.http.get<SecuritySettings>(`${this.baseUrl}/security/`).pipe(
      catchError(this.handleError)
    );
  }
  
  /**
   * Update security settings
   */
  updateSecuritySettings(settings: SecuritySettings): Observable<any> {
    // Convert camelCase to snake_case for backend
    const backendSettings = {
      two_factor_auth: settings.twoFactorAuth,
      session_timeout: parseInt(settings.sessionTimeout),
      password_expiry: settings.passwordExpiry
    };
    
    return this.http.patch<any>(`${this.baseUrl}/security/`, backendSettings).pipe(
      tap(() => this.refreshSettings()),
      catchError(this.handleError)
    );
  }
  
  /**
   * Get display settings
   */
  getDisplaySettings(): Observable<DisplaySettings> {
    return this.http.get<DisplaySettings>(`${this.baseUrl}/display/`).pipe(
      catchError(this.handleError)
    );
  }
  
  /**
   * Update display settings
   */
  updateDisplaySettings(settings: DisplaySettings): Observable<any> {
    // Convert camelCase to snake_case for backend
    const backendSettings = {
      theme: settings.theme,
      compact_view: settings.compactView,
      show_sidebar: settings.showSidebar,
      items_per_page: parseInt(settings.itemsPerPage)
    };
    
    return this.http.patch<any>(`${this.baseUrl}/display/`, backendSettings).pipe(
      tap(() => {
        this.refreshSettings();
        // Apply theme immediately if changed
        if (settings.theme) {
          this.applyTheme(settings.theme);
        }
      }),
      catchError(this.handleError)
    );
  }
  
  /**
   * Export user data
   */
  exportData(format: 'json' | 'csv' | 'xlsx' = 'json', includeSettings: boolean = true): Observable<Blob> {
    return this.http.post(`${this.baseUrl}/export-data/`, 
      { 
        export_format: format,
        include_settings: includeSettings,
        include_data: true
      },
      { responseType: 'blob' }
    ).pipe(
      catchError(this.handleError)
    );
  }
  
  /**
   * Clear cache
   */
  clearCache(): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/clear-cache/`, {}).pipe(
      catchError(this.handleError)
    );
  }
  
  /**
   * Get storage information
   */
  getStorageInfo(): Observable<StorageInfo> {
    return this.http.get<StorageInfo>(`${this.baseUrl}/storage-info/`).pipe(
      catchError(this.handleError)
    );
  }
  
  /**
   * Refresh all settings from server
   */
  private refreshSettings(): void {
    this.getAllSettings().subscribe();
  }
  
  /**
   * Apply theme to the application
   */
  private applyTheme(theme: string): void {
    const body = document.body;
    
    // Update current theme
    this.currentTheme = theme;
    
    // Remove existing theme classes
    body.classList.remove('light-theme', 'dark-theme', 'auto-theme');
    
    // Apply new theme
    if (theme === 'dark') {
      body.classList.add('dark-theme');
    } else if (theme === 'auto') {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      body.classList.add(prefersDark ? 'dark-theme' : 'light-theme');
    } else {
      body.classList.add('light-theme');
    }
    
    // Store theme in localStorage for quick loading
    localStorage.setItem('theme', theme);
  }
  
  /**
   * Initialize theme on app start
   */
  initializeTheme(): void {
    // First, apply saved theme from localStorage for instant loading
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.currentTheme = savedTheme;
      this.applyTheme(savedTheme);
    } else {
      // Default to light theme if nothing is saved
      this.applyTheme('light');
    }
    
    // Then fetch from server to sync (this will override if different)
    this.getDisplaySettings().subscribe({
      next: (settings) => {
        if (settings && settings.theme) {
          this.currentTheme = settings.theme;
          this.applyTheme(settings.theme);
        }
      },
      error: (error) => {
        console.error('Failed to load display settings:', error);
        // Keep the locally saved theme on error
      }
    });
  }
  
  /**
   * Setup listener for system theme changes
   */
  private setupSystemThemeListener(): void {
    // Listen for system theme changes
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Modern browsers support addEventListener on MediaQueryList
    if (darkModeMediaQuery.addEventListener) {
      darkModeMediaQuery.addEventListener('change', (e) => {
        // Only react if we're in auto mode
        if (this.currentTheme === 'auto') {
          const body = document.body;
          body.classList.remove('light-theme', 'dark-theme');
          body.classList.add(e.matches ? 'dark-theme' : 'light-theme');
        }
      });
    }
  }
  
  /**
   * Handle HTTP errors
   */
  private handleError(error: any): Observable<never> {
    console.error('Settings API Error:', error);
    throw error;
  }
}