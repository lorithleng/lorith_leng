import React from 'react';
import { CheckCircle2, XCircle, Loader2, ArrowRight, Trash2 } from 'lucide-react';
import { CompressedImage, CompressionStatus, Language, AppMode } from '../types';
import { formatFileSize, calculateSavings } from '../utils/formatters';

interface ImageItemProps {
  item: CompressedImage;
  onRemove: (id: string) => void;
  lang: Language;
  mode: AppMode;
}

const ImageItem: React.FC<ImageItemProps> = ({ item, onRemove, lang, mode }) => {
  return (
    <div className="group relative bg-slate-800 border border-slate-700 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row items-center gap-4 transition-all hover:bg-slate-750 hover:border-slate-600">
      
      {/* Thumbnail */}
      <div className="relative w-16 h-16 shrink-0 rounded-md overflow-hidden bg-slate-900 border border-slate-700">
        <img 
          src={item.previewUrl} 
          alt="preview" 
          className="w-full h-full object-cover" 
        />
        {item.status === CompressionStatus.PROCESSING && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Loader2 size={20} className="text-white animate-spin" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 w-full text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
          <h4 className="text-sm font-medium text-white truncate max-w-[200px]" title={item.originalFile.name}>
            {item.originalFile.name}
          </h4>
          <span className="text-xs px-1.5 py-0.5 rounded text-slate-400 bg-slate-900 border border-slate-700 uppercase">
            {item.originalFile.name.split('.').pop()}
          </span>
        </div>

        <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-400">
          <span>{formatFileSize(item.originalSize)}</span>
          <ArrowRight size={12} />
          {item.status === CompressionStatus.COMPLETED ? (
            <span className="text-green-400 font-medium">{formatFileSize(item.compressedSize)}</span>
          ) : (
            <span>...</span>
          )}
        </div>
      </div>

      {/* Status & Action */}
      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
        
        {/* Savings Pill (Only in Compress Mode or if size reduced) */}
        {item.status === CompressionStatus.COMPLETED && (item.originalSize > item.compressedSize) && (
          <div className="flex items-center gap-1.5 bg-green-500/10 text-green-400 px-2 py-1 rounded-full border border-green-500/20">
             <span className="text-xs font-bold">-{calculateSavings(item.originalSize, item.compressedSize)}</span>
          </div>
        )}

        {/* Status Icon */}
        <div className="flex items-center">
          {item.status === CompressionStatus.COMPLETED && <CheckCircle2 size={20} className="text-green-500" />}
          {item.status === CompressionStatus.ERROR && <XCircle size={20} className="text-red-500" />}
          {item.status === CompressionStatus.PROCESSING && (
             <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div className={`h-full animate-pulse w-full origin-left ${mode === 'remove-bg' ? 'bg-purple-500' : 'bg-blue-500'}`}></div>
             </div>
          )}
          {item.status === CompressionStatus.PENDING && <div className="w-2 h-2 rounded-full bg-slate-600" />}
        </div>

        {/* Remove Button */}
        <button 
          onClick={() => onRemove(item.id)}
          className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
          title="Remove image"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default ImageItem;
