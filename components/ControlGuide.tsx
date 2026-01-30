
import React from 'react';
import { Keyboard, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, CornerDownLeft } from 'lucide-react';

export const ControlGuide: React.FC = () => {
  const keys = [
    { label: 'D-Pad', keys: [<ArrowUp className="w-3 h-3" />, <ArrowDown className="w-3 h-3" />, <ArrowLeft className="w-3 h-3" />, <ArrowRight className="w-3 h-3" />], desc: 'Arrows' },
    { label: 'A', keys: ['Z'], desc: 'Jump' },
    { label: 'B', keys: ['X'], desc: 'Action' },
    { label: 'Start', keys: [<CornerDownLeft className="w-3 h-3" />], desc: 'Enter' },
    { label: 'Select', keys: ['Shift'], desc: 'Menu' },
  ];

  return (
    <div className="bg-gray-900/30 rounded-xl border border-gray-800/50 p-4 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 mb-4 text-gray-500">
        <Keyboard className="w-3.5 h-3.5" />
        <span className="text-[9px] font-black uppercase tracking-[0.2em]">Input Map</span>
      </div>
      
      <div className="space-y-4">
        {keys.map((k, i) => (
          <div key={i} className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{k.label}</span>
            <div className="flex gap-1">
              {k.keys.map((key, ki) => (
                <div key={ki} className="min-w-[24px] h-6 flex items-center justify-center bg-gray-800 border-b-2 border-black rounded text-[9px] font-black text-white shadow-md">
                  {key}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
