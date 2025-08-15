
import { Component } from '@angular/core';
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from '@angular/material/card';
import {MatDivider, MatList, MatListItem} from '@angular/material/list';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-dashboard',
  imports: [
    MatCard,
    MatCardContent,
    MatList,
    MatCardTitle,
    MatCardHeader,
    MatListItem,
    MatDivider,
    MatButton,
    MatIcon,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {

}
