import React from 'react';
import { X, Sparkles } from 'lucide-react';
import { AnalysisResult } from '../types';

interface AnalysisOverlayProps {
  result: AnalysisResult | null;
  onClose: () => void;
}

export const AnalysisOverlay: React.FC<AnalysisOverlayProps> = ({ result, onClose }) => {
  if (!result) return null;

  return (
    <div className="absolute top-4 right-4 z-50 animate-fade-in">
      <div className="bg-zinc-900/90 backdrop-blur-md border border-orange-500/30 rounded-lg shadow-2xl p-4 w-80 text-left">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-orange-500 font-bold uppercase text-xs tracking-widest">
            <Sparkles size={14} />
            <span>Gemini Insight</span>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white">
            <X size={16} />
          </button>
        </div>
        <p className="text-zinc-200 text-sm leading-relaxed font-light">
          {result.text}
        </p>
        <div className="mt-3 pt-2 border-t border-zinc-800 text-[10px] text-zinc-500 font-mono">
          Frame Timestamp: {result.timestamp.toFixed(2)}s
        </div>
      </div>
    </div>
  );
};