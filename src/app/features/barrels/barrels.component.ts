import {Component, OnDestroy, OnInit} from '@angular/core';
import {DecimalPipe, NgClass, NgIf, PercentPipe, TitleCasePipe} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MaterialModule} from '../../shared/material.module';
import {BarrelsService} from '../../shared/services/barrels.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog} from '@angular/material/dialog';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {Barrel, BarrelStatistics} from '../../shared/models/barrel.interface';
import {AddBarrelDialogComponent} from './add-barrel-dialog/add-barrel-dialog.component';

@Component({
  selector: 'app-barrels',
  standalone: true,
  imports: [
    MaterialModule,
    FormsModule,
    PercentPipe,
    DecimalPipe,
    TitleCasePipe,
    NgIf,
    NgClass
  ],
  templateUrl: './barrels.component.html',
  styleUrl: './barrels.component.scss'
})
export class BarrelsComponent implements OnInit, OnDestroy {
  barrels: Barrel[] = [];
  statistics: BarrelStatistics | null = null;
  loading = false;
  searchTerm = '';
  displayedColumns = ['barrel_number', 'capacity', 'current_volume', 'location', 'actions'];

  private destroy$ = new Subject<void>();

  constructor(
    private barrelsService: BarrelsService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
    this.loadBarrels();
    this.loadStatistics();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBarrels(): void {
    this.loading = true;
    const params: any = {};

    if (this.searchTerm) {
      params.search = this.searchTerm;
    }

    this.barrelsService.getBarrels(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.barrels = response.results;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading barrels:', error);
          this.loading = false;
          this.snackBar.open(
            'Failed to load barrels. Please try again.',
            'Close',
            {duration: 3000, panelClass: ['error-snackbar']}
          );
        }
      });
  }

  loadStatistics(): void {
    this.barrelsService.getStatistics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.statistics = stats;
        },
        error: (error) => {
          console.error('Error loading statistics:', error);
        }
      });
  }

  applyFilters(): void {
    this.loadBarrels();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.loadBarrels();
  }

  editBarrel(barrel: Barrel): void {
    // TODO: Implement edit barrel dialog
    this.snackBar.open(
      'Edit barrel feature coming soon',
      'Close',
      {duration: 3000, panelClass: ['info-snackbar']}
    );
  }


  addBarrel(): void {
    const dialogRef = this.dialog.open(AddBarrelDialogComponent, {
      width: '600px',
      disableClose: true
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result) {
          this.createBarrel(result);
        }
      });
  }

  private createBarrel(barrel: Partial<Barrel>): void {
    this.loading = true;
    this.barrelsService.createBarrel(barrel)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newBarrel) => {
          this.snackBar.open(
            `Barrel ${newBarrel.barrel_number} created successfully`,
            'Close',
            {duration: 3000, panelClass: ['success-snackbar']}
          );
          this.loadBarrels();
          this.loadStatistics();
        },
        error: (error) => {
          console.error('Error creating barrel:', error);
          this.loading = false;
          let errorMessage = 'Failed to create barrel. Please try again.';

          if (error.error?.barrel_number) {
            errorMessage = error.error.barrel_number[0];
          } else if (error.error?.non_field_errors) {
            errorMessage = error.error.non_field_errors[0];
          }

          this.snackBar.open(
            errorMessage,
            'Close',
            {duration: 5000, panelClass: ['error-snackbar']}
          );
        }
      });
  }

  exportBarrels(): void {
    // TODO: Implement export functionality
    this.snackBar.open(
      'Export feature coming soon',
      'Close',
      {duration: 3000, panelClass: ['info-snackbar']}
    );
  }

  deleteBarrel(barrel: any) {
    
  }
}
