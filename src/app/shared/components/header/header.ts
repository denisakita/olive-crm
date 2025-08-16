import { Component, EventEmitter, Output } from '@angular/core';
import {
  MatToolbarModule,
  MatButtonModule,
  MatIconModule,
  MatBadgeModule,
  MatMenuModule,
  MatDividerModule
} from '../../material.module';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule,
    MatDividerModule,
    RouterLink
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  @Output() sidebarToggle = new EventEmitter<void>();
  
  constructor(private router: Router) {}
  
  toggleSidebar(): void {
    this.sidebarToggle.emit();
  }
  
  logout(): void {
    this.router.navigate(['/auth/login']);
  }
}
