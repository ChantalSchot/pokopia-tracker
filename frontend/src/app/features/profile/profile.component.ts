import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { UserService } from '@core/services/user.service';
import { UserResponse } from '@core/models';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSnackBarModule, MatDividerModule, LoadingSpinnerComponent, PageHeaderComponent
  ],
  template: `
    <div class="page-container" style="max-width: 600px;">
      <app-page-header title="Profile" subtitle="Manage your account"></app-page-header>
      @if (loading()) {
        <app-loading-spinner></app-loading-spinner>
      } @else {
        <mat-card>
          <mat-card-content>
            <h3>Account Details</h3>
            <form [formGroup]="profileForm" (ngSubmit)="updateProfile()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Username</mat-label>
                <input matInput formControlName="username">
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email</mat-label>
                <input matInput formControlName="email" type="email">
              </mat-form-field>
              <button mat-flat-button color="primary" type="submit" [disabled]="profileForm.pristine">Save Changes</button>
            </form>
            <mat-divider style="margin: 24px 0;"></mat-divider>
            <h3>Change Password</h3>
            <form [formGroup]="passwordForm" (ngSubmit)="changePassword()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Current Password</mat-label>
                <input matInput type="password" formControlName="currentPassword">
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>New Password</mat-label>
                <input matInput type="password" formControlName="newPassword">
                <mat-hint>Min 8 chars, 1 uppercase, 1 digit</mat-hint>
              </mat-form-field>
              <button mat-flat-button color="primary" type="submit" [disabled]="passwordForm.invalid">Change Password</button>
            </form>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .full-width { width: 100%; }
    h3 { font-weight: 700; margin-bottom: var(--spacing-md); }
  `]
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);
  loading = signal(true);

  profileForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]]
  });

  passwordForm = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]]
  });

  ngOnInit() {
    this.userService.getProfile().subscribe({
      next: (user) => {
        this.profileForm.patchValue({ username: user.username, email: user.email });
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  updateProfile() {
    if (this.profileForm.invalid) return;
    this.userService.updateProfile(this.profileForm.value as any).subscribe({
      next: () => { this.snackBar.open('Profile updated', 'Close', { duration: 3000, panelClass: 'success-snackbar' }); this.profileForm.markAsPristine(); },
      error: (err) => this.snackBar.open(err.error?.message || 'Update failed', 'Close', { duration: 5000, panelClass: 'error-snackbar' })
    });
  }

  changePassword() {
    if (this.passwordForm.invalid) return;
    this.userService.changePassword(this.passwordForm.value as any).subscribe({
      next: () => { this.snackBar.open('Password changed', 'Close', { duration: 3000, panelClass: 'success-snackbar' }); this.passwordForm.reset(); },
      error: (err) => this.snackBar.open(err.error?.message || 'Change failed', 'Close', { duration: 5000, panelClass: 'error-snackbar' })
    });
  }
}
