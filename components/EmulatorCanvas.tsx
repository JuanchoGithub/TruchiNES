
import React, { useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';

interface EmulatorCanvasProps {
  romData: string;
  settings: {
    speed: number;
    shader: 'none' | 'crt' | 'monochrome' | 'vivid';
    palette: 'original' | 'fceux' | 'nes-classic';
    audioGain: number;
  };
}

export interface EmulatorHandle {
  saveState: () => void;
  loadState: () => void;
  pressButton: (btn: any) => void;
  releaseButton: (btn: any) => void;
}

export const EmulatorCanvas = forwardRef<EmulatorHandle, EmulatorCanvasProps>(({ romData, settings }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nesRef = useRef<any>(null);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioGainNodeRef = useRef<GainNode | null>(null);
  const scriptNodeRef = useRef<ScriptProcessorNode | null>(null);
  const frameIdRef = useRef<number>(0);
  
  const SAMPLE_COUNT = 16384;
  const audioBufferRef = useRef<{ left: Float32Array; right: Float32Array; writePos: number; readPos: number }>({
    left: new Float32Array(SAMPLE_COUNT),
    right: new Float32Array(SAMPLE_COUNT),
    writePos: 0,
    readPos: 0
  });

  const SAMPLE_RATE = 44100;
  const NTSC_FPS = 60.098;
  const FRAME_DURATION = 1000 / NTSC_FPS;

  const resetAudioBuffer = useCallback(() => {
    const buffer = audioBufferRef.current;
    buffer.left.fill(0);
    buffer.right.fill(0);
    buffer.writePos = 0;
    buffer.readPos = 0;
  }, []);

  const handleAudioProcess = useCallback((event: AudioProcessingEvent) => {
    const left = event.outputBuffer.getChannelData(0);
    const right = event.outputBuffer.getChannelData(1);
    const buffer = audioBufferRef.current;

    for (let i = 0; i < left.length; i++) {
      if (buffer.readPos === buffer.writePos) {
        left[i] = 0;
        right[i] = 0;
      } else {
        left[i] = buffer.left[buffer.readPos];
        right[i] = buffer.right[buffer.readPos];
        buffer.readPos = (buffer.readPos + 1) % SAMPLE_COUNT;
      }
    }
  }, []);

  const initAudio = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass({ sampleRate: SAMPLE_RATE });
        
        audioGainNodeRef.current = audioCtxRef.current.createGain();
        audioGainNodeRef.current.gain.value = settings.audioGain;
        
        scriptNodeRef.current = audioCtxRef.current.createScriptProcessor(2048, 0, 2);
        scriptNodeRef.current.onaudioprocess = handleAudioProcess;
        
        scriptNodeRef.current.connect(audioGainNodeRef.current);
        audioGainNodeRef.current.connect(audioCtxRef.current.destination);
      }

      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      if (audioGainNodeRef.current) {
        audioGainNodeRef.current.gain.setTargetAtTime(settings.audioGain, audioCtxRef.current.currentTime, 0.05);
      }
    } catch (err) {
      console.error("Audio init error:", err);
    }
  }, [settings.audioGain, handleAudioProcess]);

  useImperativeHandle(ref, () => ({
    saveState: () => {
      if (!nesRef.current) return;
      const state = nesRef.current.toJSON();
      localStorage.setItem('nes_save_state', JSON.stringify(state));
    },
    loadState: () => {
      if (!nesRef.current) return;
      const saved = localStorage.getItem('nes_save_state');
      if (saved) {
        try {
          initAudio();
          resetAudioBuffer();
          nesRef.current.fromJSON(JSON.parse(saved));
        } catch (e) { console.error("Load failed:", e); }
      }
    },
    pressButton: (btn) => {
      initAudio();
      nesRef.current?.buttonDown(1, btn);
    },
    releaseButton: (btn) => {
        if(btn === null) {
            // Clear all buttons
            for(let i=0; i<8; i++) nesRef.current?.buttonUp(1, i);
            return;
        }
        nesRef.current?.buttonUp(1, btn);
    }
  }));

  const writeAudio = useCallback((samples: { left: number; right: number }) => {
    const buffer = audioBufferRef.current;
    buffer.left[buffer.writePos] = samples.left;
    buffer.right[buffer.writePos] = samples.right;
    buffer.writePos = (buffer.writePos + 1) % SAMPLE_COUNT;
    
    if (buffer.writePos === buffer.readPos) {
      buffer.readPos = (buffer.readPos + 1) % SAMPLE_COUNT;
    }
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.createImageData(256, 240);
    const buf = new Uint32Array(imageData.data.buffer);

    const nes = new window.jsnes.NES({
      onFrame: (frameBuffer: number[]) => {
        for (let i = 0; i < 256 * 240; i++) {
          buf[i] = 0xFF000000 | frameBuffer[i];
        }
        ctx.putImageData(imageData, 0, 0);
      },
      onAudioSample: (left: number, right: number) => {
        writeAudio({ left, right });
      },
      sampleRate: SAMPLE_RATE
    });

    nesRef.current = nes;
    nes.loadROM(romData);

    const handleKeyDown = (e: KeyboardEvent) => {
      initAudio(); 
      switch (e.key.toLowerCase()) {
        case 'arrowup': nes.buttonDown(1, window.jsnes.Controller.BUTTON_UP); break;
        case 'arrowdown': nes.buttonDown(1, window.jsnes.Controller.BUTTON_DOWN); break;
        case 'arrowleft': nes.buttonDown(1, window.jsnes.Controller.BUTTON_LEFT); break;
        case 'arrowright': nes.buttonDown(1, window.jsnes.Controller.BUTTON_RIGHT); break;
        case 'z': nes.buttonDown(1, window.jsnes.Controller.BUTTON_A); break;
        case 'x': nes.buttonDown(1, window.jsnes.Controller.BUTTON_B); break;
        case 'enter': nes.buttonDown(1, window.jsnes.Controller.BUTTON_START); break;
        case 'shift': nes.buttonDown(1, window.jsnes.Controller.BUTTON_SELECT); break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'arrowup': nes.buttonUp(1, window.jsnes.Controller.BUTTON_UP); break;
        case 'arrowdown': nes.buttonUp(1, window.jsnes.Controller.BUTTON_DOWN); break;
        case 'arrowleft': nes.buttonUp(1, window.jsnes.Controller.BUTTON_LEFT); break;
        case 'arrowright': nes.buttonUp(1, window.jsnes.Controller.BUTTON_RIGHT); break;
        case 'z': nes.buttonUp(1, window.jsnes.Controller.BUTTON_A); break;
        case 'x': nes.buttonUp(1, window.jsnes.Controller.BUTTON_B); break;
        case 'enter': nes.buttonUp(1, window.jsnes.Controller.BUTTON_START); break;
        case 'shift': nes.buttonUp(1, window.jsnes.Controller.BUTTON_SELECT); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    let lastTime = performance.now();
    let accumulator = 0;

    const run = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;
      
      const cappedDelta = Math.min(delta, 100);
      accumulator += cappedDelta;

      const targetFrameTime = FRAME_DURATION / settings.speed;

      while (accumulator >= targetFrameTime) {
        nes.frame();
        accumulator -= targetFrameTime;
      }
      
      frameIdRef.current = requestAnimationFrame(run);
    };
    
    frameIdRef.current = requestAnimationFrame(run);

    return () => {
      cancelAnimationFrame(frameIdRef.current);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
        scriptNodeRef.current = null;
        audioGainNodeRef.current = null;
      }
    };
  }, [romData, writeAudio, initAudio, settings.speed]);

  const getFilterStyle = () => {
    let filters = [];
    if (settings.shader === 'monochrome') filters.push('grayscale(100%) contrast(150%)');
    if (settings.shader === 'vivid') filters.push('saturate(180%) contrast(110%)');
    if (settings.palette === 'fceux') filters.push('hue-rotate(-5deg) contrast(105%)');
    if (settings.palette === 'nes-classic') filters.push('saturate(120%) brightness(105%)');
    return filters.join(' ');
  };

  return (
    <div 
      className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden shadow-2xl"
    >
      <canvas 
        ref={canvasRef} 
        width={256} 
        height={240} 
        className="w-full h-full object-contain max-h-full max-w-full"
        style={{ 
          imageRendering: 'pixelated',
          filter: getFilterStyle()
        }}
      />
      {settings.shader === 'crt' && <div className="crt-overlay" />}
    </div>
  );
});
