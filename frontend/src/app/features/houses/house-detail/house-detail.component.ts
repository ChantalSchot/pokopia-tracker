import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { HouseService } from '@core/services/house.service';
import { HouseResponse, FavouriteResponse, HouseSuggestionsResponse, PokemonResponse } from '@core/models';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { PokemonCardComponent } from '@shared/components/pokemon-card/pokemon-card.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { HouseDialogComponent } from '../house-dialog/house-dialog.component';

@Component({
  selector: 'app-house-detail',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule,
    MatDialogModule, MatSnackBarModule, MatProgressBarModule, MatTabsModule, MatDividerModule,
    LoadingSpinnerComponent, PageHeaderComponent, PokemonCardComponent, EmptyStateComponent
  ],
  template: `
    <div class="page-container">
      @if (loading()) {
        <app-loading-spinner></app-loading-spinner>
      } @else if (house()) {
        <app-page-header [title]="house()!.name" [subtitle]="house()!.region + ' - ' + house()!.houseType">
          <button mat-stroked-button (click)="onEdit()"><mat-icon>edit</mat-icon> Edit</button>
          <button mat-stroked-button color="warn" (click)="onDelete()"><mat-icon>delete</mat-icon> Delete</button>
        </app-page-header>

        <div class="house-info">
          <mat-card>
            <mat-card-content>
              <div class="info-grid">
                @if (house()!.idealHabitat) {
                  <div class="info-item"><span class="label">Habitat</span><span>{{ house()!.idealHabitat }}</span></div>
                }
                <div class="info-item">
                  <span class="label">Capacity</span>
                  <span>{{ house()!.occupancy }}/{{ house()!.capacity }}</span>
                </div>
                <div class="info-item"><span class="label">Items</span><span>{{ house()!.items.length }}</span></div>
              </div>
              <mat-progress-bar [value]="(house()!.occupancy / house()!.capacity) * 100"
                [color]="house()!.occupancy >= house()!.capacity ? 'warn' : 'primary'"
                aria-label="Capacity"></mat-progress-bar>
            </mat-card-content>
          </mat-card>
        </div>

        @if (activeFavourites().length > 0) {
          <div class="section">
            <h3>Active Favourites</h3>
            <div class="chip-list">
              @for (fav of activeFavourites(); track fav.id) {
                <mat-chip>{{ fav.name }}</mat-chip>
              }
            </div>
          </div>
        }

        <mat-tab-group>
          <mat-tab label="Assigned Pok\u00e9mon ({{ house()!.assignedPokemon.length }})">
            @if (house()!.assignedPokemon.length === 0) {
              <app-empty-state icon="catching_pokemon" title="No Pok\u00e9mon assigned" message="Use suggestions to find matching Pok\u00e9mon"></app-empty-state>
            } @else {
              <div class="card-grid" style="padding-top: 16px;">
                @for (up of house()!.assignedPokemon; track up.id) {
                  <mat-card class="assigned-card" [class.warning]="up.warning">
                    <mat-card-content>
                      <span class="num">{{ up.pokemonNumber }}</span>
                      <strong>{{ up.pokemonName }}</strong>
                      @if (up.warning) {
                        <mat-icon color="warn" matTooltip="No matching favourites">warning</mat-icon>
                      }
                      <button mat-icon-button color="warn" (click)="removePokemon(up.pokemonId)" aria-label="Remove from house">
                        <mat-icon>remove_circle</mat-icon>
                      </button>
                    </mat-card-content>
                  </mat-card>
                }
              </div>
            }
          </mat-tab>
          <mat-tab label="Suggestions">
            @if (suggestions() && suggestions()!.suggestions.length > 0) {
              <div class="card-grid" style="padding-top: 16px;">
                @for (p of suggestions()!.suggestions; track p.id) {
                  <mat-card class="suggestion-card" (click)="assignPokemon(p.id)">
                    <mat-card-content>
                      <span class="num">{{ p.number }}</span>
                      <strong>{{ p.name }}</strong>
                      <button mat-icon-button color="primary" aria-label="Assign to house">
                        <mat-icon>add_circle</mat-icon>
                      </button>
                    </mat-card-content>
                  </mat-card>
                }
              </div>
            } @else {
              <app-empty-state icon="lightbulb" title="No suggestions" message="Set a habitat and add items to get suggestions"></app-empty-state>
            }
          </mat-tab>
        </mat-tab-group>
      }
    </div>
  `,
  styles: [`
    .house-info { margin-bottom: var(--spacing-lg); }
    .info-grid { display: flex; gap: var(--spacing-xl); margin-bottom: var(--spacing-md); flex-wrap: wrap; }
    .info-item { display: flex; flex-direction: column; .label { font-size: var(--font-size-xs); color: var(--color-text-secondary); text-transform: uppercase; } }
    .section { margin: var(--spacing-lg) 0; h3 { margin-bottom: var(--spacing-sm); } }
    .chip-list { display: flex; flex-wrap: wrap; gap: var(--spacing-xs); }
    .assigned-card mat-card-content, .suggestion-card mat-card-content {
      display: flex; align-items: center; gap: var(--spacing-sm);
    }
    .num { font-weight: 700; color: var(--color-text-secondary); }
    .assigned-card.warning { border-left: 3px solid var(--color-warning); }
    .suggestion-card { cursor: pointer; &:hover { background: var(--color-surface-variant); } }
  `]
})
export class HouseDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private houseService = inject(HouseService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  house = signal<HouseResponse | null>(null);
  activeFavourites = signal<FavouriteResponse[]>([]);
  suggestions = signal<HouseSuggestionsResponse | null>(null);
  loading = signal(true);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loadHouse(id);
  }

  loadHouse(id: string) {
    this.loading.set(true);
    this.houseService.getById(id).subscribe({
      next: (house) => {
        this.house.set(house);
        this.loading.set(false);
        this.loadActiveFavourites(id);
        this.loadSuggestions(id);
      },
      error: () => { this.loading.set(false); this.router.navigate(['/houses']); }
    });
  }

  loadActiveFavourites(id: string) {
    this.houseService.getActiveFavourites(id).subscribe(favs => this.activeFavourites.set(favs));
  }

  loadSuggestions(id: string) {
    this.houseService.getSuggestions(id).subscribe(s => this.suggestions.set(s));
  }

  assignPokemon(pokemonId: string) {
    this.houseService.assignPokemon(this.house()!.id, pokemonId).subscribe({
      next: (house) => {
        this.house.set(house);
        this.loadActiveFavourites(house.id);
        this.loadSuggestions(house.id);
        this.snackBar.open('Pok\u00e9mon assigned!', 'Close', { duration: 3000, panelClass: 'success-snackbar' });
      },
      error: (err) => this.snackBar.open(err.error?.message || 'Failed', 'Close', { duration: 5000, panelClass: 'error-snackbar' })
    });
  }

  removePokemon(pokemonId: string) {
    this.houseService.removePokemon(this.house()!.id, pokemonId).subscribe({
      next: (house) => {
        this.house.set(house);
        this.loadSuggestions(house.id);
        this.snackBar.open('Pok\u00e9mon removed', 'Close', { duration: 3000 });
      },
      error: (err) => this.snackBar.open(err.error?.message || 'Failed', 'Close', { duration: 5000, panelClass: 'error-snackbar' })
    });
  }

  onEdit() {
    const dialogRef = this.dialog.open(HouseDialogComponent, { width: '500px', data: { mode: 'edit', house: this.house() } });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.houseService.update(this.house()!.id, result).subscribe({
          next: (house) => { this.house.set(house); this.snackBar.open('House updated', 'Close', { duration: 3000, panelClass: 'success-snackbar' }); },
          error: (err) => this.snackBar.open(err.error?.message || 'Failed', 'Close', { duration: 5000, panelClass: 'error-snackbar' })
        });
      }
    });
  }

  onDelete() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete House', message: 'All assigned Pok\u00e9mon will become homeless. Are you sure?', confirmText: 'Delete' }
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.houseService.delete(this.house()!.id).subscribe({
          next: () => { this.snackBar.open('House deleted', 'Close', { duration: 3000 }); this.router.navigate(['/houses']); },
          error: (err) => this.snackBar.open(err.error?.message || 'Failed', 'Close', { duration: 5000, panelClass: 'error-snackbar' })
        });
      }
    });
  }
}
