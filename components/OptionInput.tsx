import React, { useCallback, useState } from 'react';
import { Option } from '../types';
import { Plus, Trash2, Dices, Info } from 'lucide-react';
import { PASTEL_COLORS } from '../utils/colors';

interface OptionInputProps {
  options: Option[];
  setOptions: React.Dispatch<React.SetStateAction<Option[]>>;
  isSpinning: boolean;
}

const OptionInput: React.FC<OptionInputProps> = ({ options, setOptions, isSpinning }) => {
  const [showInfo, setShowInfo] = useState(false);
  
  const addOption = useCallback(() => {
    setOptions(prev => {
      // Find the color index of the last option to determine the next color
      const lastOption = prev[prev.length - 1];
      let nextColorIndex = 0;
      
      if (lastOption) {
        const lastIndex = PASTEL_COLORS.indexOf(lastOption.color);
        if (lastIndex !== -1) {
          nextColorIndex = (lastIndex + 1) % PASTEL_COLORS.length;
        } else {
          // If the last color isn't in our palette (fallback), use length logic
          nextColorIndex = prev.length % PASTEL_COLORS.length;
        }
      }

      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          text: '',
          weight: 1,
          color: PASTEL_COLORS[nextColorIndex]
        }
      ];
    });
  }, [setOptions]);

  const removeOption = useCallback((id: string) => {
    if (options.length <= 2) {
      alert("최소 2개의 선택지가 필요합니다.");
      return;
    }
    setOptions(prev => prev.filter(o => o.id !== id));
  }, [options.length, setOptions]);

  const updateOption = useCallback((id: string, field: keyof Option, value: string | number) => {
    setOptions(prev => prev.map(o => {
      if (o.id === id) {
        return { ...o, [field]: value };
      }
      return o;
    }));
  }, [setOptions]);

  const totalWeight = options.reduce((sum, opt) => sum + (Number(opt.weight) || 0), 0);

  return (
    <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-slate-700 shadow-xl max-h-[400px] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Dices className="w-5 h-5 text-purple-400" />
            선택지 설정
          </h2>
          <button 
            onClick={() => setShowInfo(prev => !prev)}
            className="text-slate-500 hover:text-purple-400 transition-colors p-1 rounded-full hover:bg-white/5"
            aria-label="가중치 도움말"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
        <span className="text-xs text-slate-400">총 가중치: {totalWeight}</span>
      </div>

      {showInfo && (
        <div className="mb-4 bg-slate-700/50 border border-slate-600 p-3 rounded-xl text-xs text-slate-300 leading-relaxed animate-fadeIn">
          선택지마다 원하는 수치의 가중치를 설정할 수 있습니다. 가중치가 높을수록 해당 선택지의 당선 확률이 높아집니다.
          <br/>
          <span className="text-slate-400 italic mt-1 block">ex:) 이 선택지의 가중치를 3000만큼 해야지.</span>
        </div>
      )}

      <div className="space-y-3">
        {options.map((option, index) => {
          const probability = totalWeight > 0 ? ((option.weight / totalWeight) * 100).toFixed(1) : 0;
          
          return (
            <div key={option.id} className="flex gap-2 items-center animate-fadeIn">
              <div 
                className="w-3 h-10 rounded-full shrink-0" 
                style={{ backgroundColor: option.color }} 
              />
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => updateOption(option.id, 'text', e.target.value)}
                  placeholder={`선택지 ${index + 1}`}
                  disabled={isSpinning}
                  className="w-full bg-slate-900/80 text-white border border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none text-sm transition-all"
                />
              </div>
              <div className="w-20 relative">
                <input
                  type="number"
                  min="0"
                  value={option.weight}
                  onChange={(e) => updateOption(option.id, 'weight', Math.max(0, Number(e.target.value)))}
                  disabled={isSpinning}
                  className="w-full bg-slate-900/80 text-right text-white border border-slate-600 rounded-lg px-2 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono"
                />
                <span className="absolute -top-3 right-1 text-[10px] text-slate-400 bg-slate-800 px-1 rounded">
                  {probability}%
                </span>
              </div>
              <button
                onClick={() => removeOption(option.id)}
                disabled={isSpinning || options.length <= 2}
                className="p-2 text-slate-400 hover:text-red-400 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          );
        })}
      </div>

      <button
        onClick={addOption}
        disabled={isSpinning}
        className="w-full mt-4 py-3 rounded-xl border border-dashed border-slate-500 text-slate-400 hover:text-white hover:border-slate-300 hover:bg-slate-700/30 transition-all flex justify-center items-center gap-2"
      >
        <Plus className="w-5 h-5" />
        선택지 추가하기
      </button>
    </div>
  );
};

export default OptionInput;