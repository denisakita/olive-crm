import {Component} from '@angular/core';
import {DatePipe, NgFor} from '@angular/common';
import {MaterialModule} from '../../shared/material.module';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    MaterialModule,
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
