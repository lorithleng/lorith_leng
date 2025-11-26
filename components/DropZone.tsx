
import React, { useCallback, useState } from 'react';
import { Upload, ImagePlus, FileText } from 'lucide-react';
import { Language, AppCategory } from '../types';
import { t } from '../utils/translations';

interface DropZoneProps {
  onFilesAdded: (files: File[]) => void;
  isProcessing: boolean;
  lang: Language;
  category: AppCategory;
}

const DropZone: React.FC<DropZoneProps> = ({ onFilesAdded, isProcessing, lang, category }) => {
  const [isDragging, setIsDragging] = useState(false);

  const acceptType = category === 'pdf' ? 'application/pdf' : 'image/*';

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const files = Array.from(e.dataTransfer.files) as File[];
        
        const validFiles = files.filter(file => {
             if (category === 'pdf') return file.type === 'application/pdf';
             return file.type.startsWith('image/');
        });

        if (validFiles.length > 0) {
          onFilesAdded(validFiles);
        }
      }
    },
    [onFilesAdded, category]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const files = Array.from(e.target.files) as File[];
        const validFiles = files.filter(file => {
             if (category === 'pdf') return file.type === 'application/pdf';
             return file.type.startsWith('image/');
        });
        onFilesAdded(validFiles);
      }
    },
    [onFilesAdded, category]
  );

  return (
    <div
      className={`relative w-full rounded-2xl border-2 border-dashed transition-all duration-300 ease-in-out ${
        isDragging
          ? 'border-blue-500 bg-blue-500/10 scale-[1.01]'
          : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id="fileInput"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        multiple
        accept={acceptType}
        onChange={handleFileInput}
        disabled={isProcessing}
      />
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className={`p-4 rounded-full mb-4 ${isDragging ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700/50 text-slate-400'}`}>
            {isDragging ? <Upload size={32} /> : category === 'pdf' ? <FileText size={32} /> : <ImagePlus size={32} />}
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          {isDragging ? t(lang, 'dropActive') : t(lang, 'dropTitle')}
        </h3>
        <p className="text-slate-400 text-sm max-w-sm mx-auto">
          {category === 'pdf' ? t(lang, 'dropSubtitlePdf') : t(lang, 'dropSubtitleImage')}
        </p>
        <button 
            type="button" 
            className="mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-blue-900/20"
        >
            {t(lang, 'selectFiles')}
        </button>
      </div>
    </div>
  );
};

export default DropZone;
