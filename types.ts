
export enum CompressionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export type AppCategory = 'image' | 'pdf';
export type AppMode = 'compress' | 'remove-bg' | 'convert';
export type PdfMode = 'compress' | 'convert-to-image' | 'split' | 'unlock' | 'edit' | 'annotate';

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
  category: AppCategory;
  
  // Image Modes
  mode: AppMode;
  
  // PDF Modes
  pdfMode: PdfMode;

  // Background Removal Settings
  removeBgFormat: 'image/png' | 'image/jpeg'; // PNG (transparent) or JPG (white bg)
  compressResult: boolean; // Whether to compress after removing bg

  // Format Conversion Settings
  convertFormat?: string;
  
  // PDF Settings
  pdfQuality: number; // 0.1 - 1.0
  pdfToImageFormat: 'image/jpeg' | 'image/png';
  
  // PDF New Features
  pdfSplitRange: string; // "1-5", "1,3,5"
  pdfPassword?: string;
  pdfRotation: 0 | 90 | 180 | 270;
  pdfWatermarkText: string;
}