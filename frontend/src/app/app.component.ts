import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterLink, RouterLinkActive,
    MatToolbarModule, MatButtonModule, MatIconModule,
    MatSidenavModule, MatListModule, MatMenuModule, MatDividerModule
  ],
  template: `
    @if (authService.isLoggedIn()) {
      <mat-sidenav-container class="app-container">
        <mat-sidenav #sidenav [mode]="isMobile() ? 'over' : 'side'"
                     [opened]="!isMobile()"
                     class="app-sidenav"
                     role="navigation"
                     aria-label="Main navigation">
          <div class="sidenav-header">
            <h2>Pokopia Tracker</h2>
          </div>
          <mat-nav-list>
            <a mat-list-item routerLink="/dashboard" routerLinkActive="active" (click)="isMobile() && sidenav.close()">
              <mat-icon matListItemIcon>dashboard</mat-icon>
              <span matListItemTitle>Dashboard</span>
            </a>
            <a mat-list-item routerLink="/pokedex" routerLinkActive="active" (click)="isMobile() && sidenav.close()">
              <mat-icon matListItemIcon>catching_pokemon</mat-icon>
              <span matListItemTitle>Pok&eacute;dex</span>
            </a>
            <a mat-list-item routerLink="/houses" routerLinkActive="active" (click)="isMobile() && sidenav.close()">
              <mat-icon matListItemIcon>house</mat-icon>
              <span matListItemTitle>Houses</span>
            </a>
            <a mat-list-item routerLink="/items" routerLinkActive="active" (click)="isMobile() && sidenav.close()">
              <mat-icon matListItemIcon>inventory_2</mat-icon>
              <span matListItemTitle>Items</span>
            </a>
            <a mat-list-item routerLink="/habitats" routerLinkActive="active" (click)="isMobile() && sidenav.close()">
              <mat-icon matListItemIcon>park</mat-icon>
              <span matListItemTitle>Habitats</span>
            </a>
            @if (authService.isAdmin()) {
              <mat-divider></mat-divider>
              <div class="section-label">Admin</div>
              <a mat-list-item routerLink="/admin/users" routerLinkActive="active" (click)="isMobile() && sidenav.close()">
                <mat-icon matListItemIcon>people</mat-icon>
                <span matListItemTitle>Users</span>
              </a>
              <a mat-list-item routerLink="/admin/import" routerLinkActive="active" (click)="isMobile() && sidenav.close()">
                <mat-icon matListItemIcon>upload</mat-icon>
                <span matListItemTitle>Import</span>
              </a>
            }
          </mat-nav-list>
        </mat-sidenav>

        <mat-sidenav-content>
          <mat-toolbar color="primary" class="app-toolbar">
            @if (isMobile()) {
              <button mat-icon-button (click)="sidenav.toggle()" aria-label="Toggle navigation menu">
                <mat-icon>menu</mat-icon>
              </button>
            }
            <span class="toolbar-spacer"></span>
            <button mat-icon-button [matMenuTriggerFor]="userMenu" aria-label="User menu">
              <mat-icon>account_circle</mat-icon>
            </button>
            <mat-menu #userMenu="matMenu">
              <div class="menu-header" mat-menu-item disabled>{{ authService.username() }}</div>
              <a mat-menu-item routerLink="/profile">
                <mat-icon>person</mat-icon>
                <span>Profile</span>
              </a>
              <button mat-menu-item (click)="onLogout()">
                <mat-icon>logout</mat-icon>
                <span>Logout</span>
              </button>
            </mat-menu>
          </mat-toolbar>
          <main class="app-content" role="main">
            <router-outlet></router-outlet>
          </main>
        </mat-sidenav-content>
      </mat-sidenav-container>
    } @else {
      <main class="auth-container" role="main">
        <router-outlet></router-outlet>
      </main>
    }
  `,
  styles: [`
    .app-container {
      height: 100vh;
    }
    .app-sidenav {
      width: 240px;
      background: var(--color-surface);
      border-right: 1px solid var(--color-border);
    }
    .sidenav-header {
      padding: var(--spacing-lg);
      text-align: center;
      h2 {
        color: var(--color-primary);
        font-weight: 800;
        font-size: var(--font-size-lg);
        margin: 0;
      }
    }
    .section-label {
      padding: var(--spacing-sm) var(--spacing-md);
      font-size: var(--font-size-xs);
      font-weight: 700;
      text-transform: uppercase;
      color: var(--color-text-secondary);
      letter-spacing: 0.5px;
    }
    .active {
      background-color: var(--color-surface-variant) !important;
      color: var(--color-primary) !important;
    }
    .app-toolbar {
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .toolbar-spacer {
      flex: 1;
    }
    .app-content {
      padding: var(--spacing-lg);
      min-height: calc(100vh - 64px);
    }
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--color-background);
    }
    .menu-header {
      font-weight: 700;
      opacity: 0.7;
    }
  `]
})
export class AppComponent implements OnInit {
  authService = inject(AuthService);
  private breakpointObserver = inject(BreakpointObserver);
  private router = inject(Router);
  isMobile = signal(false);

  ngOnInit() {
    this.breakpointObserver.observe([Breakpoints.Handset])
      .subscribe(result => this.isMobile.set(result.matches));
  }

  onLogout() {
    this.authService.logout().subscribe();
  }
}
