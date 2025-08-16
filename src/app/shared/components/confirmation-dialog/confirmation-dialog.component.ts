import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  MatDialogModule,
  MatButtonModule,
  MatIconModule
} from '../../material.module';
import { CommonModule } from '@angular/common';

export interface ConfirmationDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'delete' | 'warning' | 'info' | 'confirm';
  itemName?: string;
  details?: string[];
}

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.scss'
})
export class ConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData
  ) {
    // Set default values
    this.data.confirmText = this.data.confirmText || this.getDefaultConfirmText();
    this.data.cancelText = this.data.cancelText || 'Cancel';
    this.data.type = this.data.type || 'confirm';
  }

  getDefaultConfirmText(): string {
    switch (this.data.type) {
      case 'delete':
        return 'Delete';
      case 'warning':
        return 'Proceed';
      default:
        return 'Confirm';
    }
  }

  getIcon(): string {
    switch (this.data.type) {
      case 'delete':
        return 'delete_forever';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'help_outline';
    }
  }

  getIconClass(): string {
    switch (this.data.type) {
      case 'delete':
        return 'delete-icon';
      case 'warning':
        return 'warning-icon';
      case 'info':
        return 'info-icon';
      default:
        return 'confirm-icon';
    }
  }

  getConfirmButtonColor(): string {
    return this.data.type === 'delete' ? 'warn' : 'primary';
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}