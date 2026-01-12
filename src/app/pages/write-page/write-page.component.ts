import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NfcService } from '../../services/nfc.service';
import { isValidUrl } from '../../utils/url.utils';

@Component({
  selector: 'app-write-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './write-page.component.html',
  styleUrl: './write-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WritePageComponent {
  protected readonly isSupported = signal(false);
  protected readonly isSecureContext = signal(
    typeof window !== 'undefined' ? window.isSecureContext : false
  );
  protected readonly statusMessage = signal('Listo para escribir');
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly urlValue = signal('');
  protected readonly canWrite = computed(() => this.isSupported() && this.isSecureContext());

  constructor(private readonly nfcService: NfcService) {
    this.isSupported.set(this.nfcService.isSupported());
  }

  async writeTag(): Promise<void> {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (!this.isSecureContext()) {
      this.errorMessage.set('Necesitas HTTPS o localhost para escribir NFC.');
      this.statusMessage.set('No soportado');
      return;
    }

    if (!this.isSupported()) {
      this.errorMessage.set('Web NFC no está disponible en este navegador.');
      this.statusMessage.set('No soportado');
      return;
    }

    const url = this.urlValue().trim();
    if (!isValidUrl(url)) {
      this.errorMessage.set('Introduce una URL válida.');
      return;
    }

    this.statusMessage.set('Acerca el móvil a la etiqueta');

    try {
      await this.nfcService.writeUrl(url);
      this.statusMessage.set('Escritura completada');
      this.successMessage.set('Etiqueta programada correctamente.');
      this.vibrate();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error escribiendo NFC.';
      this.errorMessage.set(message);
      this.statusMessage.set('Listo para escribir');
    }
  }

  private vibrate(): void {
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
  }
}
