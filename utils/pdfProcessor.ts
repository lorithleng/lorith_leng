
import { ProcessingSettings } from '../types';
import JSZip from 'jszip';

export const processPdf = async (file: File, settings: ProcessingSettings): Promise<Blob> => {
    
    switch (settings.pdfMode) {
        case 'convert-to-image':
            return await convertPdfToImages(file, settings);
        case 'split':
            return await splitPdf(file, settings);
        case 'unlock':
            return await unlockPdf(file, settings);
        case 'edit':
            return await rotatePdf(file, settings);
        case 'annotate':
            return await watermarkPdf(file, settings);
        case 'compress':
        default:
            // PDF Compression Simulation (as before)
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(file); 
                }, 1500);
            });
    }
};

const convertPdfToImages = async (file: File, settings: ProcessingSettings): Promise<Blob> => {
    if (typeof pdfjsLib === 'undefined') {
        throw new Error("PDF.js library not loaded");
    }

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
        const viewport = page.getViewport({ scale: 2.0 });
        
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

    if (blobs.length === 1) {
        return blobs[0];
    }

    const zip = new JSZip();
    const ext = format === 'image/jpeg' ? 'jpg' : 'png';
    const baseName = file.name.replace(/\.pdf$/i, '');
    
    blobs.forEach((blob, index) => {
        zip.file(`${baseName}_page_${index + 1}.${ext}`, blob);
    });

    return (await zip.generateAsync({ type: "blob" })) as Blob;
};

// Helper: Parse range string "1-3, 5" -> [0, 1, 2, 4]
const parseRange = (rangeStr: string, totalPages: number): number[] => {
    const pages = new Set<number>();
    const parts = rangeStr.split(',');
    
    parts.forEach(part => {
        const trimmed = part.trim();
        if (trimmed.includes('-')) {
            const [start, end] = trimmed.split('-').map(n => parseInt(n));
            if (!isNaN(start) && !isNaN(end)) {
                for (let i = start; i <= end; i++) {
                    if (i >= 1 && i <= totalPages) pages.add(i - 1);
                }
            }
        } else {
            const num = parseInt(trimmed);
            if (!isNaN(num) && num >= 1 && num <= totalPages) {
                pages.add(num - 1);
            }
        }
    });
    return Array.from(pages).sort((a, b) => a - b);
};

const splitPdf = async (file: File, settings: ProcessingSettings): Promise<Blob> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
    const totalPages = pdfDoc.getPageCount();
    
    const pageIndices = parseRange(settings.pdfSplitRange, totalPages);
    
    if (pageIndices.length === 0) throw new Error("Invalid page range");

    const newPdf = await PDFLib.PDFDocument.create();
    const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
    
    copiedPages.forEach((page: any) => newPdf.addPage(page));
    
    const pdfBytes = await newPdf.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
};

const unlockPdf = async (file: File, settings: ProcessingSettings): Promise<Blob> => {
    const arrayBuffer = await file.arrayBuffer();
    // Providing the password handles decryption.
    // Saving it without encrypting creates an unlocked PDF.
    try {
        const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer, { 
            password: settings.pdfPassword 
        });
        const pdfBytes = await pdfDoc.save();
        return new Blob([pdfBytes], { type: 'application/pdf' });
    } catch (e) {
        throw new Error("Incorrect password or corrupt file");
    }
};

const rotatePdf = async (file: File, settings: ProcessingSettings): Promise<Blob> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();
    const rotation = settings.pdfRotation || 0;
    
    pages.forEach((page: any) => {
        const currentRotation = page.getRotation().angle;
        page.setRotation(PDFLib.degrees(currentRotation + rotation));
    });
    
    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
};

const watermarkPdf = async (file: File, settings: ProcessingSettings): Promise<Blob> => {
    if (!settings.pdfWatermarkText) return file;

    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();
    const { width, height } = pages[0].getSize();
    
    const font = await pdfDoc.embedFont(PDFLib.StandardFonts.HelveticaBold);
    const fontSize = 50;
    const text = settings.pdfWatermarkText;
    
    // Simple centering logic
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    const textHeight = font.heightAtSize(fontSize);

    pages.forEach((page: any) => {
        page.drawText(text, {
            x: width / 2 - textWidth / 2,
            y: height / 2 - textHeight / 2,
            size: fontSize,
            font: font,
            color: PDFLib.rgb(0.7, 0.7, 0.7),
            opacity: 0.5,
            rotate: PDFLib.degrees(45),
        });
    });

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
};
