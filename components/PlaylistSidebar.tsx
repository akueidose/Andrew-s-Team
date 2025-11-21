import React, { useEffect, useRef } from 'react';
import { X, PlayCircle, Film } from 'lucide-react';
import { VideoState } from '../types';

interface PlaylistSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  playlist: VideoState[];
  currentIndex: number;
  onSelect: (index: number) => void;
}

export const PlaylistSidebar: React.FC<PlaylistSidebarProps> = ({
  isOpen,
  onClose,
  playlist,
  currentIndex,
  onSelect,
}) => {
  const activeItemRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll to active item when sidebar opens or index changes
  useEffect(() => {
    if (isOpen && activeItemRef.current) {
      activeItemRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [isOpen, currentIndex]);

  return (
    <div
      className={`absolute inset-y-0 right-0 w-80 bg-zinc-900/95 backdrop-blur-md border-l border-zinc-800 shadow-2xl transform transition-transform duration-300 z-30 flex flex-col ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/50">
        <h2 className="text-zinc-100 font-semibold flex items-center gap-2 select-none">
          <Film size={18} className="text-orange-500" />
          <span>Playlist</span>
          <span className="text-xs text-zinc-500 font-mono px-2 py-0.5 bg-zinc-800 rounded-full">
            {currentIndex + 1}/{playlist.length}
          </span>
        </h2>
        <button 
          onClick={onClose} 
          className="text-zinc-400 hover:text-white p-1.5 rounded hover:bg-zinc-800 transition-colors"
          aria-label="Close playlist"
        >
          <X size={20} />
        </button>
      </div>
      
      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {playlist.map((video, index) => (
          <button
            key={index}
            ref={index === currentIndex ? activeItemRef : null}
            onClick={() => onSelect(index)}
            className={`w-full text-left p-3 rounded-lg group transition-all flex items-start gap-3 ${
              index === currentIndex 
                ? 'bg-orange-500/10 border border-orange-500/20' 
                : 'hover:bg-zinc-800 border border-transparent'
            }`}
          >
             <div className={`mt-0.5 flex-shrink-0 ${index === currentIndex ? 'text-orange-500' : 'text-zinc-600 group-hover:text-zinc-400'}`}>
                <PlayCircle size={16} fill={index === currentIndex ? "currentColor" : "none"} />
             </div>
             <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${index === currentIndex ? 'text-orange-400' : 'text-zinc-300 group-hover:text-zinc-100'}`}>
                  {video.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-600 bg-zinc-800/50 px-1.5 rounded">
                    {video.type.split('/')[1] || 'EXT'}
                  </span>
                </div>
             </div>
          </button>
        ))}
      </div>
    </div>
  );
};