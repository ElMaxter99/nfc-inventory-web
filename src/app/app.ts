import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  protected readonly env = signal(environment);
  protected readonly envLabel = computed(() => this.env().appEnvName.toUpperCase());
  protected readonly isSecureContext = computed(() =>
    typeof window !== 'undefined' ? window.isSecureContext : false
  );
}
