import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../components/confirmation-dialog/confirmation-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  constructor(private dialog: MatDialog) {}

  /**
   * Opens a confirmation dialog for delete operations
   */
  confirmDelete(itemName: string, additionalMessage?: string, details?: string[]): Observable<boolean> {
    const data: ConfirmationDialogData = {
      title: 'Confirm Delete',
      message: additionalMessage || `Are you sure you want to delete this item?`,
      itemName: itemName,
      details: details,
      type: 'delete',
      confirmText: 'Delete',
      cancelText: 'Cancel'
    };

    return this.openConfirmationDialog(data);
  }

  /**
   * Opens a general confirmation dialog
   */
  confirm(title: string, message: string, confirmText?: string, cancelText?: string): Observable<boolean> {
    const data: ConfirmationDialogData = {
      title: title,
      message: message,
      type: 'confirm',
      confirmText: confirmText || 'Confirm',
      cancelText: cancelText || 'Cancel'
    };

    return this.openConfirmationDialog(data);
  }

  /**
   * Opens a warning dialog
   */
  warn(title: string, message: string, details?: string[]): Observable<boolean> {
    const data: ConfirmationDialogData = {
      title: title,
      message: message,
      details: details,
      type: 'warning',
      confirmText: 'Proceed',
      cancelText: 'Cancel'
    };

    return this.openConfirmationDialog(data);
  }

  /**
   * Opens an info dialog (usually just with OK button)
   */
  info(title: string, message: string, details?: string[]): Observable<boolean> {
    const data: ConfirmationDialogData = {
      title: title,
      message: message,
      details: details,
      type: 'info',
      confirmText: 'OK',
      cancelText: 'Close'
    };

    return this.openConfirmationDialog(data);
  }

  /**
   * Opens the confirmation dialog with custom data
   */
  openConfirmationDialog(data: ConfirmationDialogData): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '450px',
      disableClose: false,
      data: data,
      panelClass: 'confirmation-dialog-panel'
    });

    return dialogRef.afterClosed();
  }

  /**
   * Batch delete confirmation
   */
  confirmBatchDelete(count: number, itemType: string): Observable<boolean> {
    const data: ConfirmationDialogData = {
      title: 'Confirm Batch Delete',
      message: `Are you sure you want to delete ${count} ${itemType}?`,
      type: 'delete',
      confirmText: `Delete ${count} Items`,
      cancelText: 'Cancel'
    };

    return this.openConfirmationDialog(data);
  }
}