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
  const options: any = {
    maxSizeMB: settings.maxSizeMB || 2,
    useWebWorker: settings.useWebWorker,
    initialQuality: settings.initialQuality,
    fileType: settings.fileType,
  };

  // Resizing logic
  if (settings.resize && (settings.maxWidth || settings.maxHeight)) {
     try {
        const bmp = await createImageBitmap(file);
        const originalWidth = bmp.width;
        const originalHeight = bmp.height;
        bmp.close();

        let scale = 1;
        
        // Calculate scale for width
        if (settings.maxWidth && originalWidth > settings.maxWidth) {
           scale = Math.min(scale, settings.maxWidth / originalWidth);
        }

        // Calculate scale for height (and keep aspect ratio if both are set)
        if (settings.maxHeight && originalHeight > settings.maxHeight) {
           scale = Math.min(scale, settings.maxHeight / originalHeight);
        }

        // Apply scale if needed
        if (scale < 1) {
           const newWidth = originalWidth * scale;
           const newHeight = originalHeight * scale;
           
           // browser-image-compression uses `maxWidthOrHeight` as the constraint for the longest edge.
           // However, if we know specific target dimensions, we can trick it or just use the largest dimension 
           // of the NEW target size to ensure it fits.
           options.maxWidthOrHeight = Math.max(newWidth, newHeight);
        }
     } catch (e) {
        console.warn("Could not calculate dimensions for resize, skipping resize step.", e);
     }
  }

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
        initialQuality: 0.8,
        resize: false // Don't resize result of BG removal unless explicitly requested, but usually keep original logic here
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