
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Download, Trash2, Zap, Scissors, RefreshCw, FileText, Images } from 'lucide-react';
import JSZip from 'jszip';

import DropZone from './components/DropZone';
import SettingsPanel from './components/SettingsPanel';
import ImageItem from './components/ImageItem';
import { processImage } from './utils/processor';
import { processPdf } from './utils/pdfProcessor';
import { formatFileSize, calculateSavings } from './utils/formatters';
import { downloadFile } from './utils/download';
import { CompressedImage, CompressionStatus, ProcessingSettings, Language, AppCategory } from './types';
import { t } from './utils/translations';

// Simple ID generator
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

const App: React.FC = () => {
  const [images, setImages] = useState<CompressedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lang, setLang] = useState<Language>('zh'); // Default to Chinese
  
  const [settings, setSettings] = useState<ProcessingSettings>({
    category: 'image',
    mode: 'compress',
    pdfMode: 'compress',
    
    // Compression Defaults
    maxSizeMB: 2,
    useWebWorker: true,
    initialQuality: 0.8,
    fileType: undefined,
    // Resize Defaults
    resize: false,
    maxWidth: 1920,
    maxHeight: 1080,
    // BG Removal Defaults
    removeBgFormat: 'image/png',
    compressResult: false,
    // Convert Defaults
    convertFormat: 'image/jpeg',
    // PDF Defaults
    pdfQuality: 0.8,
    pdfToImageFormat: 'image/jpeg',
  });

  const handleCategoryChange = (cat: AppCategory) => {
      // Clear files when switching context to avoid mixing types incorrectly
      if (images.length > 0) {
          if (confirm(lang === 'en' ? "Switching categories will clear current list. Continue?" : "切换分类将清空当前列表，是否继续？")) {
             handleClearAll();
             setSettings(prev => ({ ...prev, category: cat }));
          }
      } else {
          setSettings(prev => ({ ...prev, category: cat }));
      }
  };

  // Derived stats
  const completedImages = useMemo(() => images.filter(img => img.status === CompressionStatus.COMPLETED), [images]);
  const totalOriginalSize = useMemo(() => completedImages.reduce((acc, img) => acc + img.originalSize, 0), [completedImages]);
  const totalCompressedSize = useMemo(() => completedImages.reduce((acc, img) => acc + img.compressedSize, 0), [completedImages]);
  const totalSavings = totalOriginalSize > 0 ? calculateSavings(totalOriginalSize, totalCompressedSize) : '0%';
  const hasPending = useMemo(() => images.some(img => img.status === CompressionStatus.PENDING), [images]);

  // Progress stats
  const processedCount = useMemo(() => images.filter(img => 
    img.status === CompressionStatus.COMPLETED || img.status === CompressionStatus.ERROR
  ).length, [images]);

  const progressPercentage = useMemo(() => {
    if (images.length === 0) return 0;
    return Math.round((processedCount / images.length) * 100);
  }, [images.length, processedCount]);

  // Handle adding files
  const handleFilesAdded = useCallback((files: File[]) => {
    const newImages: CompressedImage[] = files.map(file => ({
      id: generateId(),
      originalFile: file,
      compressedBlob: null,
      status: CompressionStatus.PENDING,
      originalSize: file.size,
      compressedSize: 0,
      previewUrl: file.type === 'application/pdf' ? '' : URL.createObjectURL(file),
      progress: 0,
    }));
    setImages(prev => [...prev, ...newImages]);
  }, []);

  // Process Queue Effect
  useEffect(() => {
    const processQueue = async () => {
      const pendingImage = images.find(img => img.status === CompressionStatus.PENDING);
      
      if (!pendingImage) return;

      setIsProcessing(true);

      // Mark as processing
      setImages(prev => prev.map(img => 
        img.id === pendingImage.id ? { ...img, status: CompressionStatus.PROCESSING } : img
      ));

      try {
        let resultBlob: Blob;
        
        if (settings.category === 'pdf') {
             resultBlob = await processPdf(pendingImage.originalFile, settings);
        } else {
             resultBlob = await processImage(pendingImage.originalFile, settings);
        }
        
        // Check if result is a ZIP (for multi-page PDF to Image)
        const isZip = resultBlob.type === 'application/zip' || (resultBlob.size > 0 && settings.category === 'pdf' && settings.pdfMode === 'convert-to-image');

        setImages(prev => prev.map(img => 
          img.id === pendingImage.id ? {
            ...img,
            status: CompressionStatus.COMPLETED,
            compressedBlob: resultBlob,
            compressedSize: resultBlob.size,
            // Update preview only if it's an image
            previewUrl: settings.category !== 'pdf' && !isZip ? URL.createObjectURL(resultBlob) : ''
          } : img
        ));
      } catch (error) {
        console.error(error);
        setImages(prev => prev.map(img => 
          img.id === pendingImage.id ? {
            ...img,
            status: CompressionStatus.ERROR,
            error: 'Failed to process'
          } : img
        ));
      } finally {
         setIsProcessing(false);
      }
    };

    if (hasPending && !isProcessing) {
       processQueue();
    }
  }, [images, settings, isProcessing, hasPending]);


  const handleRemove = (id: string) => {
    setImages(prev => {
        const target = prev.find(img => img.id === id);
        if (target && target.previewUrl) URL.revokeObjectURL(target.previewUrl);
        return prev.filter(img => img.id !== id);
    });
  };

  const handleClearAll = () => {
    images.forEach(img => { if(img.previewUrl) URL.revokeObjectURL(img.previewUrl); });
    setImages([]);
    setIsProcessing(false);
  };

  const handleDownloadAll = async () => {
    if (completedImages.length === 0) return;

    // Helper to get extension
    const getExt = (originalName: string, blob?: Blob) => {
        const dotIndex = originalName.lastIndexOf('.');
        const nameWithoutExt = dotIndex !== -1 ? originalName.slice(0, dotIndex) : originalName;
        
        // Logic to override extension based on mode
        let ext = dotIndex !== -1 ? originalName.slice(dotIndex) : '';

        // If blob is explicitly a zip, use .zip
        if (blob && blob.type === 'application/zip') {
            return { name: nameWithoutExt, ext: '.zip' };
        }

        if (settings.category === 'pdf') {
             if (settings.pdfMode === 'compress') ext = '.pdf';
             else if (settings.pdfMode === 'convert-to-image') {
                 // Single page PDF converted to 1 image
                 if (settings.pdfToImageFormat === 'image/jpeg') ext = '.jpg';
                 else ext = '.png';
             }
        } else {
            if (settings.mode === 'compress') {
                if (settings.fileType === 'image/webp') ext = '.webp';
                if (settings.fileType === 'image/jpeg') ext = '.jpg';
                if (settings.fileType === 'image/png') ext = '.png';
            } else if (settings.mode === 'remove-bg') {
                if (settings.removeBgFormat === 'image/jpeg') ext = '.jpg';
                else ext = '.png';
            } else if (settings.mode === 'convert') {
                if (settings.convertFormat === 'image/jpeg') ext = '.jpg';
                else if (settings.convertFormat === 'image/png') ext = '.png';
                else if (settings.convertFormat === 'image/webp') ext = '.webp';
                else if (settings.convertFormat === 'application/pdf') ext = '.pdf';
                else if (settings.convertFormat === 'image/x-icon') ext = '.ico';
            }
        }
        return { name: nameWithoutExt, ext };
    };
    
    let suffix = '_opt';
    if (settings.category === 'pdf') {
        if (settings.pdfMode === 'compress') suffix = '_min';
        else suffix = '_images';
    }
    else if (settings.mode === 'remove-bg') suffix = '_cutout';
    else if (settings.mode === 'convert') suffix = '_converted';

    if (completedImages.length === 1) {
      // Single file download
      const img = completedImages[0];
      if (img.compressedBlob) {
        const { name, ext } = getExt(img.originalFile.name, img.compressedBlob);
        downloadFile(img.compressedBlob, `${name}${suffix}${ext}`);
      }
    } else {
      // Zip download
      const zip = new JSZip();
      let folderName = "optimized_images";
      if (settings.category === 'pdf') folderName = "optimized_pdfs";
      else if (settings.mode === 'remove-bg') folderName = "cutout_images";
      else if (settings.mode === 'convert') folderName = "converted_images";

      const folder = zip.folder(folderName);
      
      completedImages.forEach(img => {
        if (img.compressedBlob) {
            const { name, ext } = getExt(img.originalFile.name, img.compressedBlob);
            folder?.file(`${name}${suffix}${ext}`, img.compressedBlob);
        }
      });

      const content = await zip.generateAsync({ type: "blob" });
      downloadFile(content as Blob, `${folderName}.zip`);
    }
  };

  const themeColor = settings.category === 'pdf' ? 'red' :
                     settings.mode === 'remove-bg' ? 'purple' :
                     settings.mode === 'convert' ? 'orange' : 'blue';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500/30">
      
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg shadow-lg transition-colors ${
              settings.category === 'pdf' ? 'bg-gradient-to-br from-red-600 to-pink-600 shadow-red-500/20' :
              settings.mode === 'remove-bg' ? 'bg-gradient-to-br from-purple-600 to-pink-600 shadow-purple-500/20' : 
              settings.mode === 'convert' ? 'bg-gradient-to-br from-orange-500 to-red-500 shadow-orange-500/20' :
              'bg-gradient-to-br from-blue-600 to-indigo-600 shadow-blue-500/20'
            }`}>
              {settings.category === 'pdf' ? <FileText size={20} className="text-white" /> :
               settings.mode === 'remove-bg' ? <Scissors size={20} className="text-white" /> : 
               settings.mode === 'convert' ? <RefreshCw size={20} className="text-white" /> :
               <Zap size={20} className="text-white" />}
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              {t(lang, 'appTitle')}
            </h1>
          </div>
          <div className="flex items-center gap-4">
             {completedImages.length > 0 && settings.mode === 'compress' && settings.category === 'image' && (
                <div className="hidden sm:flex flex-col items-end mr-4">
                    <span className="text-xs text-slate-400">{t(lang, 'totalSaved')}</span>
                    <span className="text-sm font-bold text-green-400">{totalSavings} ({formatFileSize(totalOriginalSize - totalCompressedSize)})</span>
                </div>
             )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        
        {/* Settings */}
        <SettingsPanel 
            settings={settings} 
            onSettingsChange={setSettings} 
            disabled={images.length > 0} 
            lang={lang}
            setLang={setLang}
            onCategoryChange={handleCategoryChange}
        />

        {/* Upload Area */}
        <div className="mb-8">
          <DropZone 
            onFilesAdded={handleFilesAdded} 
            isProcessing={isProcessing} 
            lang={lang}
            category={settings.category}
          />
        </div>

        {/* Action Bar (Only visible if files exist) */}
        {images.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
             <div className="flex items-center gap-2 text-slate-300">
                <span className="font-medium text-white">{images.length}</span>
                <span>{t(lang, 'files')}</span>
                <span className="w-1 h-1 bg-slate-600 rounded-full mx-2"></span>
                <span>{completedImages.length} {t(lang, 'done')}</span>
             </div>
             
             <div className="flex items-center gap-3 w-full sm:w-auto">
                <button 
                  onClick={handleClearAll}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  {t(lang, 'clearAll')}
                </button>
                
                <button 
                  onClick={handleDownloadAll}
                  disabled={completedImages.length === 0}
                  className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                    completedImages.length > 0 
                    ? settings.category === 'pdf' 
                      ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/20'
                      : settings.mode === 'remove-bg' 
                        ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/20' 
                        : settings.mode === 'convert'
                            ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-900/20'
                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Download size={18} />
                  {completedImages.length > 1 ? t(lang, 'downloadZip') : t(lang, 'download')}
                </button>
             </div>
          </div>
        )}

        {/* Global Progress Bar */}
        {isProcessing && images.length > 0 && (
          <div className="mb-6 bg-slate-900/50 rounded-xl p-4 border border-slate-800 backdrop-blur-sm">
             <div className="flex justify-between text-xs text-slate-300 mb-2 font-medium">
               <div className="flex items-center gap-2">
                 <span className={`w-2 h-2 rounded-full animate-pulse ${
                    settings.category === 'pdf' ? 'bg-red-500' :
                    settings.mode === 'remove-bg' ? 'bg-purple-500' : settings.mode === 'convert' ? 'bg-orange-500' : 'bg-blue-500'
                 }`}/>
                 <span>{t(lang, 'processing')}</span>
               </div>
               <span>{processedCount}/{images.length} ({progressPercentage}%)</span>
             </div>
             <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div 
                   className={`h-full transition-all duration-300 ease-out ${
                      settings.category === 'pdf' ? 'bg-red-500' :
                      settings.mode === 'remove-bg' ? 'bg-purple-500' : settings.mode === 'convert' ? 'bg-orange-500' : 'bg-blue-500'
                   }`}
                   style={{ width: `${progressPercentage}%` }}
                ></div>
             </div>
          </div>
        )}

        {/* File List */}
        <div className="space-y-3">
          {images.map((img) => (
            <ImageItem 
                key={img.id} 
                item={img} 
                onRemove={handleRemove} 
                lang={lang} 
                mode={settings.mode}
                category={settings.category}
            />
          ))}
        </div>

        {/* Empty State Hint */}
        {images.length === 0 && (
            <div className="text-center mt-12 opacity-0 animate-[fadeIn_0.5s_ease-in_forwards]" style={{animationDelay: '0.2s'}}>
                <p className="text-slate-600">{t(lang, 'ready')}</p>
            </div>
        )}

      </main>
    </div>
  );
};

export default App;