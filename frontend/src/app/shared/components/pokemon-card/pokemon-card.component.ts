import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PokemonResponse } from '@core/models';
import { environment } from '@env';

@Component({
  selector: 'app-pokemon-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatChipsModule, MatIconModule, MatButtonModule, MatTooltipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card class="pokemon-card" [class.registered]="registered" [class.homeless]="homeless" [class.warning]="warning"
              role="article" [attr.aria-label]="pokemon.name + ' card'">
      <div class="card-header">
        <span class="pokemon-number">{{ pokemon.number }}</span>
        @if (pokemon.isEvent) {
          <mat-icon class="event-badge" matTooltip="Event Pokémon" aria-label="Event Pokémon">star</mat-icon>
        }
        @if (registered) {
          <mat-icon class="registered-badge" matTooltip="Registered" aria-label="Registered">check_circle</mat-icon>
        }
        @if (warning) {
          <mat-icon class="warning-badge" matTooltip="No matching favourites in house" aria-label="Warning: no matching favourites">warning</mat-icon>
        }
      </div>
      <div class="sprite-container">
        <img [src]="getSpriteSrc()" [alt]="pokemon.name + ' sprite'" loading="lazy"
             (error)="onImageError($event)">
      </div>
      <mat-card-content>
        <h3 class="pokemon-name">{{ pokemon.name }}</h3>
        <div class="type-chips" role="list" aria-label="Types">
          @for (type of pokemon.types; track type) {
            <span class="type-chip" [style.background-color]="getTypeColor(type)" role="listitem">{{ type }}</span>
          }
        </div>
        @if (pokemon.specialties.length > 0) {
          <div class="specialties" role="list" aria-label="Specialties">
            @for (spec of pokemon.specialties; track spec.id) {
              <img [src]="getAssetUrl(spec.imagePath)" [alt]="spec.name" [matTooltip]="spec.name"
                   class="specialty-icon" loading="lazy" role="listitem">
            }
          </div>
        }
      </mat-card-content>
      @if (showActions) {
        <mat-card-actions>
          @if (!registered) {
            <button mat-stroked-button color="primary" (click)="register.emit(pokemon)" [attr.aria-label]="'Register ' + pokemon.name">Register</button>
          } @else {
            <button mat-stroked-button color="warn" (click)="unregister.emit(pokemon)" [attr.aria-label]="'Unregister ' + pokemon.name">Unregister</button>
          }
        </mat-card-actions>
      }
    </mat-card>
  `,
  styles: [`
    .pokemon-card {
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      border: 2px solid transparent;
      &:hover { transform: translateY(-2px); box-shadow: 0 4px 12px var(--color-card-shadow); }
      &.registered { border-color: var(--color-primary); }
      &.homeless { border-color: var(--color-warning); border-style: dashed; }
      &.warning { border-color: var(--color-error); }
    }
    .card-header {
      display: flex; align-items: center; gap: var(--spacing-xs);
      padding: var(--spacing-sm) var(--spacing-sm) 0;
    }
    .pokemon-number { font-size: var(--font-size-sm); color: var(--color-text-secondary); font-weight: 700; }
    .event-badge { color: var(--color-accent); font-size: 18px; width: 18px; height: 18px; }
    .registered-badge { color: var(--color-success); font-size: 18px; width: 18px; height: 18px; margin-left: auto; }
    .warning-badge { color: var(--color-warning); font-size: 18px; width: 18px; height: 18px; }
    .sprite-container {
      text-align: center; padding: var(--spacing-sm);
      img { width: 80px; height: 80px; object-fit: contain; image-rendering: pixelated; }
    }
    .pokemon-name { font-weight: 700; font-size: var(--font-size-md); text-align: center; margin-bottom: var(--spacing-xs); }
    .type-chips { display: flex; gap: 4px; justify-content: center; flex-wrap: wrap; }
    .type-chip {
      padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 700;
      color: white; text-transform: uppercase;
    }
    .specialties { display: flex; gap: 4px; justify-content: center; margin-top: var(--spacing-xs); }
    .specialty-icon { width: 24px; height: 24px; }
    mat-card-actions { display: flex; justify-content: center; }
  `]
})
export class PokemonCardComponent {
  @Input({ required: true }) pokemon!: PokemonResponse;
  @Input() registered = false;
  @Input() homeless = false;
  @Input() warning = false;
  @Input() showActions = false;
  @Output() register = new EventEmitter<PokemonResponse>();
  @Output() unregister = new EventEmitter<PokemonResponse>();
  @Output() cardClick = new EventEmitter<PokemonResponse>();

  private typeColors: Record<string, string> = {
    Bug: '#A8B820', Dark: '#705848', Dragon: '#7038F8', Electric: '#F8D030',
    Fairy: '#EE99AC', Fighting: '#C03028', Fire: '#F08030', Flying: '#A890F0',
    Ghost: '#705898', Grass: '#78C850', Ground: '#E0C068', Ice: '#98D8D8',
    Normal: '#A8A878', Poison: '#A040A0', Psychic: '#F85888', Rock: '#B8A038',
    Steel: '#B8B8D0', Water: '#6890F0'
  };

  getTypeColor(type: string): string {
    return this.typeColors[type] || '#A8A878';
  }

  getSpriteSrc(): string {
    return this.getAssetUrl(this.pokemon.spritePath);
  }

  getAssetUrl(path: string): string {
    if (!path) return '';
    return `${environment.apiUrl}/${path}`;
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = '';
    (event.target as HTMLImageElement).style.display = 'none';
  }
}
