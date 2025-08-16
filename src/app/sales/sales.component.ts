import { Component } from '@angular/core';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatTable, MatTableDataSource, MatColumnDef, MatHeaderCell, MatCell, MatHeaderCellDef, MatCellDef, MatHeaderRow, MatRow, MatHeaderRowDef, MatRowDef } from '@angular/material/table';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { DatePipe, CurrencyPipe } from '@angular/common';

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
    MatButton,
    MatIcon,
    DatePipe,
    CurrencyPipe
  ],
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.scss'
})
export class SalesComponent {
  displayedColumns: string[] = ['id', 'customer', 'product', 'quantity', 'price', 'date', 'status', 'actions'];
  dataSource = new MatTableDataSource<Sale>([
    { id: 1, customer: 'John Doe', product: 'Olive Oil Premium', quantity: 5, price: 150, date: new Date(), status: 'Completed' },
    { id: 2, customer: 'Jane Smith', product: 'Extra Virgin Oil', quantity: 3, price: 120, date: new Date(), status: 'Pending' },
    { id: 3, customer: 'Bob Johnson', product: 'Organic Olive Oil', quantity: 10, price: 350, date: new Date(), status: 'Completed' },
  ]);
}