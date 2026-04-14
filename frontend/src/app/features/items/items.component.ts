import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { ItemService } from '@core/services/item.service';
import { ItemResponse, ITEM_TYPES } from '@core/models';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { environment } from '@env';

@Component({
  selector: 'app-items',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatPaginatorModule, MatIconModule, MatButtonModule, MatChipsModule,
    LoadingSpinnerComponent, EmptyStateComponent, PageHeaderComponent
  ],
  template: `
    <div class="page-container">
      <app-page-header title="Items" subtitle="Browse all items"></app-page-header>
      <div class="content-layout">
        <div class="main-content">
          @if (loading()) {
            <app-loading-spinner></app-loading-spinner>
          } @else if (items().length === 0) {
            <app-empty-state icon="inventory_2" title="No items found" message="Try adjusting your filters"></app-empty-state>
          } @else {
            <div class="card-grid">
              @for (item of items(); track item.id) {
                <mat-card class="item-card" role="article" [attr.aria-label]="item.name">
                  <div class="item-image">
                    <img [src]="getImageUrl(item.imagePath)" [alt]="item.name" loading="lazy" (error)="onImageError($event)">
                  </div>
                  <mat-card-content>
                    <h3>{{ item.name }}</h3>
                    @if (item.type && item.type !== 'None') {
                      <span class="type-badge">{{ item.type }}</span>
                    }
                    @if (item.category) {
                      <span class="category">{{ item.category }}</span>
                    }
                    @if (item.favourites && item.favourites.length > 0) {
                      <div class="fav-chips">
                        @for (fav of item.favourites; track fav.id) {
                          <mat-chip>{{ fav.name }}</mat-chip>
                        }
                      </div>
                    }
                  </mat-card-content>
                </mat-card>
              }
            </div>
            <mat-paginator [length]="totalElements()" [pageSize]="pageSize" [pageSizeOptions]="[20, 40, 60]"
              (page)="onPageChange($event)" aria-label="Items pagination"></mat-paginator>
          }
        </div>
        <aside class="filter-sidebar" role="search" aria-label="Item filters">
          <h3>Filters</h3>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Search name</mat-label>
            <input matInput [(ngModel)]="filters.name" (keyup.enter)="loadItems()">
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Type</mat-label>
            <mat-select [(ngModel)]="filters.type" (selectionChange)="loadItems()">
              <mat-option [value]="''">All</mat-option>
              @for (t of itemTypes; track t) {
                <mat-option [value]="t">{{ t }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Category</mat-label>
            <input matInput [(ngModel)]="filters.category" (keyup.enter)="loadItems()">
          </mat-form-field>
          <button mat-stroked-button (click)="clearFilters()">Clear Filters</button>
        </aside>
      </div>
    </div>
  `,
  styles: [`
    .content-layout { display: flex; gap: var(--spacing-lg); }
    .main-content { flex: 1; min-width: 0; }
    .filter-sidebar { width: var(--sidebar-width); flex-shrink: 0; position: sticky; top: 80px; align-self: flex-start; h3 { margin-bottom: var(--spacing-md); } }
    .full-width { width: 100%; }
    .item-card { .item-image { text-align: center; padding: var(--spacing-sm); img { width: 64px; height: 64px; object-fit: contain; } } }
    h3 { font-weight: 700; font-size: var(--font-size-sm); text-align: center; margin-bottom: var(--spacing-xs); }
    .type-badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; background: var(--color-primary); color: white; }
    .category { display: block; font-size: var(--font-size-xs); color: var(--color-text-secondary); text-align: center; }
    .fav-chips { display: flex; gap: 4px; flex-wrap: wrap; margin-top: var(--spacing-xs); justify-content: center; }
    @media (max-width: 1024px) { .content-layout { flex-direction: column-reverse; } .filter-sidebar { width: 100%; position: static; } }
  `]
})
export class ItemsComponent implements OnInit {
  private itemService = inject(ItemService);
  items = signal<ItemResponse[]>([]);
  loading = signal(true);
  totalElements = signal(0);
  pageSize = 20;
  page = 0;
  itemTypes = [...ITEM_TYPES];
  filters: any = { name: '', type: '', category: '' };

  ngOnInit() { this.loadItems(); }

  loadItems() {
    this.loading.set(true);
    this.itemService.getAll({ ...this.filters, page: this.page, size: this.pageSize, sort: 'name' }).subscribe({
      next: (res) => { this.items.set(res.content); this.totalElements.set(res.totalElements); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  getImageUrl(path: string): string { return path ? `${environment.apiUrl}/${path}` : ''; }
  onImageError(event: Event) { (event.target as HTMLImageElement).style.display = 'none'; }
  onPageChange(event: PageEvent) { this.page = event.pageIndex; this.pageSize = event.pageSize; this.loadItems(); }
  clearFilters() { this.filters = { name: '', type: '', category: '' }; this.page = 0; this.loadItems(); }
}
