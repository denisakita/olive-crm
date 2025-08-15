import { Component } from '@angular/core';
import {MatSidenav, MatSidenavContainer, MatSidenavContent} from '@angular/material/sidenav';
import {
  MatDivider,
  MatListItem,
  MatListItemTitle,
  MatListSubheaderCssMatStyler,
  MatNavList
} from '@angular/material/list';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {MatIcon} from '@angular/material/icon';
import {BooleanInput} from '@angular/cdk/coercion';

@Component({
  selector: 'app-sidebar',
  imports: [
    MatIcon,
    MatSidenavContent,
    MatListItemTitle,
    RouterLinkActive,
    RouterLink,
    MatListSubheaderCssMatStyler,
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
  isOpen: BooleanInput;

}

