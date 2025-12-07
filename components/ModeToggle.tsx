import React from 'react';
import { RefreshCw, Zap } from 'lucide-react';

interface ModeToggleProps {
  mode: 'slot' | 'elimination';
  setMode: (mode: 'slot' | 'elimination') => void;
  disabled: boolean;
}

const ModeToggle: React.FC<ModeToggleProps> = ({ mode, setMode, disabled }) => {
  return (
    <div className="flex bg-slate-800 p-1 rounded-xl shadow-inner border border-slate-700 relative w-full mb-4">
      {/* Sliding Background */}
      <div 
        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-slate-600 rounded-lg shadow-sm transition-all duration-300 ease-out
          ${mode === 'slot' ? 'left-1' : 'left-[calc(50%+4px)]'}
        `}
      />

      <button
        onClick={() => !disabled && setMode('slot')}
        disabled={disabled}
        className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold z-10 transition-colors
          ${mode === 'slot' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}
        `}
      >
        <RefreshCw className="w-4 h-4" />
        심플모드
      </button>

      <button
        onClick={() => !disabled && setMode('elimination')}
        disabled={disabled}
        className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold z-10 transition-colors
          ${mode === 'elimination' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}
        `}
      >
        <Zap className="w-4 h-4" />
        생존모드
      </button>
    </div>
  );
};

export default ModeToggle;