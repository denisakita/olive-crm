import {Component, Inject} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MaterialModule} from '../../../shared/material.module';
import {Barrel} from '../../../shared/models/barrel.interface';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-add-barrel-dialog',
  standalone: true,
  imports: [
    MaterialModule,
    ReactiveFormsModule,
    NgIf
  ],
  templateUrl: './add-barrel-dialog.component.html',
  styleUrl: './add-barrel-dialog.component.scss'
})
export class AddBarrelDialogComponent {
  barrelForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddBarrelDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.barrelForm = this.fb.group({
      barrel_number: ['', [Validators.required]],
      capacity: [0, [Validators.required, Validators.min(0.1)]],
      current_volume: [0, [Validators.required, Validators.min(0)]],
      location: ['', [Validators.required]],
      notes: ['']
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.barrelForm.valid) {
      const barrel: Partial<Barrel> = this.barrelForm.value;
      this.dialogRef.close(barrel);
    }
  }

  get isFormValid(): boolean {
    return this.barrelForm.valid;
  }
}
