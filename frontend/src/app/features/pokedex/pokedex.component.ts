import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PokemonService } from '@core/services/pokemon.service';
import { PokemonResponse, UserPokemonResponse, POKEMON_TYPES, IDEAL_HABITATS, RARITIES } from '@core/models';
import { PokemonCardComponent } from '@shared/components/pokemon-card/pokemon-card.component';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';

@Component({
  selector: 'app-pokedex',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatPaginatorModule, MatDialogModule, MatSnackBarModule,
    PokemonCardComponent, LoadingSpinnerComponent, EmptyStateComponent, PageHeaderComponent
  ],
  template: `
    <div class="page-container">
      <app-page-header title="Pok\u00e9dex" [subtitle]="'Browse and register Pok\u00e9mon'"></app-page-header>
      <div class="content-layout">
        <div class="main-content">
          @if (loading()) {
            <app-loading-spinner></app-loading-spinner>
          } @else if (pokemon().length === 0) {
            <app-empty-state icon="catching_pokemon" title="No Pok\u00e9mon found" message="Try adjusting your filters"></app-empty-state>
          } @else {
            <div class="card-grid">
              @for (p of pokemon(); track p.id) {
                <app-pokemon-card [pokemon]="p"
                  [registered]="isRegistered(p.id)"
                  [homeless]="isHomeless(p.id)"
                  [showActions]="true"
                  (register)="onRegister($event)"
                  (unregister)="onUnregister($event)">
                </app-pokemon-card>
              }
            </div>
            <mat-paginator [length]="totalElements()" [pageSize]="pageSize" [pageSizeOptions]="[20, 40, 60]"
              (page)="onPageChange($event)" aria-label="Pok\u00e9dex pagination"></mat-paginator>
          }
        </div>
        <aside class="filter-sidebar" role="search" aria-label="Filters">
          <h3>Filters</h3>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Search name</mat-label>
            <input matInput [(ngModel)]="filters.name" (keyup.enter)="loadPokemon()">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Habitat</mat-label>
            <mat-select [(ngModel)]="filters.idealHabitat" (selectionChange)="loadPokemon()">
              <mat-option [value]="''">All</mat-option>
              @for (h of habitats; track h) {
                <mat-option [value]="h">{{ h }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Rarity</mat-label>
            <mat-select [(ngModel)]="filters.rarity" (selectionChange)="loadPokemon()">
              <mat-option [value]="''">All</mat-option>
              @for (r of rarities; track r) {
                <mat-option [value]="r">{{ r }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <button mat-stroked-button (click)="clearFilters()">Clear Filters</button>
        </aside>
      </div>
    </div>
  `,
  styles: [`
    .content-layout { display: flex; gap: var(--spacing-lg); }
    .main-content { flex: 1; min-width: 0; }
    .filter-sidebar {
      width: var(--sidebar-width); flex-shrink: 0;
      position: sticky; top: 80px; align-self: flex-start;
      h3 { margin-bottom: var(--spacing-md); font-weight: 700; }
    }
    .full-width { width: 100%; }
    @media (max-width: 1024px) {
      .content-layout { flex-direction: column-reverse; }
      .filter-sidebar { width: 100%; position: static; }
    }
  `]
})
export class PokedexComponent implements OnInit {
  private pokemonService = inject(PokemonService);
  private snackBar = inject(MatSnackBar);

  pokemon = signal<PokemonResponse[]>([]);
  registered = signal<Map<string, UserPokemonResponse>>(new Map());
  loading = signal(true);
  totalElements = signal(0);
  pageSize = 20;
  page = 0;

  habitats = [...IDEAL_HABITATS];
  rarities = [...RARITIES];
  types = [...POKEMON_TYPES];
  filters: any = { name: '', idealHabitat: '', rarity: '' };

  ngOnInit() {
    this.loadPokemon();
    this.loadRegistered();
  }

  loadPokemon() {
    this.loading.set(true);
    this.pokemonService.getAll({ ...this.filters, page: this.page, size: this.pageSize, sort: 'number' }).subscribe({
      next: (res) => { this.pokemon.set(res.content); this.totalElements.set(res.totalElements); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  loadRegistered() {
    this.pokemonService.getRegistered({ size: 1000 }).subscribe({
      next: (res) => {
        const map = new Map<string, UserPokemonResponse>();
        res.content.forEach(r => map.set(r.pokemonId, r));
        this.registered.set(map);
      }
    });
  }

  isRegistered(pokemonId: string): boolean { return this.registered().has(pokemonId); }
  isHomeless(pokemonId: string): boolean {
    const reg = this.registered().get(pokemonId);
    return reg ? reg.homeless : false;
  }

  onRegister(pokemon: PokemonResponse) {
    this.pokemonService.register(pokemon.id).subscribe({
      next: (reg) => {
        const map = new Map(this.registered());
        map.set(reg.pokemonId, reg);
        this.registered.set(map);
        this.snackBar.open(`${pokemon.name} registered!`, 'Close', { duration: 3000, panelClass: 'success-snackbar' });
      },
      error: (err) => this.snackBar.open(err.error?.message || 'Failed', 'Close', { duration: 5000, panelClass: 'error-snackbar' })
    });
  }

  onUnregister(pokemon: PokemonResponse) {
    this.pokemonService.unregister(pokemon.id).subscribe({
      next: () => {
        const map = new Map(this.registered());
        map.delete(pokemon.id);
        this.registered.set(map);
        this.snackBar.open(`${pokemon.name} unregistered`, 'Close', { duration: 3000 });
      },
      error: (err) => this.snackBar.open(err.error?.message || 'Failed', 'Close', { duration: 5000, panelClass: 'error-snackbar' })
    });
  }

  onPageChange(event: PageEvent) {
    this.page = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadPokemon();
  }

  clearFilters() {
    this.filters = { name: '', idealHabitat: '', rarity: '' };
    this.page = 0;
    this.loadPokemon();
  }
}
