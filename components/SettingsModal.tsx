
import React from 'react';
import { X, Zap, Palette, Monitor, Sliders, Volume2 } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    speed: number;
    shader: 'none' | 'crt' | 'monochrome' | 'vivid';
    palette: 'original' | 'fceux' | 'nes-classic';
    audioGain: number;
  };
  updateSettings: (newSettings: any) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, updateSettings }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-[#0a0a0c] border border-gray-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-900/20">
          <div className="flex items-center gap-3">
            <Sliders className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-black uppercase tracking-tighter italic">System Config</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto">
          {/* Speed Control */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <Zap className="w-3.5 h-3.5" /> Engine Speed
              </label>
              <span className="text-xs font-black text-purple-400">{settings.speed}x</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[0.5, 1.0, 1.5, 2.0].map((s) => (
                <button
                  key={s}
                  onClick={() => updateSettings({ speed: s })}
                  className={`py-2 rounded-lg text-[10px] font-bold border transition-all ${
                    settings.speed === s 
                      ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20' 
                      : 'bg-gray-900 border-gray-800 text-gray-500 hover:border-gray-700'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {/* Shaders */}
          <div className="space-y-4">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <Monitor className="w-3.5 h-3.5" /> Visual Shaders
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['none', 'crt', 'monochrome', 'vivid'] as const).map((sh) => (
                <button
                  key={sh}
                  onClick={() => updateSettings({ shader: sh })}
                  className={`px-4 py-3 rounded-xl text-left border transition-all group ${
                    settings.shader === sh 
                      ? 'bg-blue-600/10 border-blue-500 shadow-lg shadow-blue-500/10' 
                      : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <p className={`text-[10px] font-black uppercase tracking-wider ${settings.shader === sh ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-400'}`}>
                    {sh}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Palette */}
          <div className="space-y-4">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <Palette className="w-3.5 h-3.5" /> Color Palette
            </label>
            <div className="grid grid-cols-1 gap-2">
              {(['original', 'fceux', 'nes-classic'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => updateSettings({ palette: p })}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                    settings.palette === p 
                      ? 'bg-green-600/10 border-green-500 shadow-lg shadow-green-500/10' 
                      : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <span className={`text-[10px] font-black uppercase tracking-wider ${settings.palette === p ? 'text-green-400' : 'text-gray-500'}`}>
                    {p.replace('-', ' ')}
                  </span>
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-full bg-[#f83800]" />
                    <div className="w-3 h-3 rounded-full bg-[#0058f8]" />
                    <div className="w-3 h-3 rounded-full bg-[#00a800]" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Audio */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <Volume2 className="w-3.5 h-3.5" /> Master Gain
              </label>
              <span className="text-[10px] font-black text-gray-400">{Math.round(settings.audioGain * 100)}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.1" 
              value={settings.audioGain}
              onChange={(e) => updateSettings({ audioGain: parseFloat(e.target.value) })}
              className="w-full accent-purple-500 bg-gray-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800 bg-gray-900/20 flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 bg-white text-black font-black uppercase text-xs tracking-widest py-3 rounded-xl hover:bg-gray-200 transition-colors shadow-xl"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
};
