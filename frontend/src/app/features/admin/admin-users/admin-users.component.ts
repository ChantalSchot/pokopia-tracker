import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdminService } from '@core/services/admin.service';
import { UserResponse } from '@core/models';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatPaginatorModule,
    MatSnackBarModule, LoadingSpinnerComponent, PageHeaderComponent
  ],
  template: `
    <div class="page-container">
      <app-page-header title="Users" subtitle="Manage user accounts"></app-page-header>
      @if (loading()) {
        <app-loading-spinner></app-loading-spinner>
      } @else {
        <table mat-table [dataSource]="users()" class="full-width">
          <ng-container matColumnDef="username">
            <th mat-header-cell *matHeaderCellDef>Username</th>
            <td mat-cell *matCellDef="let user">{{ user.username }}</td>
          </ng-container>
          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef>Email</th>
            <td mat-cell *matCellDef="let user">{{ user.email }}</td>
          </ng-container>
          <ng-container matColumnDef="roles">
            <th mat-header-cell *matHeaderCellDef>Roles</th>
            <td mat-cell *matCellDef="let user">{{ user.roles.join(', ') }}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let user">
              <button mat-icon-button color="warn" (click)="deleteUser(user)" aria-label="Delete user">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
        <mat-paginator [length]="totalElements()" [pageSize]="20" (page)="onPageChange($event)"></mat-paginator>
      }
    </div>
  `,
  styles: [`.full-width { width: 100%; }`]
})
export class AdminUsersComponent implements OnInit {
  private adminService = inject(AdminService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  users = signal<UserResponse[]>([]);
  loading = signal(true);
  totalElements = signal(0);
  displayedColumns = ['username', 'email', 'roles', 'actions'];

  ngOnInit() { this.loadUsers(); }

  loadUsers(page = 0) {
    this.loading.set(true);
    this.adminService.getUsers({ page, size: 20 }).subscribe({
      next: (res) => { this.users.set(res.content); this.totalElements.set(res.totalElements); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  deleteUser(user: UserResponse) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete User', message: `Delete user "${user.username}"?`, confirmText: 'Delete' }
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.adminService.deleteUser(user.id).subscribe({
          next: () => { this.snackBar.open('User deleted', 'Close', { duration: 3000 }); this.loadUsers(); },
          error: (err) => this.snackBar.open(err.error?.message || 'Failed', 'Close', { duration: 5000, panelClass: 'error-snackbar' })
        });
      }
    });
  }

  onPageChange(event: PageEvent) { this.loadUsers(event.pageIndex); }
}
