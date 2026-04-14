import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { HabitatService } from '@core/services/habitat.service';
import { HabitatResponse } from '@core/models';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { environment } from '@env';

@Component({
  selector: 'app-habitats',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatChipsModule, LoadingSpinnerComponent, PageHeaderComponent],
  template: `
    <div class="page-container">
      <app-page-header title="Habitats" subtitle="Explore natural habitats"></app-page-header>
      @if (loading()) {
        <app-loading-spinner></app-loading-spinner>
      } @else {
        <div class="card-grid">
          @for (habitat of habitats(); track habitat.id) {
            <mat-card class="habitat-card" role="article" [attr.aria-label]="habitat.name">
              <div class="habitat-image">
                <img [src]="getImageUrl(habitat.imagePath)" [alt]="habitat.name" loading="lazy" (error)="onImageError($event)">
                @if (habitat.isEvent) {
                  <mat-icon class="event-badge">star</mat-icon>
                }
              </div>
              <mat-card-content>
                <h3>{{ habitat.name }}</h3>
                <div class="pokemon-numbers">
                  @for (num of habitat.pokemonNumbers; track num) {
                    <mat-chip>{{ num }}</mat-chip>
                  }
                </div>
              </mat-card-content>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .habitat-card { .habitat-image { position: relative; text-align: center; padding: var(--spacing-sm); img { width: 100%; max-height: 150px; object-fit: cover; border-radius: var(--radius-md); } } }
    .event-badge { position: absolute; top: 8px; right: 8px; color: var(--color-accent); }
    h3 { font-weight: 700; margin: var(--spacing-sm) 0; }
    .pokemon-numbers { display: flex; flex-wrap: wrap; gap: 4px; }
  `]
})
export class HabitatsComponent implements OnInit {
  private habitatService = inject(HabitatService);
  habitats = signal<HabitatResponse[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.habitatService.getAll().subscribe({
      next: (data) => { this.habitats.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  getImageUrl(path: string): string { return path ? `${environment.apiUrl}/${path}` : ''; }
  onImageError(event: Event) { (event.target as HTMLImageElement).style.display = 'none'; }
}
