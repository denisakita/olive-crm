import { Component, ViewChild, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from '../../shared/material.module';
import {DatePipe, CurrencyPipe, TitleCasePipe, NgIf} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddSaleDialogComponent } from './add-sale-dialog/add-sale-dialog.component';
import { DialogService } from '../../shared/services/dialog.service';
import { SalesService } from '../../core/services/sales.service';
import { Sale } from '../../models/sale.interface';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { QueryParams } from '../../core/services/api.service';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [
    MaterialModule,
    DatePipe,
    CurrencyPipe,
    FormsModule,
    TitleCasePipe,
    NgIf
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
  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;
  sortActive = 'id';
  sortDirection: 'asc' | 'desc' | '' = 'asc';

  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<string>();

  constructor(
    private dialog: MatDialog,
    private dialogService: DialogService,
    private salesService: SalesService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Setup search debounce
    this.searchSubject$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.pageIndex = 0; // Reset to first page on new search
        if (this.paginator) {
          this.paginator.pageIndex = 0;
        }
        this.loadSales();
      });

    this.loadSales();
  }

  ngAfterViewInit() {
    // Connect sort to the data source for UI feedback
    this.dataSource.sort = this.sort;
    
    // Handle sort changes for backend call
    this.sort.sortChange
      .pipe(takeUntil(this.destroy$))
      .subscribe((sort: Sort) => {
        this.sortActive = sort.active;
        this.sortDirection = sort.direction;
        this.pageIndex = 0; // Reset to first page on sort change
        // Reset paginator to first page
        if (this.paginator) {
          this.paginator.pageIndex = 0;
        }
        this.loadSales();
      });

    // Handle pagination changes
    this.paginator.page
      .pipe(takeUntil(this.destroy$))
      .subscribe((page: PageEvent) => {
        this.pageIndex = page.pageIndex;
        this.pageSize = page.pageSize;
        this.loadSales();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.searchSubject$.complete();
  }

  /**
   * Load sales from backend with filters, sorting, and pagination
   */
  loadSales(): void {
    this.loading = true;

    // Build query parameters
    const params: QueryParams = {
      page: this.pageIndex + 1, // Backend uses 1-based pagination
      page_size: this.pageSize
    };

    // Add search filter
    if (this.filterValue) {
      params['search'] = this.filterValue;
    }

    // Add status filter
    if (this.statusFilter && this.statusFilter !== '') {
      params['status'] = this.statusFilter;
    }

    // Add sorting
    if (this.sortActive && this.sortDirection) {
      // Convert frontend field names to backend field names
      const fieldMapping: { [key: string]: string } = {
        'id': 'id',
        'customer': 'customer_name',
        'product': 'product',
        'quantity': 'quantity',
        'price': 'price',
        'date': 'order_date',
        'status': 'status'
      };
      
      const backendField = fieldMapping[this.sortActive] || this.sortActive;
      params['ordering'] = this.sortDirection === 'desc' ? `-${backendField}` : backendField;
    }

    this.salesService.getSales(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.dataSource.data = response.results;
          this.totalItems = response.count;
          
          // Update paginator
          if (this.paginator) {
            this.paginator.length = response.count;
            this.paginator.pageIndex = this.pageIndex;
          }
          
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


  applyFilter() {
    // Trigger search with debounce
    this.searchSubject$.next(this.filterValue);
  }

  applyStatusFilter() {
    // Status filter applies immediately
    this.pageIndex = 0; // Reset to first page
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.loadSales();
  }

  clearFilters() {
    this.filterValue = '';
    this.statusFilter = '';
    this.pageIndex = 0;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.loadSales();
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
          // Reload all sales to ensure consistency
          this.loadSales();
          
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
          // Reload all sales to ensure consistency
          this.loadSales();
          
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
          // Reload all sales to ensure consistency
          this.loadSales();
          
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
