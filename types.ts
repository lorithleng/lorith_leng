export enum CompressionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export type AppMode = 'compress' | 'remove-bg';
export type Language = 'en' | 'zh';

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
  maxWidthOrHeight?: number;
  useWebWorker: boolean;
  initialQuality: number;
  fileType?: string;
  // Resizing options
  resize: boolean;
  maxWidth?: number;
  maxHeight?: number;
}

export interface ProcessingSettings extends CompressionSettings {
  // Common
  mode: AppMode;
  
  // Background Removal Settings
  removeBgFormat: 'image/png' | 'image/jpeg'; // PNG (transparent) or JPG (white bg)
  compressResult: boolean; // Whether to compress after removing bg
}