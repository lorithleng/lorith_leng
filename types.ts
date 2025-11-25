export enum CompressionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export interface CompressedImage {
  id: string;
  originalFile: File;
  compressedBlob: Blob | null;
  status: CompressionStatus;
  originalSize: number;
  compressedSize: number;
  previewUrl: string;
  error?: string;
  progress: number;
}

export interface CompressionSettings {
  maxSizeMB: number;
  maxWidthOrHeight?: number; // Optional, usually undefined to keep dimensions
  useWebWorker: boolean;
  initialQuality: number; // 0 to 1
  fileType?: string; // e.g., 'image/webp'
}