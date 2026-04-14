import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-header">
      <h1>{{ title }}</h1>
      @if (subtitle) {
        <p class="subtitle">{{ subtitle }}</p>
      }
      <div class="header-actions">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex; align-items: center; flex-wrap: wrap; gap: var(--spacing-md);
      margin-bottom: var(--spacing-lg);
      h1 { font-size: var(--font-size-xl); font-weight: 800; color: var(--color-text-primary); margin: 0; }
    }
    .subtitle { color: var(--color-text-secondary); margin: 0; }
    .header-actions { margin-left: auto; display: flex; gap: var(--spacing-sm); }
  `]
})
export class PageHeaderComponent {
  @Input({ required: true }) title!: string;
  @Input() subtitle?: string;
}
