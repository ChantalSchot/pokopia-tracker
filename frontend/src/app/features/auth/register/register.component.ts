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
  selector: 'app-register',
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
            <h1>Create Account</h1>
            <p class="subtitle">Join the Pokopia Tracker community</p>
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
              @if (form.get('username')?.hasError('minlength')) {
                <mat-error>Username must be at least 3 characters</mat-error>
              }
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email" autocomplete="email">
              @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
                <mat-error>Email is required</mat-error>
              }
              @if (form.get('email')?.hasError('email')) {
                <mat-error>Invalid email format</mat-error>
              }
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password" autocomplete="new-password">
              <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword" [attr.aria-label]="hidePassword ? 'Show password' : 'Hide password'">
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (form.get('password')?.hasError('required') && form.get('password')?.touched) {
                <mat-error>Password is required</mat-error>
              }
              @if (form.get('password')?.hasError('minlength')) {
                <mat-error>At least 8 characters</mat-error>
              }
              <mat-hint>Min 8 chars, 1 uppercase, 1 digit</mat-hint>
            </mat-form-field>
            <button mat-flat-button color="primary" type="submit" class="full-width submit-btn" [disabled]="loading">
              @if (loading) { <mat-spinner diameter="20"></mat-spinner> } @else { Create Account }
            </button>
          </form>
        </mat-card-content>
        <mat-card-actions class="auth-actions">
          <span>Already have an account? <a routerLink="/login">Sign in</a></span>
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
    .auth-actions { display: flex; justify-content: center; padding-top: var(--spacing-md); }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });
  hidePassword = true;
  loading = false;

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.authService.register(this.form.value as any).subscribe({
      next: () => {
        this.snackBar.open('Account created! Please sign in.', 'Close', { duration: 5000, panelClass: 'success-snackbar' });
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading = false;
        this.snackBar.open(err.error?.message || 'Registration failed', 'Close', { duration: 5000, panelClass: 'error-snackbar' });
      }
    });
  }
}
