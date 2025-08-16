import { Component, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../../shared/components/header/header';
import { Sidebar } from '../../shared/components/sidebar/sidebar';

@Component({
  selector: 'app-main-layout',
  imports: [
    RouterOutlet,
    Header,
    Sidebar
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayout {
  @ViewChild('sidebar') sidebar!: Sidebar;
}
