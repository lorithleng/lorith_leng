
import { ProcessingSettings } from '../types';
import JSZip from 'jszip';

export const processPdf = async (file: File, settings: ProcessingSettings): Promise<Blob> => {
    
    if (settings.pdfMode === 'convert-to-image') {
        return await convertPdfToImages(file, settings);
    }

    // PDF Compression Simulation (as per previous version)
    // Note: True Client-side PDF compression is very difficult without heavy libraries (like ghostscript or pdf-lib+canvas).
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(file); 
        }, 1500);
    });
};

const convertPdfToImages = async (file: File, settings: ProcessingSettings): Promise<Blob> => {
    if (typeof pdfjsLib === 'undefined') {
        throw new Error("PDF.js library not loaded");
    }

    // Set worker source if needed (CDN version usually handles this if loaded via script tag)
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
       pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pageCount = pdf.numPages;
    const format = settings.pdfToImageFormat || 'image/jpeg';
    const blobs: Blob[] = [];

    for (let i = 1; i <= pageCount; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); // Scale 2.0 for better quality
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
            await page.render({ canvasContext: context, viewport: viewport }).promise;
            
            const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, format, 0.9));
            if (blob) blobs.push(blob);
        }
    }

    // If single page, return image blob
    if (blobs.length === 1) {
        return blobs[0];
    }

    // If multiple pages, return ZIP
    const zip = new JSZip();
    const ext = format === 'image/jpeg' ? 'jpg' : 'png';
    const baseName = file.name.replace(/\.pdf$/i, '');
    
    blobs.forEach((blob, index) => {
        zip.file(`${baseName}_page_${index + 1}.${ext}`, blob);
    });

    return (await zip.generateAsync({ type: "blob" })) as Blob;
};
