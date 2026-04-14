import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DashboardService } from '@core/services/dashboard.service';
import { DashboardResponse } from '@core/models';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatIconModule, MatButtonModule, LoadingSpinnerComponent, PageHeaderComponent],
  template: `
    <div class="page-container">
      <app-page-header title="Dashboard" subtitle="Your Pokopia overview"></app-page-header>
      @if (loading()) {
        <app-loading-spinner></app-loading-spinner>
      } @else if (data()) {
        <div class="stats-grid">
          <mat-card class="stat-card">
            <mat-icon>catching_pokemon</mat-icon>
            <div class="stat-info">
              <span class="stat-value">{{ data()!.registeredPokemon }}</span>
              <span class="stat-label">Registered</span>
            </div>
            <span class="stat-total">of {{ data()!.totalPokemon }} total</span>
          </mat-card>
          <mat-card class="stat-card">
            <mat-icon>home_work</mat-icon>
            <div class="stat-info">
              <span class="stat-value">{{ data()!.totalHouses }}</span>
              <span class="stat-label">Houses</span>
            </div>
            <span class="stat-total">{{ data()!.housesAtCapacity }} at capacity</span>
          </mat-card>
          <mat-card class="stat-card homeless">
            <mat-icon>night_shelter</mat-icon>
            <div class="stat-info">
              <span class="stat-value">{{ data()!.homelessPokemon }}</span>
              <span class="stat-label">Homeless</span>
            </div>
          </mat-card>
          <mat-card class="stat-card warning">
            <mat-icon>warning</mat-icon>
            <div class="stat-info">
              <span class="stat-value">{{ data()!.pokemonWithWarnings }}</span>
              <span class="stat-label">Warnings</span>
            </div>
          </mat-card>
        </div>
        <div class="quick-actions">
          <h2>Quick Actions</h2>
          <div class="action-buttons">
            <a mat-flat-button color="primary" routerLink="/pokedex"><mat-icon>catching_pokemon</mat-icon> Browse Pok&eacute;dex</a>
            <a mat-stroked-button color="primary" routerLink="/houses"><mat-icon>house</mat-icon> Manage Houses</a>
          </div>
        </div>
        @if (data()!.recentRegistrations.length > 0) {
          <div class="recent">
            <h2>Recent Registrations</h2>
            <div class="recent-list">
              @for (reg of data()!.recentRegistrations; track reg.id) {
                <mat-card class="recent-card">
                  <span class="reg-number">{{ reg.pokemonNumber }}</span>
                  <span class="reg-name">{{ reg.pokemonName }}</span>
                  @if (reg.homeless) {
                    <span class="reg-status homeless">Homeless</span>
                  } @else {
                    <span class="reg-status housed">{{ reg.houseName }}</span>
                  }
                </mat-card>
              }
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--spacing-md); margin-bottom: var(--spacing-xl); }
    .stat-card {
      display: flex; align-items: center; gap: var(--spacing-md); padding: var(--spacing-lg);
      mat-icon { font-size: 36px; width: 36px; height: 36px; color: var(--color-primary); }
    }
    .stat-card.homeless mat-icon { color: var(--color-warning); }
    .stat-card.warning mat-icon { color: var(--color-error); }
    .stat-info { display: flex; flex-direction: column; }
    .stat-value { font-size: var(--font-size-2xl); font-weight: 800; }
    .stat-label { font-size: var(--font-size-sm); color: var(--color-text-secondary); }
    .stat-total { margin-left: auto; font-size: var(--font-size-sm); color: var(--color-text-hint); }
    .quick-actions { margin-bottom: var(--spacing-xl); }
    .quick-actions h2, .recent h2 { font-size: var(--font-size-lg); margin-bottom: var(--spacing-md); }
    .action-buttons { display: flex; gap: var(--spacing-sm); flex-wrap: wrap; }
    .recent-list { display: flex; flex-direction: column; gap: var(--spacing-sm); }
    .recent-card { display: flex; align-items: center; gap: var(--spacing-md); padding: var(--spacing-md); }
    .reg-number { font-weight: 700; color: var(--color-text-secondary); width: 50px; }
    .reg-name { font-weight: 600; flex: 1; }
    .reg-status { font-size: var(--font-size-sm); padding: 2px 8px; border-radius: 12px; }
    .reg-status.homeless { background: var(--color-warning); color: white; }
    .reg-status.housed { background: var(--color-primary); color: white; }
  `]
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  loading = signal(true);
  data = signal<DashboardResponse | null>(null);

  ngOnInit() {
    this.dashboardService.getDashboard().subscribe({
      next: (data) => { this.data.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
