import React from 'react';
import { Option } from '../types';
import { X, Sparkles, RefreshCw } from 'lucide-react';

interface ResultModalProps {
  winner: Option;
  onClose: () => void;
  onRespin: () => void;
}

const ResultModal: React.FC<ResultModalProps> = ({ winner, onClose, onRespin }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fadeIn" onClick={onClose}></div>
      <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center animate-bounceIn">
        
        {/* Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-[1.6rem] blur opacity-30 -z-10"></div>
        
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>

        <div className="mb-6 flex justify-center">
          <div className="p-4 bg-yellow-500/10 rounded-full ring-4 ring-yellow-500/30">
            <Sparkles className="w-12 h-12 text-yellow-400 animate-pulse" />
          </div>
        </div>

        <h3 className="text-slate-400 font-medium mb-2 uppercase tracking-widest text-xs">운명의 결정은</h3>
        <h2 
          className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-white to-yellow-300 mb-8 break-words leading-tight"
          style={{ textShadow: '0 4px 20px rgba(250, 204, 21, 0.2)' }}
        >
          {winner.text}
        </h2>

        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold transition-all"
          >
            확인
          </button>
          <button 
            onClick={onRespin}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold shadow-lg shadow-purple-500/30 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            다시 돌리기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultModal;