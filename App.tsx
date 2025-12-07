import React, { useState, useEffect, useMemo } from 'react';
import SlotMachine from './components/SlotMachine';
import EliminationGame from './components/EliminationGame';
import OptionInput from './components/OptionInput';
import ModeToggle from './components/ModeToggle';
import { Option } from './types';
import { PASTEL_COLORS } from './utils/colors';

type GameMode = 'slot' | 'elimination';

const App: React.FC = () => {
  // Initial options with sequential colors
  const [options, setOptions] = useState<Option[]>([
    { id: '1', text: '선택지#1', weight: 1, color: PASTEL_COLORS[0] },
    { id: '2', text: '선택지#2', weight: 1, color: PASTEL_COLORS[1] },
    { id: '3', text: '선택지#3', weight: 1, color: PASTEL_COLORS[2] },
  ]);

  // Set default mode to 'elimination'
  const [mode, setMode] = useState<GameMode>('elimination');
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<Option | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Reset winner when options change so the slot machine goes back to "idle" state (no blur)
  // Also reset when mode changes to avoid showing previous results in the wrong mode
  useEffect(() => {
    setWinner(null);
    setShowResult(false);
  }, [options, mode]);

  // Memoize display options to prevent unnecessary re-initialization of SlotMachine
  const displayOptions = useMemo(() => {
    return options.map(o => ({...o, text: o.text.trim() === '' ? '???' : o.text}));
  }, [options]);

  // Weighted Random Logic
  const spin = () => {
    // Basic validation
    if (options.length < 2) {
      alert("최소 2개의 선택지가 필요합니다.");
      return;
    }
    const filledOptions = displayOptions;
    const totalWeight = filledOptions.reduce((sum, opt) => sum + (Number(opt.weight) || 0), 0);

    if (totalWeight <= 0) {
      alert("가중치의 합이 0보다 커야 합니다.");
      return;
    }

    // Reset states for new spin
    setShowResult(false);
    setIsSpinning(true);
    setWinner(null);

    // Calculate Winner immediately based on weights
    let random = Math.random() * totalWeight;
    let selectedOption = filledOptions[filledOptions.length - 1];

    for (const option of filledOptions) {
      const weight = Number(option.weight) || 0;
      if (random < weight) {
        selectedOption = option;
        break;
      }
      random -= weight;
    }

    setWinner(selectedOption);
  };

  const handleSpinEnd = () => {
    setIsSpinning(false);
    setShowResult(true);
    
    // Hide result effect after 5 seconds (only for slot machine mainly)
    if (mode === 'slot') {
      setTimeout(() => {
        setShowResult(false);
      }, 5000);
    }
  };

  const canSpin = options.length >= 2 && !isSpinning;

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col items-center py-8 px-4 sm:px-6">
      
      {/* Header */}
      <header className="mb-8 text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 tracking-tight break-keep">
          운명론적 대리결정 룰렛
        </h1>
        <p className="text-slate-400 text-sm">결정이 어려울 때는 운명에 맡겨보세요!</p>
      </header>

      <main className="w-full max-w-lg space-y-4">
        
        {/* Game Area */}
        {mode === 'slot' ? (
          <SlotMachine 
            options={displayOptions} 
            winner={winner} 
            isSpinning={isSpinning} 
            onSpinEnd={handleSpinEnd}
            showResultEffect={showResult}
          />
        ) : (
          <EliminationGame
            options={displayOptions}
            winner={winner}
            isSpinning={isSpinning}
            onSpinEnd={handleSpinEnd}
          />
        )}

        {/* Controls Container */}
        <div className="space-y-4">
           {/* Mode Toggle */}
           <ModeToggle mode={mode} setMode={setMode} disabled={isSpinning} />

          {/* Action Button */}
          <button
            onClick={spin}
            disabled={!canSpin}
            className={`
              w-full py-4 rounded-2xl font-black text-xl tracking-wide uppercase shadow-lg transition-all transform active:scale-95
              ${!canSpin 
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-purple-900/50 hover:shadow-purple-700/50'
              }
            `}
          >
            {isSpinning 
              ? (mode === 'slot' ? '돌아가는 중...' : '생존 경쟁 중...') 
              : '결정하기 (START!)'}
          </button>
        </div>

        {/* Inputs */}
        <div className="pt-4">
            <OptionInput 
            options={options} 
            setOptions={setOptions} 
            isSpinning={isSpinning} 
            />
        </div>

      </main>

      <footer className="mt-12 text-slate-600 text-xs text-center">
        © {new Date().getFullYear()} 운명론적 대리결정 룰렛. All probabilities are weighted.
      </footer>
    </div>
  );
};

export default App;