interface NDEFRecord {
  recordType: string;
  mediaType?: string;
  data?: DataView | ArrayBuffer | string;
}

interface NDEFMessage {
  records: NDEFRecord[];
}

interface NDEFReadingEvent extends Event {
  message: NDEFMessage;
  serialNumber: string;
}

interface NDEFRecordInit {
  recordType: string;
  mediaType?: string;
  data?: ArrayBuffer | DataView | string;
}

interface NDEFMessageInit {
  records: NDEFRecordInit[];
}

interface NDEFReader {
  onreading: ((event: NDEFReadingEvent) => void) | null;
  onreadingerror: ((event: Event) => void) | null;
  scan(options?: { signal?: AbortSignal }): Promise<void>;
  write(message: NDEFMessageInit | NDEFRecordInit[] | string): Promise<void>;
}

declare var NDEFReader: {
  prototype: NDEFReader;
  new (): NDEFReader;
};
