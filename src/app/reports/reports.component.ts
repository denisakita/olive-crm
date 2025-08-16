import {Component} from '@angular/core';
import {
  MatCardModule,
  MatButtonModule,
  MatIconModule,
  MatChipsModule
} from '../shared/material.module';
import {DatePipe, NgFor} from '@angular/common';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    DatePipe,
    NgFor
  ],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent {
  reports = [
    {title: 'Monthly Sales Report', type: 'Sales', date: new Date(), status: 'Ready'},
    {title: 'Barrel Analysis', type: 'Barrel', date: new Date(), status: 'Processing'},

  ];
}
