import {Component} from '@angular/core';
import {MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle} from '@angular/material/card';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatChip} from '@angular/material/chips';
import {CurrencyPipe, NgFor} from '@angular/common';

export interface Bottle {
  id: number;
  name: string;
  type: string;
  volume: string;
  price: number;
  stock: number;
  sku: string;
  description: string;
  imageUrl?: string;
}

@Component({
  selector: 'app-bottles',
  standalone: true,
  imports: [
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatButton,
    MatIcon,
    MatChip,
    CurrencyPipe,
    NgFor
  ],
  templateUrl: './bottles.component.html',
  styleUrl: './bottles.component.scss'
})
export class BottlesComponent {
  bottles: Bottle[] = [
    {
      id: 1,
      name: 'Premium Extra Virgin',
      type: 'Extra Virgin',
      volume: '750ml',
      price: 29.99,
      stock: 145,
      sku: 'PEV-750',
      description: 'Our finest extra virgin olive oil with rich, fruity notes'
    },
    {
      id: 2,
      name: 'Organic Gold',
      type: 'Organic',
      volume: '500ml',
      price: 24.99,
      stock: 89,
      sku: 'OG-500',
      description: 'Certified organic olive oil from hand-picked olives'
    },
    {
      id: 3,
      name: 'Classic Virgin',
      type: 'Virgin',
      volume: '1L',
      price: 19.99,
      stock: 234,
      sku: 'CV-1000',
      description: 'Traditional virgin olive oil perfect for everyday cooking'
    },
    {
      id: 4,
      name: 'Infused Garlic',
      type: 'Infused',
      volume: '250ml',
      price: 14.99,
      stock: 56,
      sku: 'IG-250',
      description: 'Virgin olive oil infused with fresh garlic'
    },
    {
      id: 5,
      name: 'Limited Edition',
      type: 'Premium',
      volume: '500ml',
      price: 49.99,
      stock: 12,
      sku: 'LE-500',
      description: 'Limited harvest from century-old olive trees'
    },
    {
      id: 6,
      name: 'Family Reserve',
      type: 'Reserve',
      volume: '750ml',
      price: 39.99,
      stock: 67,
      sku: 'FR-750',
      description: 'Special reserve blend from our family orchards'
    }
  ];

  getStockStatus(stock: number): string {
    if (stock > 100) return 'In Stock';
    if (stock > 20) return 'Low Stock';
    return 'Critical';
  }

  getStockColor(stock: number): string {
    if (stock > 100) return 'primary';
    if (stock > 20) return 'accent';
    return 'warn';
  }
}
