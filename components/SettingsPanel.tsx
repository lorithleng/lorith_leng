
import React from 'react';
import { Settings, Info, Image as ImageIcon, Scissors, Globe, Maximize2, RefreshCw, FileText, Minimize2, Images, Split, Lock, Edit3, Type } from 'lucide-react';
import { ProcessingSettings, Language, AppMode, AppCategory, PdfMode } from '../types';
import { t } from '../utils/translations';

interface SettingsPanelProps {
  settings: ProcessingSettings;
  onSettingsChange: (settings: ProcessingSettings) => void;
  disabled: boolean;
  lang: Language;
  setLang: (l: Language) => void;
  onCategoryChange: (c: AppCategory) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onSettingsChange,
  disabled,
  lang,
  setLang,
  onCategoryChange
}) => {
  
  const handleQualityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSettingsChange({
      ...settings,
      initialQuality: parseFloat(e.target.value),
    });
  };
  
  const handlePdfQualityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSettingsChange({
      ...settings,
      pdfQuality: parseFloat(e.target.value),
    });
  };

  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    onSettingsChange({
      ...settings,
      fileType: val === 'original' ? undefined : val,
    });
  };

  const handleModeChange = (mode: AppMode) => {
    onSettingsChange({ ...settings, mode });
  };
  
  const handlePdfModeChange = (pdfMode: PdfMode) => {
    onSettingsChange({ ...settings, pdfMode });
  };

  return (
    <div className="flex flex-col gap-4 mb-6">
        {/* Category Switcher Pill */}
        <div className="self-center bg-slate-800/80 p-1 rounded-full border border-slate-700 flex">
            <button
                onClick={() => onCategoryChange('image')}
                disabled={disabled}
                className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all ${
                    settings.category === 'image' 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-white'
                }`}
            >
                <ImageIcon size={16} />
                {t(lang, 'catImage')}
            </button>
            <button
                onClick={() => onCategoryChange('pdf')}
                disabled={disabled}
                className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all ${
                    settings.category === 'pdf' 
                    ? 'bg-red-600 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-white'
                }`}
            >
                <FileText size={16} />
                {t(lang, 'catPdf')}
            </button>
        </div>

    <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden transition-all duration-300">
      
      {/* Mode Tabs */}
      <div className="flex flex-col sm:flex-row border-b border-slate-700">
        <div className="flex flex-1 overflow-x-auto scrollbar-hide">
          {settings.category === 'image' ? (
              <>
              <button
                onClick={() => handleModeChange('compress')}
                className={`flex-1 min-w-[100px] py-4 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                  settings.mode === 'compress' 
                    ? 'bg-blue-600/10 text-blue-400 border-b-2 border-blue-500' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
                disabled={disabled}
              >
                <ImageIcon size={18} />
                <span className="whitespace-nowrap">{t(lang, 'modeCompress')}</span>
              </button>
              <button
                onClick={() => handleModeChange('remove-bg')}
                className={`flex-1 min-w-[100px] py-4 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                  settings.mode === 'remove-bg' 
                    ? 'bg-purple-600/10 text-purple-400 border-b-2 border-purple-500' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
                disabled={disabled}
              >
                <Scissors size={18} />
                <span className="whitespace-nowrap">{t(lang, 'modeRemoveBg')}</span>
              </button>
              <button
                onClick={() => handleModeChange('convert')}
                className={`flex-1 min-w-[100px] py-4 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                  settings.mode === 'convert' 
                    ? 'bg-orange-600/10 text-orange-400 border-b-2 border-orange-500' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
                disabled={disabled}
              >
                <RefreshCw size={18} />
                <span className="whitespace-nowrap">{t(lang, 'modeConvert')}</span>
              </button>
              </>
          ) : (
             <>
             <button
                onClick={() => handlePdfModeChange('compress')}
                className={`flex-1 min-w-[100px] py-4 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                  settings.pdfMode === 'compress' 
                    ? 'bg-red-600/10 text-red-400 border-b-2 border-red-500' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
                disabled={disabled}
              >
                <Minimize2 size={18} />
                <span className="whitespace-nowrap">{t(lang, 'modePdfCompress')}</span>
              </button>
              <button
                onClick={() => handlePdfModeChange('convert-to-image')}
                className={`flex-1 min-w-[100px] py-4 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                  settings.pdfMode === 'convert-to-image' 
                    ? 'bg-pink-600/10 text-pink-400 border-b-2 border-pink-500' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
                disabled={disabled}
              >
                <Images size={18} />
                <span className="whitespace-nowrap">{t(lang, 'modePdfToImage')}</span>
              </button>
              <button
                onClick={() => handlePdfModeChange('split')}
                className={`flex-1 min-w-[80px] py-4 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                  settings.pdfMode === 'split' 
                    ? 'bg-green-600/10 text-green-400 border-b-2 border-green-500' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
                disabled={disabled}
              >
                <Split size={18} />
                <span className="whitespace-nowrap">{t(lang, 'modePdfSplit')}</span>
              </button>
              <button
                onClick={() => handlePdfModeChange('unlock')}
                className={`flex-1 min-w-[80px] py-4 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                  settings.pdfMode === 'unlock' 
                    ? 'bg-yellow-600/10 text-yellow-400 border-b-2 border-yellow-500' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
                disabled={disabled}
              >
                <Lock size={18} />
                <span className="whitespace-nowrap">{t(lang, 'modePdfUnlock')}</span>
              </button>
               <button
                onClick={() => handlePdfModeChange('edit')}
                className={`flex-1 min-w-[80px] py-4 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                  settings.pdfMode === 'edit' 
                    ? 'bg-indigo-600/10 text-indigo-400 border-b-2 border-indigo-500' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
                disabled={disabled}
              >
                <Edit3 size={18} />
                <span className="whitespace-nowrap">{t(lang, 'modePdfEdit')}</span>
              </button>
              <button
                onClick={() => handlePdfModeChange('annotate')}
                className={`flex-1 min-w-[80px] py-4 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                  settings.pdfMode === 'annotate' 
                    ? 'bg-teal-600/10 text-teal-400 border-b-2 border-teal-500' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
                disabled={disabled}
              >
                <Type size={18} />
                <span className="whitespace-nowrap">{t(lang, 'modePdfAnnotate')}</span>
              </button>
             </>
          )}
        </div>
        
        <div className="flex items-center justify-end px-4 py-2 bg-slate-900/30 border-t sm:border-t-0 sm:border-l border-slate-700">
           <button 
             onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
             className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
           >
             <Globe size={14} />
             {lang === 'en' ? '中文' : 'English'}
           </button>
        </div>
      </div>

      <div className="p-6">
        
        {/* IMAGE: Compression Settings */}
        {settings.category === 'image' && settings.mode === 'compress' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Quality & Format */}
            <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm text-slate-300">{t(lang, 'qualityLevel')}</label>
                    <span className="text-sm font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                      {Math.round(settings.initialQuality * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={settings.initialQuality}
                    onChange={handleQualityChange}
                    disabled={disabled}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <p className="text-xs text-slate-500 mt-2 flex items-start gap-1">
                    <Info size={12} className="mt-0.5 shrink-0" />
                    {t(lang, 'qualityHint')}
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">{t(lang, 'outputFormat')}</label>
                  <select
                    value={settings.fileType || 'original'}
                    onChange={handleFormatChange}
                    disabled={disabled}
                    className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                  >
                    <option value="original">{t(lang, 'keepOriginal')}</option>
                    <option value="image/jpeg">{t(lang, 'convertJpeg')}</option>
                    <option value="image/png">{t(lang, 'convertPng')}</option>
                    <option value="image/webp">{t(lang, 'convertWebp')}</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-2 flex items-start gap-1">
                    <Info size={12} className="mt-0.5 shrink-0" />
                    {t(lang, 'formatHint')}
                  </p>
                </div>
            </div>

            {/* Resize Settings */}
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Maximize2 size={16} className="text-slate-400" />
                        <label className="text-sm text-slate-200 font-medium">{t(lang, 'resizeImages')}</label>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={settings.resize}
                            onChange={(e) => onSettingsChange({...settings, resize: e.target.checked})}
                            disabled={disabled}
                        />
                        <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>

                <div className={`grid grid-cols-2 gap-4 transition-opacity duration-200 ${settings.resize ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                   <div>
                      <label className="block text-xs text-slate-400 mb-1.5">{t(lang, 'maxWidth')}</label>
                      <div className="relative">
                          <input 
                             type="number"
                             value={settings.maxWidth || ''}
                             onChange={(e) => onSettingsChange({...settings, maxWidth: parseInt(e.target.value) || 0})}
                             className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-md px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                             placeholder="1920"
                          />
                          <span className="absolute right-3 top-2.5 text-xs text-slate-500">{t(lang, 'px')}</span>
                      </div>
                   </div>
                   <div>
                      <label className="block text-xs text-slate-400 mb-1.5">{t(lang, 'maxHeight')}</label>
                      <div className="relative">
                          <input 
                             type="number"
                             value={settings.maxHeight || ''}
                             onChange={(e) => onSettingsChange({...settings, maxHeight: parseInt(e.target.value) || 0})}
                             className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-md px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                             placeholder="1080"
                          />
                          <span className="absolute right-3 top-2.5 text-xs text-slate-500">{t(lang, 'px')}</span>
                      </div>
                   </div>
                </div>
                <p className="text-xs text-slate-500 mt-3 flex items-start gap-1">
                   <Info size={12} className="mt-0.5 shrink-0" />
                   {t(lang, 'resizeHint')}
                </p>
            </div>
          </div>
        )}

        {/* IMAGE: Remove BG Settings */}
        {settings.category === 'image' && settings.mode === 'remove-bg' && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm text-slate-300 mb-2">{t(lang, 'bgRemovalFormat')}</label>
                <select
                  value={settings.removeBgFormat}
                  onChange={(e) => onSettingsChange({...settings, removeBgFormat: e.target.value as any})}
                  disabled={disabled}
                  className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block p-2.5"
                >
                  <option value="image/png">{t(lang, 'transparentPng')}</option>
                  <option value="image/jpeg">{t(lang, 'whiteBgJpeg')}</option>
                </select>
              </div>

              <div className="flex flex-col justify-center">
                 <label className="flex items-center cursor-pointer mb-2">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={settings.compressResult}
                      onChange={(e) => onSettingsChange({...settings, compressResult: e.target.checked})}
                      disabled={disabled}
                    />
                    <div className="relative w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    <span className="ms-3 text-sm font-medium text-gray-300">{t(lang, 'compressResult')}</span>
                 </label>
                 <p className="text-xs text-slate-500 flex items-start gap-1">
                    <Info size={12} className="mt-0.5 shrink-0" />
                    {t(lang, 'compressResultHint')}
                  </p>
              </div>
           </div>
        )}
        
        {/* IMAGE: Convert Settings */}
        {settings.category === 'image' && settings.mode === 'convert' && (
             <div className="max-w-md">
                <label className="block text-sm text-slate-300 mb-2">{t(lang, 'targetFormat')}</label>
                <select
                  value={settings.convertFormat || 'image/jpeg'}
                  onChange={(e) => onSettingsChange({...settings, convertFormat: e.target.value})}
                  disabled={disabled}
                  className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block p-2.5"
                >
                  <option value="image/jpeg">{t(lang, 'convertJpeg')}</option>
                  <option value="image/png">{t(lang, 'convertPng')}</option>
                  <option value="image/webp">{t(lang, 'convertWebp')}</option>
                  <option value="application/pdf">{t(lang, 'convertPdf')}</option>
                  <option value="image/x-icon">{t(lang, 'convertIco')}</option>
                </select>
                <p className="text-xs text-slate-500 mt-2 flex items-start gap-1">
                   <Info size={12} className="mt-0.5 shrink-0" />
                   {settings.convertFormat === 'application/pdf' ? t(lang, 'pdfHint') : settings.convertFormat === 'image/x-icon' ? t(lang, 'icoHint') : t(lang, 'convertHint')}
                </p>
             </div>
        )}

        {/* PDF: Compress Settings */}
        {settings.category === 'pdf' && settings.pdfMode === 'compress' && (
             <div className="max-w-md">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm text-slate-300">{t(lang, 'qualityLevel')}</label>
                    <span className="text-sm font-mono text-red-400 bg-red-500/10 px-2 py-0.5 rounded">
                      {Math.round(settings.pdfQuality * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={settings.pdfQuality}
                    onChange={handlePdfQualityChange}
                    disabled={disabled}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500"
                  />
                  <p className="text-xs text-slate-500 mt-2 flex items-start gap-1">
                    <Info size={12} className="mt-0.5 shrink-0" />
                    {t(lang, 'pdfQualityHint')}
                  </p>
                </div>
             </div>
        )}

        {/* PDF: Convert to Image Settings */}
        {settings.category === 'pdf' && settings.pdfMode === 'convert-to-image' && (
             <div className="max-w-md">
                <label className="block text-sm text-slate-300 mb-2">{t(lang, 'outputFormat')}</label>
                <select
                  value={settings.pdfToImageFormat}
                  onChange={(e) => onSettingsChange({...settings, pdfToImageFormat: e.target.value as any})}
                  disabled={disabled}
                  className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-lg focus:ring-pink-500 focus:border-pink-500 block p-2.5"
                >
                  <option value="image/jpeg">{t(lang, 'convertJpeg')}</option>
                  <option value="image/png">{t(lang, 'convertPng')}</option>
                </select>
                <p className="text-xs text-slate-500 mt-2 flex items-start gap-1">
                  <Info size={12} className="mt-0.5 shrink-0" />
                  {t(lang, 'pdfToImageHint')}
                </p>
             </div>
        )}

        {/* PDF: Split Settings */}
        {settings.category === 'pdf' && settings.pdfMode === 'split' && (
             <div className="max-w-md">
                <label className="block text-sm text-slate-300 mb-2">{t(lang, 'pageRange')}</label>
                <input 
                    type="text" 
                    value={settings.pdfSplitRange}
                    onChange={(e) => onSettingsChange({...settings, pdfSplitRange: e.target.value})}
                    disabled={disabled}
                    placeholder="e.g. 1-5, 8, 11-13"
                    className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block p-2.5"
                />
                <p className="text-xs text-slate-500 mt-2 flex items-start gap-1">
                  <Info size={12} className="mt-0.5 shrink-0" />
                  {lang === 'zh' ? '输入要提取的页码范围 (如: 1-3, 5)' : 'Enter page numbers to extract (e.g. 1-3, 5)'}
                </p>
             </div>
        )}

        {/* PDF: Unlock Settings */}
        {settings.category === 'pdf' && settings.pdfMode === 'unlock' && (
             <div className="max-w-md">
                <label className="block text-sm text-slate-300 mb-2">{t(lang, 'password')}</label>
                <input 
                    type="password" 
                    value={settings.pdfPassword || ''}
                    onChange={(e) => onSettingsChange({...settings, pdfPassword: e.target.value})}
                    disabled={disabled}
                    placeholder="Enter password"
                    className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block p-2.5"
                />
                <p className="text-xs text-slate-500 mt-2 flex items-start gap-1">
                  <Info size={12} className="mt-0.5 shrink-0" />
                  {lang === 'zh' ? '输入密码以解锁并保存为无密码PDF' : 'Enter password to unlock and save as unsecured PDF'}
                </p>
             </div>
        )}

        {/* PDF: Edit (Rotate) Settings */}
        {settings.category === 'pdf' && settings.pdfMode === 'edit' && (
             <div className="max-w-md">
                <label className="block text-sm text-slate-300 mb-2">{t(lang, 'rotation')}</label>
                <select
                  value={settings.pdfRotation}
                  onChange={(e) => onSettingsChange({...settings, pdfRotation: parseInt(e.target.value) as any})}
                  disabled={disabled}
                  className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
                >
                  <option value="0">0°</option>
                  <option value="90">90° CW</option>
                  <option value="180">180°</option>
                  <option value="270">270° CW</option>
                </select>
                <p className="text-xs text-slate-500 mt-2 flex items-start gap-1">
                  <Info size={12} className="mt-0.5 shrink-0" />
                  {lang === 'zh' ? '旋转所有页面' : 'Rotate all pages'}
                </p>
             </div>
        )}
        
        {/* PDF: Annotate (Watermark) Settings */}
        {settings.category === 'pdf' && settings.pdfMode === 'annotate' && (
             <div className="max-w-md">
                <label className="block text-sm text-slate-300 mb-2">{t(lang, 'watermarkText')}</label>
                <input 
                    type="text" 
                    value={settings.pdfWatermarkText}
                    onChange={(e) => onSettingsChange({...settings, pdfWatermarkText: e.target.value})}
                    disabled={disabled}
                    placeholder="CONFIDENTIAL"
                    className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block p-2.5"
                />
             </div>
        )}

      </div>
    </div>
    </div>
  );
};

export default SettingsPanel;
