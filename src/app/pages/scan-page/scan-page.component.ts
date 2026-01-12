import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { environment } from '../../../environments/environment';
import { NfcService, ScanResult } from '../../services/nfc.service';
import { buildDestinationUrl, isValidUrl } from '../../utils/url.utils';

@Component({
  selector: 'app-scan-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './scan-page.component.html',
  styleUrl: './scan-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScanPageComponent {
  protected readonly isSupported = signal(false);
  protected readonly isSecureContext = signal(
    typeof window !== 'undefined' ? window.isSecureContext : false
  );
  protected readonly statusMessage = signal('Listo para escanear');
  protected readonly errorMessage = signal('');
  protected readonly isScanning = signal(false);
  protected readonly scanResult = signal<ScanResult | null>(null);
  protected readonly manualUrl = signal('');
  protected readonly manualError = signal('');

  protected readonly destinationUrl = computed(() => {
    const result = this.scanResult();
    if (!result?.bestValue) {
      return environment.defaultRedirectUrl;
    }
    return buildDestinationUrl(result.bestValue, environment.defaultRedirectUrl);
  });

  protected readonly hasDestination = computed(() => Boolean(this.destinationUrl()));

  constructor(private readonly nfcService: NfcService) {
    this.isSupported.set(this.nfcService.isSupported());
  }

  async startScan(): Promise<void> {
    this.errorMessage.set('');
    this.scanResult.set(null);

    if (!this.isSecureContext()) {
      this.errorMessage.set('Necesitas HTTPS o localhost para usar Web NFC.');
      this.statusMessage.set('No soportado');
      return;
    }

    if (!this.isSupported()) {
      this.errorMessage.set('Web NFC no está disponible en este navegador.');
      this.statusMessage.set('No soportado');
      return;
    }

    this.statusMessage.set('Acerca el móvil a la etiqueta');
    this.isScanning.set(true);

    try {
      const result = await this.nfcService.scanOnce();
      this.scanResult.set(result);
      this.statusMessage.set('Leído');
      this.vibrate();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error leyendo NFC.';
      this.errorMessage.set(message);
      this.statusMessage.set('Listo para escanear');
    } finally {
      this.isScanning.set(false);
    }
  }

  openDestination(): void {
    const target = this.destinationUrl();
    if (!target) {
      return;
    }
    window.open(target, '_blank', 'noopener');
  }

  openManualUrl(): void {
    const url = this.manualUrl().trim();
    this.manualError.set('');

    if (!isValidUrl(url)) {
      this.manualError.set('Introduce una URL válida.');
      return;
    }

    window.open(url, '_blank', 'noopener');
  }

  private vibrate(): void {
    if ('vibrate' in navigator) {
      navigator.vibrate(120);
    }
  }
}
