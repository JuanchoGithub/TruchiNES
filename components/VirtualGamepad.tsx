
import React from 'react';

interface VirtualGamepadProps {
  onButtonDown: (button: any) => void;
  onButtonUp: (button: any) => void;
}

export const VirtualGamepad: React.FC<VirtualGamepadProps> = ({ onButtonDown, onButtonUp }) => {
  const BUTTONS = window.jsnes.Controller;

  const handleTouch = (e: React.TouchEvent, button: any, isDown: boolean) => {
    e.preventDefault();
    if (isDown) onButtonDown(button);
    else onButtonUp(button);
  };

  const Btn = ({ label, button, className }: { label: string; button: any; className?: string }) => (
    <button
      className={`select-none touch-none active:scale-90 transition-transform flex items-center justify-center font-black text-white/40 border-2 border-white/10 rounded-full bg-white/5 backdrop-blur-md shadow-xl ${className}`}
      onTouchStart={(e) => handleTouch(e, button, true)}
      onTouchEnd={(e) => handleTouch(e, button, false)}
    >
      {label}
    </button>
  );

  return (
    <div className="lg:hidden fixed bottom-8 left-0 right-0 px-6 flex justify-between items-end pointer-events-none z-50">
      {/* D-PAD */}
      <div className="relative w-32 h-32 pointer-events-auto">
        <Btn label="↑" button={BUTTONS.BUTTON_UP} className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 rounded-lg" />
        <Btn label="↓" button={BUTTONS.BUTTON_DOWN} className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-12 rounded-lg" />
        <Btn label="←" button={BUTTONS.BUTTON_LEFT} className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-lg" />
        <Btn label="→" button={BUTTONS.BUTTON_RIGHT} className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-lg" />
      </div>

      {/* SELECT / START */}
      <div className="flex gap-4 mb-4 pointer-events-auto">
        <Btn label="SEL" button={BUTTONS.BUTTON_SELECT} className="w-14 h-8 rounded-full text-[10px]" />
        <Btn label="STA" button={BUTTONS.BUTTON_START} className="w-14 h-8 rounded-full text-[10px]" />
      </div>

      {/* A / B */}
      <div className="relative w-40 h-32 flex gap-4 items-center justify-end pointer-events-auto">
        <Btn label="B" button={BUTTONS.BUTTON_B} className="w-16 h-16 rounded-full text-xl bg-red-500/10 border-red-500/20" />
        <Btn label="A" button={BUTTONS.BUTTON_A} className="w-16 h-16 rounded-full text-xl bg-purple-500/10 border-purple-500/20 -translate-y-6" />
      </div>
    </div>
  );
};
