import React from 'react';
import { Settings, Info } from 'lucide-react';
import { CompressionSettings } from '../types';

interface SettingsPanelProps {
  settings: CompressionSettings;
  onSettingsChange: (settings: CompressionSettings) => void;
  disabled: boolean;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onSettingsChange,
  disabled,
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

  return (
    <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-xl p-6 mb-6">
      <div className="flex items-center gap-2 mb-4 text-white font-medium">
        <Settings size={18} className="text-blue-400" />
        <span>Compression Settings</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Quality Slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm text-slate-300">Quality Level</label>
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
            Lower quality = smaller file size. 70-80% is recommended for web.
          </p>
        </div>

        {/* Format Selection */}
        <div>
          <label className="block text-sm text-slate-300 mb-2">Output Format</label>
          <select
            value={settings.fileType || 'original'}
            onChange={handleFormatChange}
            disabled={disabled}
            className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
          >
            <option value="original">Keep Original Format</option>
            <option value="image/jpeg">Convert to JPEG</option>
            <option value="image/png">Convert to PNG</option>
            <option value="image/webp">Convert to WebP (Recommended)</option>
          </select>
          <p className="text-xs text-slate-500 mt-2 flex items-start gap-1">
            <Info size={12} className="mt-0.5 shrink-0" />
            WebP often provides 30% smaller files than JPEG for the same quality.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;