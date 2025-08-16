import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatTable, MatTableDataSource, MatColumnDef, MatHeaderCell, MatCell, MatHeaderCellDef, MatCellDef, MatHeaderRow, MatRow, MatHeaderRowDef, MatRowDef } from '@angular/material/table';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatCell,
    MatHeaderCellDef,
    MatCellDef,
    MatHeaderRow,
    MatRow,
    MatHeaderRowDef,
    MatRowDef,
    MatSort,
    MatSortHeader,
    MatPaginator,
    MatFormField,
    MatLabel,
    MatInput,
    MatSelect,
    MatOption,
    MatButton,
    MatIcon,
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
}