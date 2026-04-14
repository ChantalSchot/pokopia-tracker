import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminService } from '@core/services/admin.service';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';

@Component({
  selector: 'app-admin-import',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatSnackBarModule, MatProgressSpinnerModule, PageHeaderComponent],
  template: `
    <div class="page-container" style="max-width: 800px;">
      <app-page-header title="Data Import" subtitle="Import master data from JSON files"></app-page-header>
      <mat-card>
        <mat-card-content>
          <div class="import-actions">
            <button mat-flat-button color="primary" (click)="importAll()" [disabled]="importing()">
              @if (importing()) { <mat-spinner diameter="20"></mat-spinner> } @else { <mat-icon>cloud_upload</mat-icon> Import All }
            </button>
            <div class="dataset-buttons">
              @for (ds of datasets; track ds) {
                <button mat-stroked-button (click)="importDataset(ds)" [disabled]="importing()">{{ ds }}</button>
              }
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .import-actions { display: flex; flex-direction: column; gap: var(--spacing-lg); align-items: center; }
    .dataset-buttons { display: flex; flex-wrap: wrap; gap: var(--spacing-sm); justify-content: center; }
  `]
})
export class AdminImportComponent {
  private adminService = inject(AdminService);
  private snackBar = inject(MatSnackBar);
  importing = signal(false);
  datasets = ['pokemon', 'items', 'favourites', 'habitats', 'housing-kits', 'specialties'];

  importAll() {
    this.importing.set(true);
    this.adminService.importAll().subscribe({
      next: (msg) => { this.snackBar.open(msg, 'Close', { duration: 5000, panelClass: 'success-snackbar' }); this.importing.set(false); },
      error: (err) => { this.snackBar.open(err.error?.message || 'Import failed', 'Close', { duration: 5000, panelClass: 'error-snackbar' }); this.importing.set(false); }
    });
  }

  importDataset(dataset: string) {
    this.importing.set(true);
    this.adminService.importDataset(dataset).subscribe({
      next: (msg) => { this.snackBar.open(msg, 'Close', { duration: 5000, panelClass: 'success-snackbar' }); this.importing.set(false); },
      error: (err) => { this.snackBar.open(err.error?.message || 'Import failed', 'Close', { duration: 5000, panelClass: 'error-snackbar' }); this.importing.set(false); }
    });
  }
}
