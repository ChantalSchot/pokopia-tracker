import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="empty-state" role="status">
      <mat-icon class="empty-icon">{{ icon }}</mat-icon>
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
    </div>
  `,
  styles: [`
    .empty-state {
      text-align: center; padding: var(--spacing-2xl);
      color: var(--color-text-secondary);
    }
    .empty-icon { font-size: 64px; width: 64px; height: 64px; opacity: 0.4; }
    h3 { margin: var(--spacing-md) 0 var(--spacing-sm); color: var(--color-text-primary); }
    p { max-width: 400px; margin: 0 auto; }
  `]
})
export class EmptyStateComponent {
  @Input() icon = 'inbox';
  @Input() title = 'Nothing here yet';
  @Input() message = '';
}
