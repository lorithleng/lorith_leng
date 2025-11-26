import React from 'react';
import { Settings, Info, Image as ImageIcon, Scissors, Globe, Maximize2 } from 'lucide-react';
import { ProcessingSettings, Language, AppMode } from '../types';
import { t } from '../utils/translations';

interface SettingsPanelProps {
  settings: ProcessingSettings;
  onSettingsChange: (settings: ProcessingSettings) => void;
  disabled: boolean;
  lang: Language;
  setLang: (l: Language) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onSettingsChange,
  disabled,
  lang,
  setLang
}) => {
  
  const handleQualityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSettingsChange({
      ...settings,
      initialQuality: parseFloat(e.target.value),
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

  return (
    <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden mb-6 transition-all duration-300">
      
      {/* Top Bar: Mode Tabs & Language */}
      <div className="flex flex-col sm:flex-row border-b border-slate-700">
        <div className="flex flex-1">
          <button
            onClick={() => handleModeChange('compress')}
            className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
              settings.mode === 'compress' 
                ? 'bg-blue-600/10 text-blue-400 border-b-2 border-blue-500' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            disabled={disabled}
          >
            <ImageIcon size={18} />
            {t(lang, 'modeCompress')}
          </button>
          <button
            onClick={() => handleModeChange('remove-bg')}
            className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
              settings.mode === 'remove-bg' 
                ? 'bg-purple-600/10 text-purple-400 border-b-2 border-purple-500' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            disabled={disabled}
          >
            <Scissors size={18} />
            {t(lang, 'modeRemoveBg')}
          </button>
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
        <div className="flex items-center gap-2 mb-4 text-white font-medium">
          <Settings size={18} className={settings.mode === 'compress' ? "text-blue-400" : "text-purple-400"} />
          <span>{settings.mode === 'compress' ? t(lang, 'modeCompress') : t(lang, 'modeRemoveBg')}</span>
        </div>

        {/* Compression Mode Settings */}
        {settings.mode === 'compress' && (
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

        {/* Remove BG Mode Settings */}
        {settings.mode === 'remove-bg' && (
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

      </div>
    </div>
  );
};

export default SettingsPanel;