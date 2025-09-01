import {Component, OnInit, signal} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {SettingsService} from './features/settings/settings.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('olive-crm');
  
  constructor(private settingsService: SettingsService) {}
  
  ngOnInit(): void {
    // Initialize theme on app startup
    this.settingsService.initializeTheme();
  }
}
