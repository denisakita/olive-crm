import {Component} from '@angular/core';
import {
  MatSlideToggleModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatButtonModule,
  MatIconModule,
  MatDividerModule,
  MatExpansionModule
} from '../../shared/material.module';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatExpansionModule,
    FormsModule
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  // General Settings
  generalSettings = {
    language: 'en',
    timezone: 'UTC-5',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD'
  };

  // Notification Settings
  notifications = {
    emailNotifications: true,
    pushNotifications: false,
    smsNotifications: false,
    weeklyReports: true,
    inventoryAlerts: true,
    salesAlerts: true,
    systemUpdates: false
  };

  // Security Settings
  security = {
    twoFactorAuth: false,
    sessionTimeout: '30',
    passwordExpiry: '90'
  };

  // Display Settings
  display = {
    theme: 'light',
    compactView: false,
    showSidebar: true,
    itemsPerPage: '10'
  };

  saveGeneralSettings() {
    console.log('Saving general settings:', this.generalSettings);
  }

  saveNotificationSettings() {
    console.log('Saving notification settings:', this.notifications);
  }

  saveSecuritySettings() {
    console.log('Saving security settings:', this.security);
  }

  saveDisplaySettings() {
    console.log('Saving display settings:', this.display);
  }

  exportData() {
    console.log('Exporting data...');
  }

  clearCache() {
    console.log('Clearing cache...');
  }

  saveAllSettings() {
    console.log('Saving all settings...');
    this.saveGeneralSettings();
    this.saveNotificationSettings();
    this.saveSecuritySettings();
    this.saveDisplaySettings();
    console.log('All settings saved successfully!');
  }
}
