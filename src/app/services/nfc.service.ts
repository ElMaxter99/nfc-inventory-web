import { Injectable } from '@angular/core';

export type BestValueType = 'url' | 'text' | 'unknown';

export interface ScanResult {
  rawRecords: Array<{ recordType: string; mediaType?: string; data?: string }>;
  bestValue: string;
  bestValueType: BestValueType;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class NfcService {
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'NDEFReader' in window;
  }

  async scanOnce(): Promise<ScanResult> {
    if (!this.isSupported()) {
      throw new Error('Web NFC no está soportado en este dispositivo.');
    }

    const ndef = new NDEFReader();

    return new Promise<ScanResult>(async (resolve, reject) => {
      const handleReading = (event: NDEFReadingEvent) => {
        try {
          const { bestValue, bestValueType, rawRecords } = this.parseRecords(
            event.message.records
          );
          resolve({
            rawRecords,
            bestValue,
            bestValueType,
            timestamp: Date.now()
          });
        } catch (error) {
          reject(error);
        } finally {
          ndef.onreading = null;
          ndef.onreadingerror = null;
        }
      };

      const handleError = () => {
        reject(new Error('No se pudo leer la etiqueta NFC.'));
        ndef.onreading = null;
        ndef.onreadingerror = null;
      };

      ndef.onreading = handleReading;
      ndef.onreadingerror = handleError;

      try {
        await ndef.scan();
      } catch (error) {
        reject(new Error('Permiso NFC denegado o lectura cancelada.'));
      }
    });
  }

  async writeUrl(url: string): Promise<void> {
    if (!this.isSupported()) {
      throw new Error('Web NFC no está soportado en este dispositivo.');
    }

    const ndef = new NDEFReader();

    try {
      await ndef.write({
        records: [
          {
            recordType: 'url',
            data: url
          }
        ]
      });
    } catch (error) {
      throw new Error('No se pudo escribir la etiqueta.');
    }
  }

  private parseRecords(records: readonly NDEFRecord[]): {
    rawRecords: Array<{ recordType: string; mediaType?: string; data?: string }>;
    bestValue: string;
    bestValueType: BestValueType;
  } {
    const rawRecords = records.map((record) => ({
      recordType: record.recordType,
      mediaType: record.mediaType,
      data: this.decodeRecord(record)
    }));

    const urlRecord = records.find((record) => record.recordType === 'url');
    if (urlRecord) {
      return {
        rawRecords,
        bestValue: this.decodeRecord(urlRecord),
        bestValueType: 'url'
      };
    }

    const textRecord = records.find((record) => record.recordType === 'text');
    if (textRecord) {
      return {
        rawRecords,
        bestValue: this.decodeTextRecord(textRecord.data),
        bestValueType: 'text'
      };
    }

    const fallbackValue = rawRecords[0]?.data ?? '';

    return {
      rawRecords,
      bestValue: fallbackValue,
      bestValueType: 'unknown'
    };
  }

  private decodeRecord(record: NDEFRecord): string {
    if (record.recordType === 'text') {
      return this.decodeTextRecord(record.data);
    }

    return this.decodeData(record.data);
  }

  private decodeTextRecord(data: NDEFRecord['data']): string {
    if (!data) {
      return '';
    }

    if (typeof data === 'string') {
      return data;
    }

    const view = data instanceof DataView ? data : new DataView(data);
    const status = view.getUint8(0);
    const languageLength = status & 0x3f;
    const encoding = status & 0x80 ? 'utf-16' : 'utf-8';
    const textBytes = new Uint8Array(
      view.buffer,
      view.byteOffset + 1 + languageLength,
      view.byteLength - 1 - languageLength
    );

    return new TextDecoder(encoding).decode(textBytes);
  }

  private decodeData(data: NDEFRecord['data']): string {
    if (!data) {
      return '';
    }

    if (typeof data === 'string') {
      return data;
    }

    const view = data instanceof DataView ? data : new DataView(data);
    return new TextDecoder().decode(view);
  }
}
