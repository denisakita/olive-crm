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
  status: 'Empty' | 'Partial' | 'Full';
  location: string;
  bottleCapacity?: number; // How many 750ml bottles this barrel can fill
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
      status: 'Partial',
      location: 'Warehouse A',
      bottleCapacity: 267
    },
    {
      id: 'B2024-002',
      type: 'Stainless Steel',
      capacity: 500,
      currentVolume: 450,
      product: 'Premium Olive Oil',
      dateAdded: new Date('2024-02-20'),
      status: 'Partial',
      location: 'Warehouse B',
      bottleCapacity: 600
    },
    {
      id: 'B2024-003',
      type: 'Oak',
      capacity: 225,
      currentVolume: 225,
      product: 'Organic Olive Oil',
      dateAdded: new Date('2024-03-10'),
      status: 'Full',
      location: 'Warehouse A',
      bottleCapacity: 300
    },
    {
      id: 'B2024-004',
      type: 'Ceramic',
      capacity: 300,
      currentVolume: 0,
      product: '',
      dateAdded: new Date('2024-03-15'),
      status: 'Empty',
      location: 'Warehouse C',
      bottleCapacity: 400
    },
    {
      id: 'B2024-005',
      type: 'Stainless Steel',
      capacity: 1000,
      currentVolume: 1000,
      product: 'Premium Blend',
      dateAdded: new Date('2024-03-20'),
      status: 'Full',
      location: 'Warehouse A',
      bottleCapacity: 1333
    },
    {
      id: 'B2024-006',
      type: 'Oak',
      capacity: 225,
      currentVolume: 150,
      product: 'Infused Olive Oil',
      dateAdded: new Date('2024-03-25'),
      status: 'Partial',
      location: 'Warehouse B',
      bottleCapacity: 200
    }
  ];

  getStatusColor(status: string): string {
    switch(status) {
      case 'Full': return 'primary';
      case 'Partial': return 'accent';
      case 'Empty': return 'warn';
      default: return '';
    }
  }

  getFillPercentage(barrel: Barrel): number {
    return (barrel.currentVolume / barrel.capacity) * 100;
  }
  
  getBottlesFilled(barrel: Barrel): number {
    // Calculate how many 750ml bottles can be filled from current volume
    return Math.floor(barrel.currentVolume / 0.75);
  }
  
  getTotalBottleCapacity(barrel: Barrel): number {
    // Calculate total bottle capacity from full barrel
    return Math.floor(barrel.capacity / 0.75);
  }
  
  getTotalLiters(): number {
    return this.barrels.reduce((sum, barrel) => sum + barrel.currentVolume, 0);
  }
  
  getFullBarrels(): number {
    return this.barrels.filter(b => b.status === 'Full').length;
  }
  
  getPartialBarrels(): number {
    return this.barrels.filter(b => b.status === 'Partial').length;
  }
  
  getEmptyBarrels(): number {
    return this.barrels.filter(b => b.status === 'Empty').length;
  }
}