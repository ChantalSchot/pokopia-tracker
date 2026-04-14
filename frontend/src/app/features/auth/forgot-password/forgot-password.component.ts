import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '@core/auth/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatSnackBarModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="auth-wrapper">
      <mat-card class="auth-card">
        <mat-card-header>
          <mat-card-title>
            <h1>Reset Password</h1>
            <p class="subtitle">Enter your email to receive a reset link</p>
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          @if (!submitted) {
            <form [formGroup]="form" (ngSubmit)="onSubmit()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email</mat-label>
                <input matInput formControlName="email" type="email">
              </mat-form-field>
              <button mat-flat-button color="primary" type="submit" class="full-width submit-btn" [disabled]="loading">
                @if (loading) { <mat-spinner diameter="20"></mat-spinner> } @else { Send Reset Link }
              </button>
            </form>
          } @else {
            <div class="success-message">
              <p>If an account with that email exists, a password reset link has been sent.</p>
            </div>
          }
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
    .subtitle { text-align: center; color: var(--color-text-secondary); margin-top: var(--spacing-xs); }
    .full-width { width: 100%; }
    .submit-btn { height: 48px; font-weight: 700; margin-top: var(--spacing-sm); }
    .auth-actions { display: flex; justify-content: center; padding-top: var(--spacing-md); }
    .success-message { text-align: center; padding: var(--spacing-lg); color: var(--color-success); }
  `]
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  form = this.fb.group({ email: ['', [Validators.required, Validators.email]] });
  loading = false;
  submitted = false;

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.authService.forgotPassword({ email: this.form.value.email! }).subscribe({
      next: () => { this.submitted = true; this.loading = false; },
      error: () => { this.submitted = true; this.loading = false; }
    });
  }
}
