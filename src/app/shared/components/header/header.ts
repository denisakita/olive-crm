import {Component, EventEmitter, Output} from '@angular/core';
import {
  MatBadgeModule,
  MatButtonModule,
  MatDividerModule,
  MatIconModule,
  MatMenuModule,
  MatToolbarModule
} from '../../material.module';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from '../../../auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
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

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
  }

  toggleSidebar(): void {
    this.sidebarToggle.emit();
  }


  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Even if logout fails on server, navigate to login
        this.router.navigate(['/auth/login']);
      }
    });
  }
}
