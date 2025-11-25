import imageCompression from 'browser-image-compression';
import { removeBackground } from '@imgly/background-removal';
import { ProcessingSettings } from '../types';

// Helper to convert Blob to File
const blobToFile = (blob: Blob, fileName: string): File => {
  return new File([blob], fileName, { type: blob.type, lastModified: Date.now() });
};

export const processImage = async (file: File, settings: ProcessingSettings): Promise<Blob> => {
  if (settings.mode === 'remove-bg') {
    return await processBackgroundRemoval(file, settings);
  } else {
    return await processCompression(file, settings);
  }
};

const processCompression = async (file: File, settings: ProcessingSettings): Promise<File> => {
  const options = {
    maxSizeMB: settings.maxSizeMB || 2,
    maxWidthOrHeight: settings.maxWidthOrHeight,
    useWebWorker: settings.useWebWorker,
    initialQuality: settings.initialQuality,
    fileType: settings.fileType,
  };

  try {
    return await imageCompression(file, options);
  } catch (error) {
    console.error('Compression error:', error);
    throw error;
  }
};

const processBackgroundRemoval = async (file: File, settings: ProcessingSettings): Promise<Blob> => {
  try {
    // 1. Remove Background
    // publicPath is critical for loading WASM/ONNX assets from CDN in a client-side only build
    const blob = await removeBackground(file, {
      model: 'medium', 
      publicPath: 'https://static.img.ly/background-removal-data/1.7.0/dist/' 
    });

    // 2. Format Conversion (if needed)
    // imgly outputs PNG blob by default. 
    // If user wants JPEG (white background), we need canvas manipulation.
    let resultBlob = blob;

    if (settings.removeBgFormat === 'image/jpeg') {
       resultBlob = await convertToJpegWithWhiteBg(blob);
    }

    // 3. Optional Compression
    if (settings.compressResult) {
      const tempFile = blobToFile(resultBlob, file.name);
      // Use standard compression settings for the result
      resultBlob = await processCompression(tempFile, {
        ...settings,
        fileType: settings.removeBgFormat, // Ensure we compress to the target format
        maxSizeMB: 2, // Default standard
        initialQuality: 0.8
      });
    }

    return resultBlob;

  } catch (error) {
    console.error('Background removal error:', error);
    throw error;
  }
};

const convertToJpegWithWhiteBg = (pngBlob: Blob): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(pngBlob);
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Canvas context failed'));
        return;
      }
      
      // Fill white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw image
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url);
        if (blob) resolve(blob);
        else reject(new Error('Conversion failed'));
      }, 'image/jpeg', 0.9);
    };
    
    img.onerror = (e) => {
        URL.revokeObjectURL(url);
        reject(e);
    };
    
    img.src = url;
  });
};