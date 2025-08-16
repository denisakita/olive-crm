import { Component } from '@angular/core';
import {
  MatSidenavModule,
  MatListModule,
  MatDividerModule,
  MatIconModule
} from '../../material.module';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [
    MatSidenavModule,
    MatListModule,
    MatDividerModule,
    MatIconModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {
  isOpen: boolean = true;
  
  toggle(): void {
    this.isOpen = !this.isOpen;
  }
}

