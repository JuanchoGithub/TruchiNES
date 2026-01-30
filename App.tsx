
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { RomUploader } from './components/RomUploader';
import { EmulatorCanvas, EmulatorHandle } from './components/EmulatorCanvas';
import { ControlGuide } from './components/ControlGuide';
import { VirtualGamepad } from './components/VirtualGamepad';
import { SettingsModal } from './components/SettingsModal';
import { 
  Gamepad, 
  RotateCcw, 
  Save, 
  Download, 
  Maximize, 
  Sliders, 
  LogOut, 
  Keyboard, 
  Info,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

const App: React.FC = () => {
  const [romName, setRomName] = useState<string | null>(null);
  const [romData, setRomData] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  
  const [settings, setSettings] = useState({
    speed: 1.0,
    shader: 'crt' as const,
    palette: 'original' as const,
    audioGain: 0.5
  });

  const emulatorRef = useRef<EmulatorHandle>(null);
  const appRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    checkTouch();
  }, []);

  const handleRomUpload = useCallback((name: string, data: string) => {
    setRomName(name);
    setRomData(data);
    setIsPlaying(true);
  }, []);

  const updateSettings = (newSettings: any) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetEmulator = () => {
    if (confirm("Reset current game?")) {
      emulatorRef.current?.releaseButton(null);
      setIsPlaying(false);
      setTimeout(() => setIsPlaying(true), 50);
    }
  };

  const quitGame = () => {
    if (confirm("Quit to menu?")) {
      setIsPlaying(false);
      setRomData(null);
      setRomName(null);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      appRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div ref={appRef} className="h-screen w-screen flex flex-col bg-[#050507] text-gray-100 overflow-hidden font-sans select-none">
      {!isPlaying ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <RomUploader onUpload={handleRomUpload} />
        </div>
      ) : (
        <>
          {/* Minimalist Top Navigation */}
          <header className="h-12 border-b border-gray-800/50 bg-[#08080a]/80 backdrop-blur-md flex items-center justify-between px-4 shrink-0 z-50">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-blue-600 rounded flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Gamepad className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col min-w-0">
                <h1 className="text-[10px] font-black tracking-tighter text-white uppercase italic leading-none">TruchiNES</h1>
                <p className="text-[9px] text-purple-400 font-bold uppercase tracking-widest truncate max-w-[150px] sm:max-w-xs">{romName}</p>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <button 
                onClick={() => setShowGuide(!showGuide)}
                className={`p-2 rounded-lg transition-colors ${showGuide ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
                title="Controls"
              >
                <Keyboard className="w-4 h-4" />
              </button>
              <button 
                onClick={quitGame}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/10 rounded-lg transition-colors"
                title="Quit"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Maximized Game Viewport */}
          <main className="flex-1 relative bg-black flex items-center justify-center p-0 overflow-hidden">
            <div className="w-full h-full flex items-center justify-center relative">
               {romData && (
                 <EmulatorCanvas 
                   ref={emulatorRef}
                   romData={romData} 
                   settings={settings}
                 />
               )}
            </div>

            {/* Floating Control Guide Overlay */}
            {showGuide && (
              <div className="absolute top-4 right-4 z-[60] w-64 animate-in fade-in slide-in-from-right-4 duration-300">
                <ControlGuide />
              </div>
            )}

            {isTouchDevice && (
              <VirtualGamepad 
                onButtonDown={(btn) => emulatorRef.current?.pressButton(btn)}
                onButtonUp={(btn) => emulatorRef.current?.releaseButton(btn)}
              />
            )}
          </main>

          {/* Compact Bottom Control Bar */}
          <footer className="h-14 sm:h-16 border-t border-gray-800/50 bg-[#08080a]/80 backdrop-blur-md flex items-center justify-center px-4 gap-2 sm:gap-4 shrink-0 z-50">
            <div className="flex items-center gap-1 sm:gap-2 max-w-full overflow-x-auto no-scrollbar py-1">
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-[10px] font-black transition-all border border-purple-500/30 text-purple-300 hover:bg-purple-600/10 bg-purple-900/5"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">CONFIG</span>
              </button>

              <div className="w-px h-6 bg-gray-800 mx-1 hidden sm:block" />

              <button 
                onClick={() => emulatorRef.current?.saveState()}
                className="flex items-center gap-2 px-3 py-2 bg-gray-900/50 border border-gray-800 hover:border-blue-500/50 hover:text-blue-400 rounded-xl text-[10px] font-black transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">SAVE</span>
              </button>
              
              <button 
                onClick={() => emulatorRef.current?.loadState()}
                className="flex items-center gap-2 px-3 py-2 bg-gray-900/50 border border-gray-800 hover:border-green-500/50 hover:text-green-400 rounded-xl text-[10px] font-black transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">LOAD</span>
              </button>

              <button 
                onClick={resetEmulator}
                className="flex items-center gap-2 px-3 py-2 bg-gray-900/50 border border-gray-800 hover:border-orange-500/50 hover:text-orange-400 rounded-xl text-[10px] font-black transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">RESET</span>
              </button>

              <button 
                onClick={toggleFullscreen}
                className="flex items-center gap-2 px-3 py-2 bg-gray-900/50 border border-gray-800 hover:border-white rounded-xl text-[10px] font-black text-gray-400 hover:text-white transition-all"
              >
                <Maximize className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">FULL</span>
              </button>
            </div>
          </footer>
          
          <SettingsModal 
            isOpen={isSettingsOpen} 
            onClose={() => setIsSettingsOpen(false)}
            settings={settings}
            updateSettings={updateSettings}
          />
        </>
      )}
    </div>
  );
};

export default App;
