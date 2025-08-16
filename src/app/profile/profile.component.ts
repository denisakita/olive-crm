import { Component } from '@angular/core';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle, MatCardSubtitle } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/divider';
import { MatList, MatListItem } from '@angular/material/list';
import { FormsModule } from '@angular/forms';
import { DatePipe, NgIf } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatFormField,
    MatLabel,
    MatInput,
    MatButton,
    MatIcon,
    MatDivider,
    MatList,
    MatListItem,
    FormsModule,
    DatePipe,
    NgIf
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  user = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@olivecrm.com',
    phone: '+1 (555) 123-4567',
    role: 'Administrator',
    department: 'Management',
    joinDate: new Date('2023-01-15'),
    location: 'New York, USA',
    bio: 'Experienced olive oil industry professional with over 10 years in the business.'
  };
  
  isEditing = false;
  
  toggleEdit() {
    this.isEditing = !this.isEditing;
  }
  
  saveProfile() {
    // Save profile logic here
    this.isEditing = false;
  }
  
  cancelEdit() {
    // Reset changes
    this.isEditing = false;
  }
}