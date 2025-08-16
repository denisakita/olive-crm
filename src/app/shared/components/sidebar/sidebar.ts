import { Component } from '@angular/core';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { MatDivider, MatListItem, MatNavList } from '@angular/material/list';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-sidebar',
  imports: [
    MatIcon,
    MatSidenavContent,
    RouterLinkActive,
    RouterLink,
    MatListItem,
    MatSidenav,
    MatSidenavContainer,
    MatNavList,
    MatDivider
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

