import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { HouseResponse } from '@core/models';

@Component({
  selector: 'app-house-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatProgressBarModule, MatChipsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card class="house-card" (click)="cardClick.emit(house)" role="article" [attr.aria-label]="house.name + ' house card'">
      <mat-card-header>
        <mat-icon mat-card-avatar>house</mat-icon>
        <mat-card-title>{{ house.name }}</mat-card-title>
        <mat-card-subtitle>{{ house.region }} &middot; {{ house.houseType }}</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        @if (house.idealHabitat) {
          <div class="habitat-info">
            <mat-icon>park</mat-icon>
            <span>{{ house.idealHabitat }}</span>
          </div>
        }
        <div class="capacity-bar">
          <div class="capacity-label">
            <span>Capacity</span>
            <span>{{ house.occupancy }}/{{ house.capacity }}</span>
          </div>
          <mat-progress-bar [value]="(house.occupancy / house.capacity) * 100"
                            [color]="house.occupancy >= house.capacity ? 'warn' : 'primary'"
                            aria-label="House capacity"></mat-progress-bar>
        </div>
        <div class="stats-row">
          <span class="stat"><mat-icon>inventory_2</mat-icon> {{ house.items.length }} items</span>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .house-card {
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      &:hover { transform: translateY(-2px); box-shadow: 0 4px 12px var(--color-card-shadow); }
    }
    .habitat-info {
      display: flex; align-items: center; gap: var(--spacing-xs);
      color: var(--color-text-secondary); margin-bottom: var(--spacing-sm);
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }
    .capacity-bar { margin: var(--spacing-sm) 0; }
    .capacity-label { display: flex; justify-content: space-between; font-size: var(--font-size-sm); margin-bottom: 4px; }
    .stats-row { display: flex; gap: var(--spacing-md); margin-top: var(--spacing-sm); }
    .stat {
      display: flex; align-items: center; gap: 4px;
      font-size: var(--font-size-sm); color: var(--color-text-secondary);
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }
  `]
})
export class HouseCardComponent {
  @Input({ required: true }) house!: HouseResponse;
  @Output() cardClick = new EventEmitter<HouseResponse>();
}
