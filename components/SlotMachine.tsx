import React, { useEffect, useRef, useState } from 'react';
import { Option } from '../types';

interface SlotMachineProps {
  options: Option[];
  winner: Option | null;
  isSpinning: boolean;
  onSpinEnd: () => void;
  showResultEffect: boolean;
}

const ITEM_HEIGHT = 80; // height in pixels of each slot item
const REEL_REPEAT = 30; // How many times to repeat the list for the illusion of length

const SlotMachine: React.FC<SlotMachineProps> = ({ options, winner, isSpinning, onSpinEnd, showResultEffect }) => {
  const reelRef = useRef<HTMLDivElement>(null);
  const [reelList, setReelList] = useState<Option[]>([]);
  const [translateY, setTranslateY] = useState(0);
  const [transitionDuration, setTransitionDuration] = useState(0);
  const [isResetting, setIsResetting] = useState(false);

  // Initialize the visual reel
  useEffect(() => {
    // We create a long list of options to simulate the wheel
    let initialList: Option[] = [];
    const loops = 5; // Ensure enough context for initial view
    for (let i = 0; i < loops; i++) {
        initialList = [...initialList, ...options];
    }
    setReelList(initialList);
    
    // Start at the second iteration of options so we have items "above" the current one (at index 0)
    // This fills the top slot.
    setTranslateY(-(options.length * ITEM_HEIGHT));
  }, [options]);

  useEffect(() => {
    if (isSpinning && winner) {
      // 1. Construct a "Spinning" Reel
      // We want the winner to land somewhere deep in the list so it spins for a while.
      
      const winnerIndexInOptions = options.findIndex(o => o.id === winner.id);
      
      // Re-build a very long list for the animation
      let animationList: Option[] = [];
      for(let i=0; i < REEL_REPEAT; i++) {
        animationList = [...animationList, ...options];
      }

      // Calculate target index
      // We aim for a position near the end.
      const targetIteration = REEL_REPEAT - 3; 
      const targetIndex = (targetIteration * options.length) + winnerIndexInOptions;

      setReelList(animationList);
      
      // 2. Reset Position (Instant)
      // Reset to 'full' view start position (second iteration start) to ensure top slot is filled
      const startOffset = options.length * ITEM_HEIGHT;

      setTransitionDuration(0);
      setTranslateY(-startOffset);
      setIsResetting(true);

      // 3. Trigger Animation (Next Frame)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsResetting(false);
          const targetY = -(targetIndex * ITEM_HEIGHT);
          
          // Add some randomness to the duration for realism
          const duration = 3 + Math.random() * 0.5; // 3.0s - 3.5s
          
          setTransitionDuration(duration);
          setTranslateY(targetY);

          // 4. Callback when done
          setTimeout(() => {
            onSpinEnd();
          }, duration * 1000);
        });
      });
    }
  }, [isSpinning, winner, options, onSpinEnd]);

  // Determine if blur effects should be visible
  // Apply blur only when spinning. Once stopped, it should be clear.
  const shouldBlur = isSpinning;

  return (
    <div className="relative w-full max-w-md mx-auto mb-8">
      {/* Machine Case */}
      <div className="bg-gradient-to-b from-yellow-600 via-yellow-400 to-yellow-600 p-3 rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(234,179,8,0.5)] border-2 border-yellow-700">
        <div className="bg-slate-900 rounded-[1.5rem] border-4 border-slate-800 overflow-hidden relative h-[240px]">
          
          {/* Top Blur Overlay (Normal state) */}
          <div 
            className={`absolute top-0 left-0 right-0 h-[80px] z-20 pointer-events-none bg-gradient-to-b from-slate-900/95 to-slate-900/20 backdrop-blur-[2px] transition-opacity duration-500 ${shouldBlur ? 'opacity-100' : 'opacity-0'}`}
          ></div>

          {/* Top Text Overlay (Result state) */}
          <div className={`absolute top-0 left-0 right-0 h-[80px] z-40 flex items-center justify-center bg-slate-900/90 transition-opacity duration-500 ${showResultEffect ? 'opacity-100' : 'opacity-0'}`}>
            <span className="text-xl font-black text-yellow-100/90 tracking-wide drop-shadow-md text-center px-2 break-keep">운명론적 결과는</span>
          </div>

          {/* Bottom Blur Overlay (Normal state) */}
          <div 
            className={`absolute bottom-0 left-0 right-0 h-[80px] z-20 pointer-events-none bg-gradient-to-t from-slate-900/95 to-slate-900/20 backdrop-blur-[2px] transition-opacity duration-500 ${shouldBlur ? 'opacity-100' : 'opacity-0'}`}
          ></div>

          {/* Bottom Text Overlay (Result state) */}
          <div className={`absolute bottom-0 left-0 right-0 h-[80px] z-40 flex items-center justify-center bg-slate-900/90 transition-opacity duration-500 ${showResultEffect ? 'opacity-100' : 'opacity-0'}`}>
            <span className="text-xl font-black text-yellow-100/90 tracking-wide drop-shadow-md">입니다!</span>
          </div>
          
          {/* Center Highlight Line (Selected item) - Twinkle effect when result is shown */}
          <div className={`absolute top-1/2 left-0 right-0 h-[84px] -mt-[42px] z-30 border-y-[3px] 
            ${showResultEffect 
              ? 'border-yellow-300 bg-yellow-400/20 shadow-[0_0_50px_rgba(250,204,21,0.5)] animate-pulse' 
              : 'border-yellow-400/80 bg-gradient-to-r from-transparent via-yellow-400/5 to-transparent shadow-[0_0_30px_rgba(250,204,21,0.15)]'
            } 
            pointer-events-none transition-all duration-300`}></div>
          
          {/* Side Indicators */}
          <div className="absolute top-1/2 -left-2 -mt-3 w-0 h-0 border-l-[12px] border-r-0 border-y-[12px] border-l-red-500 border-y-transparent z-40 drop-shadow-lg"></div>
          <div className="absolute top-1/2 -right-2 -mt-3 w-0 h-0 border-r-[12px] border-l-0 border-y-[12px] border-r-red-500 border-y-transparent z-40 drop-shadow-lg"></div>

          {/* The Reel */}
          <div 
            ref={reelRef}
            className="w-full flex flex-col items-center"
            style={{
              // translateY(80px) moves the list down by one slot height.
              // Combined with our initial translateY, this positions the target item in the middle,
              // and ensures items exist above (0px) and below (160px).
              transform: `translate3d(0, ${translateY}px, 0) translateY(80px)`, 
              transition: isResetting ? 'none' : `transform ${transitionDuration}s cubic-bezier(0.15, 0.85, 0.35, 1.0)`,
            }}
          >
            {reelList.map((option, idx) => (
              <div 
                key={`${option.id}-${idx}`}
                style={{ height: `${ITEM_HEIGHT}px` }}
                className="w-full flex items-center justify-center px-4"
              >
                <div 
                  className="w-full h-[60px] rounded-xl flex items-center justify-center gap-3 shadow-lg border border-white/10"
                  style={{ backgroundColor: `${option.color}20` }} // 20 hex = low opacity
                >
                  <div 
                    className="w-3 h-3 rounded-full shadow-sm"
                    style={{ backgroundColor: option.color }}
                  ></div>
                  <span className="text-xl font-bold text-white truncate max-w-[80%]">
                    {option.text || "???"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Decorative Base */}
      <div className="h-4 mx-10 bg-slate-800 rounded-b-xl -mt-2 opacity-80"></div>
    </div>
  );
};

export default SlotMachine;