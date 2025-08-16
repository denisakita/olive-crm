import { Component } from '@angular/core';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle, MatCardSubtitle } from '@angular/material/card';
import { MatButton, MatFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatChip } from '@angular/material/chips';
import { MatProgressBar } from '@angular/material/progress-bar';
import { DatePipe, PercentPipe, NgFor } from '@angular/common';

export interface Barrel {
  id: string;
  type: string;
  capacity: number;
  currentVolume: number;
  product: string;
  dateAdded: Date;
  status: 'Active' | 'Aging' | 'Ready' | 'Empty';
  location: string;
}

@Component({
  selector: 'app-barrels',
  standalone: true,
  imports: [
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatButton,
    MatFabButton,
    MatIcon,
    MatChip,
    MatProgressBar,
    DatePipe,
    PercentPipe,
    NgFor
  ],
  templateUrl: './barrels.component.html',
  styleUrl: './barrels.component.scss'
})
export class BarrelsComponent {
  barrels: Barrel[] = [
    {
      id: 'B2024-001',
      type: 'Oak',
      capacity: 225,
      currentVolume: 200,
      product: 'Extra Virgin Olive Oil',
      dateAdded: new Date('2024-01-15'),
      status: 'Aging',
      location: 'Warehouse A'
    },
    {
      id: 'B2024-002',
      type: 'Stainless Steel',
      capacity: 500,
      currentVolume: 450,
      product: 'Premium Olive Oil',
      dateAdded: new Date('2024-02-20'),
      status: 'Active',
      location: 'Warehouse B'
    },
    {
      id: 'B2024-003',
      type: 'Oak',
      capacity: 225,
      currentVolume: 225,
      product: 'Organic Olive Oil',
      dateAdded: new Date('2024-03-10'),
      status: 'Ready',
      location: 'Warehouse A'
    },
    {
      id: 'B2024-004',
      type: 'Ceramic',
      capacity: 300,
      currentVolume: 0,
      product: '',
      dateAdded: new Date('2024-03-15'),
      status: 'Empty',
      location: 'Warehouse C'
    }
  ];

  getStatusColor(status: string): string {
    switch(status) {
      case 'Active': return 'primary';
      case 'Aging': return 'accent';
      case 'Ready': return 'success';
      case 'Empty': return 'warn';
      default: return '';
    }
  }

  getFillPercentage(barrel: Barrel): number {
    return (barrel.currentVolume / barrel.capacity) * 100;
  }
}