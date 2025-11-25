import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Download, Trash2, Zap, Scissors } from 'lucide-react';
import JSZip from 'jszip';

import DropZone from './components/DropZone';
import SettingsPanel from './components/SettingsPanel';
import ImageItem from './components/ImageItem';
import { processImage } from './utils/processor';
import { formatFileSize, calculateSavings } from './utils/formatters';
import { downloadFile } from './utils/download';
import { CompressedImage, CompressionStatus, ProcessingSettings, Language } from './types';
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
    mode: 'compress',
    // Compression Defaults
    maxSizeMB: 2,
    useWebWorker: true,
    initialQuality: 0.8,
    fileType: undefined,
    // BG Removal Defaults
    removeBgFormat: 'image/png',
    compressResult: false,
  });

  // Derived stats
  const completedImages = useMemo(() => images.filter(img => img.status === CompressionStatus.COMPLETED), [images]);
  const totalOriginalSize = useMemo(() => completedImages.reduce((acc, img) => acc + img.originalSize, 0), [completedImages]);
  const totalCompressedSize = useMemo(() => completedImages.reduce((acc, img) => acc + img.compressedSize, 0), [completedImages]);
  const totalSavings = totalOriginalSize > 0 ? calculateSavings(totalOriginalSize, totalCompressedSize) : '0%';
  const hasPending = useMemo(() => images.some(img => img.status === CompressionStatus.PENDING), [images]);

  // Handle adding files
  const handleFilesAdded = useCallback((files: File[]) => {
    const newImages: CompressedImage[] = files.map(file => ({
      id: generateId(),
      originalFile: file,
      compressedBlob: null,
      status: CompressionStatus.PENDING,
      originalSize: file.size,
      compressedSize: 0,
      previewUrl: URL.createObjectURL(file),
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
        const resultBlob = await processImage(pendingImage.originalFile, settings);
        
        setImages(prev => prev.map(img => 
          img.id === pendingImage.id ? {
            ...img,
            status: CompressionStatus.COMPLETED,
            compressedBlob: resultBlob,
            compressedSize: resultBlob.size,
            previewUrl: URL.createObjectURL(resultBlob) // Update preview to result
          } : img
        ));
      } catch (error) {
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
    images.forEach(img => URL.revokeObjectURL(img.previewUrl));
    setImages([]);
    setIsProcessing(false);
  };

  const handleDownloadAll = async () => {
    if (completedImages.length === 0) return;

    // Helper to get extension
    const getExt = (originalName: string) => {
        const dotIndex = originalName.lastIndexOf('.');
        const nameWithoutExt = dotIndex !== -1 ? originalName.slice(0, dotIndex) : originalName;
        
        let ext = dotIndex !== -1 ? originalName.slice(dotIndex) : '';
        
        // Logic for extension based on settings/mode
        if (settings.mode === 'compress') {
            if (settings.fileType === 'image/webp') ext = '.webp';
            if (settings.fileType === 'image/jpeg') ext = '.jpg';
            if (settings.fileType === 'image/png') ext = '.png';
        } else {
            // Remove BG mode
            if (settings.removeBgFormat === 'image/jpeg') ext = '.jpg';
            else ext = '.png';
        }
        return { name: nameWithoutExt, ext };
    };
    
    const suffix = settings.mode === 'remove-bg' ? '_cutout' : '_opt';

    if (completedImages.length === 1) {
      // Single file download
      const img = completedImages[0];
      if (img.compressedBlob) {
        const { name, ext } = getExt(img.originalFile.name);
        downloadFile(img.compressedBlob, `${name}${suffix}${ext}`);
      }
    } else {
      // Zip download
      const zip = new JSZip();
      const folderName = settings.mode === 'remove-bg' ? "cutout_images" : "optimized_images";
      const folder = zip.folder(folderName);
      
      completedImages.forEach(img => {
        if (img.compressedBlob) {
            const { name, ext } = getExt(img.originalFile.name);
            folder?.file(`${name}${suffix}${ext}`, img.compressedBlob);
        }
      });

      const content = await zip.generateAsync({ type: "blob" });
      downloadFile(content as Blob, `${folderName}.zip`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500/30">
      
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg shadow-lg transition-colors ${settings.mode === 'remove-bg' ? 'bg-gradient-to-br from-purple-600 to-pink-600 shadow-purple-500/20' : 'bg-gradient-to-br from-blue-600 to-indigo-600 shadow-blue-500/20'}`}>
              {settings.mode === 'remove-bg' ? <Scissors size={20} className="text-white" /> : <Zap size={20} className="text-white" />}
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              {t(lang, 'appTitle')}
            </h1>
          </div>
          <div className="flex items-center gap-4">
             {completedImages.length > 0 && settings.mode === 'compress' && (
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
        />

        {/* Upload Area */}
        <div className="mb-8">
          <DropZone onFilesAdded={handleFilesAdded} isProcessing={isProcessing} lang={lang} />
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
                    ? settings.mode === 'remove-bg' ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/20' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Download size={18} />
                  {completedImages.length > 1 ? t(lang, 'downloadZip') : t(lang, 'download')}
                </button>
             </div>
          </div>
        )}

        {/* File List */}
        <div className="space-y-3">
          {images.map((img) => (
            <ImageItem key={img.id} item={img} onRemove={handleRemove} lang={lang} mode={settings.mode} />
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
