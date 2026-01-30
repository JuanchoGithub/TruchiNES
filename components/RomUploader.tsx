
import React, { useState, useRef } from 'react';
import { Upload, FileCode, AlertCircle } from 'lucide-react';

interface RomUploaderProps {
  onUpload: (name: string, data: string) => void;
}

export const RomUploader: React.FC<RomUploaderProps> = ({ onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.nes')) {
      setError('Please upload a valid .nes file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        onUpload(file.name, result);
        setError(null);
      }
    };
    reader.readAsBinaryString(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div 
        className={`relative group p-1 rounded-3xl transition-all duration-500 ${isDragging ? 'bg-gradient-to-r from-purple-500 to-blue-500 scale-[1.02]' : 'bg-gray-800/50'}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
      >
        <div className="bg-[#0a0a0c] rounded-[22px] p-12 border-2 border-dashed border-gray-800 flex flex-col items-center justify-center text-center gap-6">
          <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center border border-gray-800 group-hover:scale-110 transition-transform duration-500">
            <Upload className={`w-8 h-8 ${isDragging ? 'text-purple-400 animate-bounce' : 'text-gray-500'}`} />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Load a ROM</h2>
            <p className="text-gray-500 max-w-xs mx-auto">
              Drag and drop your <span className="text-purple-400 font-mono">.nes</span> file here or click to browse.
            </p>
          </div>

          <button 
            onClick={() => fileInputRef.current?.click()}
            className="glow-button bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-8 rounded-xl transition-all flex items-center gap-2"
          >
            <FileCode className="w-5 h-5" />
            Select ROM File
          </button>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 px-4 py-2 rounded-lg border border-red-400/20">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={onFileChange} 
            accept=".nes" 
            className="hidden" 
          />
        </div>
      </div>
      
      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-semibold text-gray-400 uppercase">Engine Ready</span>
        </div>
        <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-xs font-semibold text-gray-400 uppercase">AI Synced</span>
        </div>
      </div>
    </div>
  );
};
