import { Component, EventEmitter, Output } from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatBadge } from '@angular/material/badge';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatDivider } from '@angular/material/divider';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [
    MatToolbar,
    MatIconButton,
    MatIcon,
    MatBadge,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatDivider
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
