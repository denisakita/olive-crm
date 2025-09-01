import {Component} from '@angular/core';
import {MatDividerModule, MatIconModule, MatListModule, MatSidenavModule} from '../../material.module';
import {RouterLink, RouterLinkActive} from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
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

