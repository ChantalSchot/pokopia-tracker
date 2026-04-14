import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '@core/auth/auth.service';

@Component({
  selector: 'app-reset-password',
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
            <h1>Set New Password</h1>
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>New Password</mat-label>
              <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="newPassword" autocomplete="new-password">
              <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword" [attr.aria-label]="hidePassword ? 'Show password' : 'Hide password'">
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-hint>Min 8 chars, 1 uppercase, 1 digit</mat-hint>
            </mat-form-field>
            <button mat-flat-button color="primary" type="submit" class="full-width submit-btn" [disabled]="loading">
              @if (loading) { <mat-spinner diameter="20"></mat-spinner> } @else { Reset Password }
            </button>
          </form>
        </mat-card-content>
        <mat-card-actions class="auth-actions">
          <a routerLink="/login">Back to sign in</a>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-wrapper { width: 100%; max-width: 420px; }
    .auth-card { padding: var(--spacing-lg); }
    mat-card-header { display: flex; justify-content: center; margin-bottom: var(--spacing-lg); }
    h1 { text-align: center; color: var(--color-primary); font-weight: 800; margin: 0; }
    .full-width { width: 100%; }
    .submit-btn { height: 48px; font-weight: 700; margin-top: var(--spacing-sm); }
    .auth-actions { display: flex; justify-content: center; padding-top: var(--spacing-md); }
  `]
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  form = this.fb.group({ newPassword: ['', [Validators.required, Validators.minLength(8)]] });
  hidePassword = true;
  loading = false;
  private token = '';

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) {
      this.snackBar.open('Invalid reset link', 'Close', { duration: 5000 });
      this.router.navigate(['/login']);
    }
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.authService.resetPassword({ token: this.token, newPassword: this.form.value.newPassword! }).subscribe({
      next: () => {
        this.snackBar.open('Password reset successful! Please sign in.', 'Close', { duration: 5000, panelClass: 'success-snackbar' });
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading = false;
        this.snackBar.open(err.error?.message || 'Reset failed', 'Close', { duration: 5000, panelClass: 'error-snackbar' });
      }
    });
  }
}
