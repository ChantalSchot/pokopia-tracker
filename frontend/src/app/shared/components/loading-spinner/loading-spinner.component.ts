import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="spinner-container" role="status" aria-label="Loading">
      <mat-spinner diameter="48"></mat-spinner>
    </div>
  `,
  styles: [`
    .spinner-container {
      display: flex; justify-content: center; align-items: center;
      padding: var(--spacing-2xl); width: 100%;
    }
  `]
})
export class LoadingSpinnerComponent {}
