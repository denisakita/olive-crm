import { Component, ViewChild, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from '../../shared/material.module';
import {DatePipe, CurrencyPipe, TitleCasePipe} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddSaleDialogComponent } from './add-sale-dialog/add-sale-dialog.component';
import { DialogService } from '../../shared/services/dialog.service';
import { SalesService } from '../../core/services/sales.service';
import { Sale } from '../../models/sale.interface';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [
    MaterialModule,
    DatePipe,
    CurrencyPipe,
    FormsModule,
    TitleCasePipe
  ],
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.scss'
})
export class SalesComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = ['id', 'customer', 'product', 'quantity', 'price', 'date', 'status', 'actions'];
  dataSource = new MatTableDataSource<Sale>([]);

  filterValue = '';
  statusFilter = '';
  loading = false;

  private destroy$ = new Subject<void>();

  constructor(
    private dialog: MatDialog,
    private dialogService: DialogService,
    private salesService: SalesService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadSales();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;

    // Custom filter predicate for multiple filters
    this.dataSource.filterPredicate = (data: Sale, filter: string) => {
      const filters = JSON.parse(filter);
      let matchesSearch = true;
      let matchesStatus = true;

      if (filters.search) {
        const searchStr = filters.search.toLowerCase();
        matchesSearch = data.customerName.toLowerCase().includes(searchStr) ||
                       data.product.toLowerCase().includes(searchStr) ||
                       data.id.toString().includes(searchStr);
      }

      if (filters.status && filters.status !== 'all') {
        matchesStatus = data.status.toLowerCase() === filters.status.toLowerCase();
      }

      return matchesSearch && matchesStatus;
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load sales from backend
   */
  loadSales(): void {
    this.loading = true;

    this.salesService.getSales()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.dataSource.data = response.results;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading sales:', error);
          this.loading = false;
          this.snackBar.open(
            'Failed to load sales. Please try again.',
            'Close',
            { duration: 3000, panelClass: ['error-snackbar'] }
          );
        }
      });
  }

  /**
   * Refresh sales data
   */
  refreshSales(): void {
    this.loadSales();
  }

  applyFilter() {
    const filters = {
      search: this.filterValue,
      status: this.statusFilter
    };
    this.dataSource.filter = JSON.stringify(filters);
  }

  clearFilters() {
    this.filterValue = '';
    this.statusFilter = '';
    this.applyFilter();
  }

  /**
   * Open dialog to add new sale
   */
  openAddSaleDialog(): void {
    const dialogRef = this.dialog.open(AddSaleDialogComponent, {
      width: '700px',
      disableClose: false,
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createSale(result);
      }
    });
  }

  /**
   * Create new sale
   */
  private createSale(saleData: Partial<Sale>): void {
    this.loading = true;

    this.salesService.createSale(saleData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newSale) => {
          // Add to table
          const currentData = this.dataSource.data;
          this.dataSource.data = [...currentData, newSale];

          this.loading = false;
          this.snackBar.open(
            'Sale created successfully',
            'Close',
            { duration: 3000, panelClass: ['success-snackbar'] }
          );
        },
        error: (error) => {
          console.error('Error creating sale:', error);
          this.loading = false;
          this.snackBar.open(
            'Failed to create sale. Please try again.',
            'Close',
            { duration: 3000, panelClass: ['error-snackbar'] }
          );
        }
      });
  }

  /**
   * Edit existing sale
   */
  editSale(sale: Sale): void {
    const dialogRef = this.dialog.open(AddSaleDialogComponent, {
      width: '700px',
      disableClose: false,
      data: { sale: sale }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateSale(sale.id, result);
      }
    });
  }

  /**
   * Update sale
   */
  private updateSale(saleId: string, updates: Partial<Sale>): void {
    this.loading = true;

    this.salesService.updateSale(saleId, updates)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedSale) => {
          // Update in table
          const index = this.dataSource.data.findIndex(s => s.id === saleId);
          if (index !== -1) {
            const currentData = [...this.dataSource.data];
            currentData[index] = updatedSale;
            this.dataSource.data = currentData;
          }

          this.loading = false;
          this.snackBar.open(
            'Sale updated successfully',
            'Close',
            { duration: 3000, panelClass: ['success-snackbar'] }
          );
        },
        error: (error) => {
          console.error('Error updating sale:', error);
          this.loading = false;
          this.snackBar.open(
            'Failed to update sale. Please try again.',
            'Close',
            { duration: 3000, panelClass: ['error-snackbar'] }
          );
        }
      });
  }

  /**
   * Delete sale with confirmation
   */
  deleteSale(sale: Sale): void {
    const saleDetails = [
      `Customer: ${sale.customerName}`,
      `Product: ${sale.product}`,
      `Amount: $${sale.price * sale.quantity}`
    ];

    this.dialogService.confirmDelete(
      `Sale #${sale.id}`,
      'Are you sure you want to delete this sale order?',
      saleDetails
    ).subscribe(confirmed => {
      if (confirmed) {
        this.performDelete(sale.id);
      }
    });
  }

  /**
   * Perform actual deletion
   */
  private performDelete(saleId: string): void {
    this.loading = true;

    this.salesService.deleteSale(saleId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Remove from table
          const currentData = this.dataSource.data.filter(s => s.id !== saleId);
          this.dataSource.data = currentData;

          this.loading = false;
          this.snackBar.open(
            'Sale deleted successfully',
            'Close',
            { duration: 3000, panelClass: ['success-snackbar'] }
          );
        },
        error: (error) => {
          console.error('Error deleting sale:', error);
          this.loading = false;
          this.snackBar.open(
            'Failed to delete sale. Please try again.',
            'Close',
            { duration: 3000, panelClass: ['error-snackbar'] }
          );
        }
      });
  }

  /**
   * Get status badge color
   */
  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'primary';
      case 'pending':
        return 'accent';
      case 'processing':
      case 'shipped':
        return 'warn';
      case 'cancelled':
        return '';
      default:
        return '';
    }
  }

  /**
   * Export sales data
   */
  exportSales(format: 'csv' | 'excel' | 'pdf'): void {
    this.loading = true;

    this.salesService.exportSales(format)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          // Create download link
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `sales_${new Date().toISOString().split('T')[0]}.${format}`;
          link.click();
          window.URL.revokeObjectURL(url);

          this.loading = false;
          this.snackBar.open(
            'Sales exported successfully',
            'Close',
            { duration: 3000, panelClass: ['success-snackbar'] }
          );
        },
        error: (error) => {
          console.error('Error exporting sales:', error);
          this.loading = false;
          this.snackBar.open(
            'Failed to export sales. Please try again.',
            'Close',
            { duration: 3000, panelClass: ['error-snackbar'] }
          );
        }
      });
  }
}
