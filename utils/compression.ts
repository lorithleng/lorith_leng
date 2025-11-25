import imageCompression from 'browser-image-compression';
import { CompressionSettings } from '../types';

export const compressImage = async (file: File, settings: CompressionSettings): Promise<File> => {
  const options = {
    maxSizeMB: settings.maxSizeMB || 2,
    maxWidthOrHeight: settings.maxWidthOrHeight, // undefined means keep original
    useWebWorker: settings.useWebWorker,
    initialQuality: settings.initialQuality,
    fileType: settings.fileType,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error('Compression error:', error);
    throw error;
  }
};