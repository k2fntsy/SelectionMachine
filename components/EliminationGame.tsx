import React, { useEffect, useState, useRef } from 'react';
import { Option } from '../types';

interface EliminationGameProps {
  options: Option[];
  winner: Option | null;
  isSpinning: boolean;
  onSpinEnd: () => void;
}

type GamePhase = 'idle' | 'intro' | 'elimination' | 'celebrating';

const EliminationGame: React.FC<EliminationGameProps> = ({ options, winner, isSpinning, onSpinEnd }) => {
  const [eliminatedIds, setEliminatedIds] = useState<Set<string>>(new Set());
  const eliminatedIdsRef = useRef<Set<string>>(new Set()); // For sync access in intervals

  const [gamePhase, setGamePhase] = useState<GamePhase>('idle');
  const [spotlightId, setSpotlightId] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false); // true when shaking before drop
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset state
  useEffect(() => {
    if (!isSpinning && gamePhase !== 'celebrating') {
      setGamePhase('idle');
      setEliminatedIds(new Set());
      eliminatedIdsRef.current = new Set();
      setSpotlightId(null);
      setIsLocked(false);
    }
  }, [isSpinning, options, gamePhase]);

  // Main Logic
  useEffect(() => {
    if (isSpinning && winner) {
      setEliminatedIds(new Set());
      eliminatedIdsRef.current = new Set();
      setGamePhase('intro');
      
      // Calculate losers order ahead of time
      const losers = options.filter(o => o.id !== winner.id);
      const sortedLosers = [...losers].sort((a, b) => {
          const weightA = a.weight + (Math.random() * 0.5); 
          const weightB = b.weight + (Math.random() * 0.5);
          return weightA - weightB; 
      });

      const loserIds = sortedLosers.map(o => o.id);
      const totalLosers = loserIds.length;

      // --- Helper to pick a random survivor for visual noise ---
      const pickRandomSurvivor = () => {
        const survivors = options.filter(o => !eliminatedIdsRef.current.has(o.id));
        if (survivors.length > 0) {
          // Avoid picking the same one twice in a row if possible
          setSpotlightId(prev => {
            let candidates = survivors;
            if (survivors.length > 1) {
              candidates = survivors.filter(s => s.id !== prev);
            }
            const random = candidates[Math.floor(Math.random() * candidates.length)];
            return random.id;
          });
        }
      };

      // --- Recursive Elimination Function ---
      const processNextElimination = (index: number) => {
        const victimId = loserIds[index];

        // 1. ROAMING Phase (0s ~ 1.5s)
        // Switch spotlight to create "Pong Pong" rhythm
        setIsLocked(false);
        // Interval set to 160ms for a rhythmic "beat" (approx 375 BPM eighth notes)
        const roamInterval = setInterval(pickRandomSurvivor, 160); 

        // 2. LOCK Phase (At 1.5s)
        setTimeout(() => {
          clearInterval(roamInterval);
          setSpotlightId(victimId); // Force spotlight on victim
          setIsLocked(true);        // Trigger shake animation
        }, 1500);

        // 3. DROP Phase (At 2.0s)
        setTimeout(() => {
          // Mark as eliminated
          setEliminatedIds(prev => {
             const newSet = new Set(prev);
             newSet.add(victimId);
             return newSet;
          });
          eliminatedIdsRef.current.add(victimId);
          
          setIsLocked(false);
          setSpotlightId(null);

          // Check if this was the last loser
          if (index === totalLosers - 1) {
            // IMMEDIATE Celebration: No delay, just transition
            setGamePhase('celebrating');
            onSpinEnd();
          } else {
            // IMMEDIATE Next Round: No delay
            processNextElimination(index + 1);
          }
        }, 2000);
      };

      // --- Sequence Start ---
      
      // 1. Intro Phase: Just roam
      const introInterval = setInterval(pickRandomSurvivor, 160);
      
      const startTimeout = setTimeout(() => {
        clearInterval(introInterval);
        setGamePhase('elimination');
        // Start the elimination loop
        processNextElimination(0);
      }, 2000);

      return () => {
        clearInterval(introInterval);
        clearTimeout(startTimeout);
      };
    }
  }, [isSpinning, winner]);

  // Style Calculator
  const getCardStyle = (option: Option) => {
    const isWinner = winner?.id === option.id;
    const isEliminated = eliminatedIds.has(option.id);
    const isSpotlight = spotlightId === option.id;
    
    // 1. Celebration (Winner centered)
    if (gamePhase === 'celebrating' && isWinner) {
      return {
        position: 'absolute' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%) scale(1.1)',
        zIndex: 50,
        opacity: 1,
        transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        width: '45%',
        boxShadow: `0 0 30px ${option.color}`,
      };
    }

    // 2. Eliminated (Drop Animation)
    if (isEliminated) {
      return {
        // Fall down with rotation
        transform: 'translate3d(0, 500px, 0) rotate(45deg)', 
        opacity: 0,
        // Faster drop (0.5s) for weight, ensure transition is explicit
        transition: 'transform 0.5s cubic-bezier(0.55, 0.085, 0.68, 0.53), opacity 0.5s ease-in', 
        pointerEvents: 'none' as const,
        filter: 'grayscale(100%)',
        zIndex: 40, // Ensure it drops ON TOP of others, not behind
      };
    }

    // 3. Active Phase (Intro or Elimination)
    if ((gamePhase === 'intro' || gamePhase === 'elimination') && !isEliminated) {
      if (isSpotlight) {
        if (isLocked) {
          // LOCKED state: Intense shaking
          return {
            transform: 'scale(1.05)',
            zIndex: 30,
            boxShadow: `0 0 30px ${option.color}, inset 0 0 20px rgba(255,0,0,0.5)`,
            borderColor: '#fca5a5',
            animation: 'shake 0.1s ease-in-out infinite',
            transition: 'all 0.1s',
          };
        } else {
          // ROAMING state: "Pong" effect (Bouncy scale)
          return {
            transform: 'scale(1.1)',
            zIndex: 20,
            boxShadow: `0 0 20px ${option.color}`,
            borderColor: '#fff',
            // Bouncy bezier for the "Pong" feel
            transition: 'transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.15s ease',
          };
        }
      } else {
        // Dim others
        return {
          opacity: 0.5,
          transform: 'scale(0.95)',
          transition: 'all 0.2s ease-out',
        };
      }
    }

    // 4. Idle State
    return {
        transition: 'all 0.3s ease-out',
        transform: 'translate3d(0,0,0)',
        zIndex: 1,
    };
  };

  return (
    <div className="w-full max-w-md mx-auto mb-8 flex flex-col justify-center min-h-[360px]">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <div 
        ref={containerRef}
        className="relative bg-slate-900/50 rounded-2xl border border-slate-700 overflow-hidden shadow-inner h-[360px] p-4 flex flex-col"
      >
        
        {/* Background Overlay for Winner */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0 transition-opacity duration-1000 ${gamePhase === 'celebrating' ? 'opacity-100' : 'opacity-0'}`}>
           <span className="text-yellow-400 font-bold text-lg mb-20 animate-bounce">운명론적 결과는</span>
           <span className="text-white font-bold text-lg mt-20 animate-pulse">입니다!</span>
           <div className="absolute inset-0 bg-yellow-500/10 blur-xl rounded-full scale-75 animate-pulse"></div>
        </div>

        {/* Status Header */}
        <div className="text-center mb-4 shrink-0 transition-opacity duration-300" style={{ opacity: gamePhase === 'celebrating' ? 0 : 1 }}>
          <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider">
            {gamePhase === 'intro' && "어떤 것을 선택할까요..."}
            {gamePhase === 'elimination' && `생존 경쟁 중! (${options.length - eliminatedIds.size}종 남음)`}
            {gamePhase === 'idle' && `선택지 배틀 로얄 대기 중 (${options.length}종)`}
          </h3>
        </div>

        {/* Grid List */}
        <div className="grid grid-cols-2 gap-3 content-start overflow-y-auto hide-scrollbar h-full pb-10">
          {options.map((option) => (
            <div
              key={option.id}
              className={`
                relative flex items-center p-3 rounded-xl border shadow-lg backface-hidden
                ${gamePhase === 'idle' ? 'bg-slate-800 border-white/10' : 'bg-slate-800 border-white/30'}
              `}
              style={getCardStyle(option)}
            >
              <div 
                className="w-3 h-3 rounded-full mr-3 shrink-0 transition-all duration-300"
                style={{ backgroundColor: option.color }}
              />
              <span className="text-white font-bold text-sm truncate flex-1 transition-all duration-300">
                {option.text || "???"}
              </span>

              {/* White Overlay Flash for Spotlight */}
              {spotlightId === option.id && !eliminatedIds.has(option.id) && (
                 <div className={`absolute inset-0 bg-white/20 rounded-xl pointer-events-none ${isLocked ? 'bg-red-500/20' : ''}`}></div>
              )}
            </div>
          ))}

          {options.length === 0 && (
            <div className="col-span-2 text-slate-500 text-center py-10">
                선택지를 추가해주세요
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default EliminationGame;