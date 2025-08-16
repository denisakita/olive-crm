import { Component } from '@angular/core';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatChip, MatChipSet } from '@angular/material/chips';
import { DatePipe, NgFor } from '@angular/common';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatButton,
    MatIcon,
    MatChip,
    MatChipSet,
    DatePipe,
    NgFor
  ],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent {
  reports = [
    { title: 'Monthly Sales Report', type: 'Sales', date: new Date(), status: 'Ready' },
    { title: 'Inventory Analysis', type: 'Inventory', date: new Date(), status: 'Processing' },
    { title: 'Customer Analytics', type: 'Customer', date: new Date(), status: 'Ready' },
    { title: 'Production Report', type: 'Production', date: new Date(), status: 'Ready' },
  ];
}