import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import {
  MatCardModule,
  MatTableModule,
  MatSortModule,
  MatPaginatorModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatButtonModule,
  MatIconModule,
  MatDialogModule
} from '../shared/material.module';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddSaleDialogComponent } from './add-sale-dialog/add-sale-dialog.component';
import { DialogService } from '../shared/services/dialog.service';

export interface Sale {
  id: number;
  customer: string;
  product: string;
  quantity: number;
  price: number;
  date: Date;
  status: string;
}

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [
    MatCardModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    DatePipe,
    CurrencyPipe,
    FormsModule
  ],
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.scss'
})
export class SalesComponent implements AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  displayedColumns: string[] = ['id', 'customer', 'product', 'quantity', 'price', 'date', 'status', 'actions'];
  dataSource = new MatTableDataSource<Sale>([
    { id: 1, customer: 'John Doe', product: 'Olive Oil Premium', quantity: 5, price: 150, date: new Date('2024-01-15'), status: 'Completed' },
    { id: 2, customer: 'Jane Smith', product: 'Extra Virgin Oil', quantity: 3, price: 120, date: new Date('2024-01-16'), status: 'Pending' },
    { id: 3, customer: 'Bob Johnson', product: 'Organic Olive Oil', quantity: 10, price: 350, date: new Date('2024-01-17'), status: 'Completed' },
    { id: 4, customer: 'Alice Brown', product: 'Premium Blend', quantity: 8, price: 280, date: new Date('2024-01-18'), status: 'Processing' },
    { id: 5, customer: 'Charlie Wilson', product: 'Olive Oil Premium', quantity: 15, price: 450, date: new Date('2024-01-19'), status: 'Completed' },
    { id: 6, customer: 'Diana Prince', product: 'Extra Virgin Oil', quantity: 20, price: 800, date: new Date('2024-01-20'), status: 'Pending' },
    { id: 7, customer: 'Edward Norton', product: 'Organic Olive Oil', quantity: 6, price: 210, date: new Date('2024-01-21'), status: 'Completed' },
    { id: 8, customer: 'Fiona Green', product: 'Premium Blend', quantity: 12, price: 420, date: new Date('2024-01-22'), status: 'Processing' },
    { id: 9, customer: 'George Hill', product: 'Olive Oil Premium', quantity: 4, price: 120, date: new Date('2024-01-23'), status: 'Cancelled' },
    { id: 10, customer: 'Helen Troy', product: 'Extra Virgin Oil', quantity: 7, price: 280, date: new Date('2024-01-24'), status: 'Completed' },
  ]);
  
  filterValue = '';
  statusFilter = '';
  
  constructor(
    private dialog: MatDialog,
    private dialogService: DialogService
  ) {}
  
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
        matchesSearch = data.customer.toLowerCase().includes(searchStr) ||
                       data.product.toLowerCase().includes(searchStr) ||
                       data.id.toString().includes(searchStr);
      }
      
      if (filters.status && filters.status !== 'all') {
        matchesStatus = data.status.toLowerCase() === filters.status.toLowerCase();
      }
      
      return matchesSearch && matchesStatus;
    };
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
  
  openAddSaleDialog(): void {
    const dialogRef = this.dialog.open(AddSaleDialogComponent, {
      width: '700px',
      disableClose: false,
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Add the new sale to the data source
        const newSale: Sale = {
          id: this.dataSource.data.length + 1,
          customer: result.customerName,
          product: result.product,
          quantity: result.quantity,
          price: result.price,
          date: result.orderDate,
          status: result.status
        };
        
        const currentData = this.dataSource.data;
        this.dataSource.data = [...currentData, newSale];
        
        // Show success message (you can add a snackbar here)
        console.log('New sale added:', newSale);
      }
    });
  }
  
  editSale(sale: Sale): void {
    const dialogRef = this.dialog.open(AddSaleDialogComponent, {
      width: '700px',
      disableClose: false,
      data: { sale: sale }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Update the sale in the data source
        const index = this.dataSource.data.findIndex(s => s.id === sale.id);
        if (index !== -1) {
          this.dataSource.data[index] = { ...sale, ...result };
          this.dataSource.data = [...this.dataSource.data];
        }
        console.log('Sale updated:', result);
      }
    });
  }
  
  deleteSale(sale: Sale): void {
    const saleDetails = [
      `Customer: ${sale.customer}`,
      `Product: ${sale.product}`,
      `Amount: $${sale.price * sale.quantity}`
    ];
    
    this.dialogService.confirmDelete(
      `Sale #${sale.id}`,
      'Are you sure you want to delete this sale order?',
      saleDetails
    ).subscribe(confirmed => {
      if (confirmed) {
        const index = this.dataSource.data.findIndex(s => s.id === sale.id);
        if (index !== -1) {
          const currentData = this.dataSource.data;
          currentData.splice(index, 1);
          this.dataSource.data = [...currentData];
          console.log('Sale deleted:', sale);
        }
      }
    });
  }
}