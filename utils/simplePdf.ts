
/**
 * A lightweight PDF generator that embeds a single image into a PDF file.
 * This avoids heavy external dependencies like jsPDF for simple image-to-pdf conversion.
 */

const getBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not load image'));
    };
    img.src = url;
  });
};

export const createPdfFromImage = async (imageFile: File): Promise<Blob> => {
  // 1. Get image data and dimensions
  // PDF needs dimensions in points (1 pt = 1/72 inch). 
  // Let's assume 72 DPI for simplicity or map pixels to points 1:1 for screen viewing.
  // Standard A4 is 595.28 x 841.89 points.
  // We will make the page size match the image size for best viewing, 
  // or fit to A4 if we wanted to be strict. Let's fit to image size.
  
  const { width, height } = await getImageDimensions(imageFile);
  
  // We need to convert the image to JPEG if it's not already, 
  // because embedding raw PNGs manually in PDF is complex (requires zlib compression for IDAT chunks).
  // JPEG is natively supported in PDF filters (DCTDecode).
  let processBlob = imageFile;
  let isJpeg = imageFile.type === 'image/jpeg' || imageFile.type === 'image/jpg';

  if (!isJpeg) {
     // Convert to JPEG for easier embedding
     const canvas = document.createElement('canvas');
     canvas.width = width;
     canvas.height = height;
     const ctx = canvas.getContext('2d');
     if (!ctx) throw new Error("Canvas context failed");
     
     const img = await createImageBitmap(imageFile);
     
     // Draw white background for transparency handling
     ctx.fillStyle = '#FFFFFF';
     ctx.fillRect(0, 0, width, height);
     ctx.drawImage(img, 0, 0);
     img.close();
     
     const jpegBlob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95));
     if (!jpegBlob) throw new Error("Conversion failed");
     processBlob = new File([jpegBlob], "temp.jpg", { type: 'image/jpeg' });
  }

  const base64Data = await getBase64(processBlob);
  
  // PDF Construction
  // Objects:
  // 1. Catalog
  // 2. Page Tree
  // 3. Page
  // 4. Content Stream (Draw Image)
  // 5. Image XObject
  
  const objects: string[] = [];
  const offsets: number[] = [];
  
  const addObj = (content: string) => {
    offsets.push(pdfBody.length);
    objects.push(content);
    pdfBody += `${objects.length} 0 obj\n${content}\nendobj\n`;
  };

  let pdfBody = `%PDF-1.4\n`;

  // 1. Catalog
  addObj(`<< /Type /Catalog /Pages 2 0 R >>`);

  // 2. Page Tree
  addObj(`<< /Type /Pages /Kids [3 0 R] /Count 1 >>`);

  // 3. Page
  addObj(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /XObject << /Img1 5 0 R >> >> /Contents 4 0 R >>`);

  // 4. Content Stream
  // q = save state, w h 0 0 cm = scale to image size, /Img1 Do = draw image, Q = restore state
  const streamData = `q ${width} 0 0 ${height} 0 0 cm /Img1 Do Q`;
  addObj(`<< /Length ${streamData.length} >>\nstream\n${streamData}\nendstream`);

  // 5. Image XObject
  addObj(`<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${base64Data.length} >>\nstream\n${atob(base64Data)}\nendstream`);

  // XRef Table
  const xrefOffset = pdfBody.length;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  
  offsets.forEach(offset => {
    xref += `${offset.toString().padStart(10, '0')} 00000 n \n`;
  });

  // Trailer
  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  const pdfString = pdfBody + xref + trailer;

  // Convert string to Uint8Array
  const buffer = new Uint8Array(pdfString.length);
  for (let i = 0; i < pdfString.length; i++) {
    buffer[i] = pdfString.charCodeAt(i);
  }

  return new Blob([buffer], { type: 'application/pdf' });
};
