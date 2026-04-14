import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HouseService } from '@core/services/house.service';
import { HouseResponse } from '@core/models';
import { HouseCardComponent } from '@shared/components/house-card/house-card.component';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { HouseDialogComponent } from './house-dialog/house-dialog.component';

@Component({
  selector: 'app-houses',
  standalone: true,
  imports: [
    CommonModule, MatButtonModule, MatIconModule, MatDialogModule, MatSnackBarModule,
    HouseCardComponent, LoadingSpinnerComponent, EmptyStateComponent, PageHeaderComponent
  ],
  template: `
    <div class="page-container">
      <app-page-header title="Houses" subtitle="Manage your houses">
        <button mat-flat-button color="primary" (click)="openCreateDialog()">
          <mat-icon>add</mat-icon> New House
        </button>
      </app-page-header>
      @if (loading()) {
        <app-loading-spinner></app-loading-spinner>
      } @else if (houses().length === 0) {
        <app-empty-state icon="house" title="No houses yet" message="Create your first house to get started!"></app-empty-state>
      } @else {
        <div class="card-grid">
          @for (house of houses(); track house.id) {
            <app-house-card [house]="house" (cardClick)="onHouseClick($event)"></app-house-card>
          }
        </div>
      }
    </div>
  `
})
export class HousesComponent implements OnInit {
  private houseService = inject(HouseService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  houses = signal<HouseResponse[]>([]);
  loading = signal(true);

  ngOnInit() { this.loadHouses(); }

  loadHouses() {
    this.loading.set(true);
    this.houseService.getAll({ size: 100 }).subscribe({
      next: (res) => { this.houses.set(res.content); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  onHouseClick(house: HouseResponse) {
    this.router.navigate(['/houses', house.id]);
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(HouseDialogComponent, { width: '500px', data: { mode: 'create' } });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.houseService.create(result).subscribe({
          next: () => { this.snackBar.open('House created!', 'Close', { duration: 3000, panelClass: 'success-snackbar' }); this.loadHouses(); },
          error: (err) => this.snackBar.open(err.error?.message || 'Failed', 'Close', { duration: 5000, panelClass: 'error-snackbar' })
        });
      }
    });
  }
}
