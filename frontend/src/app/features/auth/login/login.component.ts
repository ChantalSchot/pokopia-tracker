import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '@core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSnackBarModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="auth-wrapper">
      <mat-card class="auth-card">
        <mat-card-header>
          <mat-card-title>
            <h1>Pokopia Tracker</h1>
            <p class="subtitle">Sign in to your account</p>
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Username</mat-label>
              <input matInput formControlName="username" autocomplete="username">
              @if (form.get('username')?.hasError('required') && form.get('username')?.touched) {
                <mat-error>Username is required</mat-error>
              }
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password" autocomplete="current-password">
              <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword" [attr.aria-label]="hidePassword ? 'Show password' : 'Hide password'">
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (form.get('password')?.hasError('required') && form.get('password')?.touched) {
                <mat-error>Password is required</mat-error>
              }
            </mat-form-field>
            <button mat-flat-button color="primary" type="submit" class="full-width submit-btn" [disabled]="loading">
              @if (loading) { <mat-spinner diameter="20"></mat-spinner> } @else { Sign In }
            </button>
          </form>
        </mat-card-content>
        <mat-card-actions class="auth-actions">
          <a routerLink="/forgot-password">Forgot password?</a>
          <span>Don't have an account? <a routerLink="/register">Sign up</a></span>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-wrapper { width: 100%; max-width: 420px; }
    .auth-card { padding: var(--spacing-lg); }
    mat-card-header { display: flex; justify-content: center; margin-bottom: var(--spacing-lg); }
    h1 { text-align: center; color: var(--color-primary); font-weight: 800; margin: 0; }
    .subtitle { text-align: center; color: var(--color-text-secondary); margin-top: var(--spacing-xs); }
    .full-width { width: 100%; }
    .submit-btn { height: 48px; font-size: var(--font-size-md); font-weight: 700; margin-top: var(--spacing-sm); }
    .auth-actions { display: flex; flex-direction: column; align-items: center; gap: var(--spacing-sm); padding-top: var(--spacing-md); }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });
  hidePassword = true;
  loading = false;

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.authService.login(this.form.value as any).subscribe({
      next: () => { this.router.navigate(['/dashboard']); },
      error: (err) => {
        this.loading = false;
        this.snackBar.open(err.error?.message || 'Login failed', 'Close', { duration: 5000, panelClass: 'error-snackbar' });
      }
    });
  }
}
