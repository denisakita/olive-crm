import {Component} from '@angular/core';
import {MatButtonModule, MatCardModule, MatDividerModule, MatIconModule} from '../../shared/material.module';

@Component({
  selector: 'app-dashboard',
  imports: [
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {

}
