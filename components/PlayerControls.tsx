import React, { useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Aperture, Check, SkipBack, SkipForward, List } from 'lucide-react';
import { PlayerState, GeminiStatus } from '../types';

interface PlayerControlsProps {
  state: PlayerState;
  onPlayPause: () => void;
  onVolumeChange: (val: number) => void;
  onToggleMute: () => void;
  onSeek: (val: number) => void;
  onToggleFullscreen: () => void;
  onPlaybackRateChange: (val: number) => void;
  onAnalyze: () => void;
  geminiStatus: GeminiStatus;
  fileName: string;
  onNext: () => void;
  onPrevious: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
  onTogglePlaylist: () => void;
  isPlaylistOpen: boolean;
}

const formatTime = (seconds: number) => {
  if (!seconds) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const PlayerControls: React.FC<PlayerControlsProps> = ({
  state,
  onPlayPause,
  onVolumeChange,
  onToggleMute,
  onSeek,
  onToggleFullscreen,
  onPlaybackRateChange,
  onAnalyze,
  geminiStatus,
  fileName,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious,
  onTogglePlaylist,
  isPlaylistOpen
}) => {
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const playbackRates = [0.25, 0.5, 1, 1.25, 1.5, 2];

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-4 pb-4 pt-12 transition-opacity duration-200">
      {/* Seek Bar */}
      <div className="group relative h-2 bg-zinc-600 rounded cursor-pointer mb-4 w-full">
        <div 
          className="absolute h-full bg-orange-500 rounded pointer-events-none"
          style={{ width: `${(state.currentTime / state.duration) * 100}%` }}
        />
        <input
          type="range"
          min={0}
          max={state.duration || 100}
          value={state.currentTime}
          onChange={(e) => onSeek(Number(e.target.value))}
          className="absolute w-full h-full opacity-0 cursor-pointer z-10"
          aria-label="Seek"
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Transport Controls */}
          <div className="flex items-center gap-6">
            <button 
              onClick={onPrevious} 
              disabled={!hasPrevious}
              className="text-zinc-300 hover:text-white disabled:text-zinc-700 disabled:cursor-not-allowed transition-colors p-1"
              title="Previous File (Shift+P)"
              aria-label="Previous File"
            >
              <SkipBack size={22} fill="currentColor" />
            </button>
            
            <button 
              onClick={onPlayPause}
              className="text-white hover:text-orange-500 transition-colors focus:outline-none transform hover:scale-105 active:scale-95"
              title="Play/Pause (Space)"
              aria-label="Play/Pause"
            >
              {state.isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
            </button>

            <button 
              onClick={onNext} 
              disabled={!hasNext}
              className="text-zinc-300 hover:text-white disabled:text-zinc-700 disabled:cursor-not-allowed transition-colors p-1"
              title="Next File (Shift+N)"
              aria-label="Next File"
            >
              <SkipForward size={22} fill="currentColor" />
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2 group ml-2">
            <button onClick={onToggleMute} className="text-zinc-300 hover:text-white" aria-label="Toggle Mute">
              {state.isMuted || state.volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={state.isMuted ? 0 : state.volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="w-20 h-1 bg-zinc-600 rounded-lg appearance-none cursor-pointer accent-orange-500"
              aria-label="Volume"
            />
          </div>

          {/* Time */}
          <div className="text-sm font-mono text-zinc-300 select-none hidden sm:block">
            {formatTime(state.currentTime)} / {formatTime(state.duration)}
          </div>
        </div>

        {/* Filename (Center-ish) */}
        <div className="hidden lg:block text-zinc-400 text-sm truncate max-w-[200px]">
          {fileName}
        </div>

        <div className="flex items-center gap-3">
          {/* Playback Speed */}
          <div className="relative">
            <button
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className="text-zinc-300 hover:text-white font-mono text-xs font-bold px-2 py-1 rounded hover:bg-zinc-800 transition-colors w-12"
              title="Playback Speed"
            >
              {state.playbackRate}x
            </button>
            {showSpeedMenu && (
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl py-1 min-w-[80px] overflow-hidden z-50">
                {playbackRates.map(rate => (
                  <button
                    key={rate}
                    onClick={() => {
                      onPlaybackRateChange(rate);
                      setShowSpeedMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs hover:bg-zinc-800 flex items-center justify-between ${state.playbackRate === rate ? 'text-orange-500 font-bold' : 'text-zinc-300'}`}
                  >
                    <span>{rate}x</span>
                    {state.playbackRate === rate && <Check size={12} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Gemini AI Analysis Button */}
          <button 
            onClick={onAnalyze}
            disabled={geminiStatus === GeminiStatus.ANALYZING}
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all 
              ${geminiStatus === GeminiStatus.ANALYZING ? 'bg-orange-500/20 text-orange-500 cursor-wait' : 'bg-zinc-800 text-zinc-400 hover:bg-orange-600 hover:text-white'}
            `}
            title="Analyze current frame with Gemini"
          >
            <Aperture size={16} className={geminiStatus === GeminiStatus.ANALYZING ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">{geminiStatus === GeminiStatus.ANALYZING ? 'Thinking...' : 'AI Inspect'}</span>
          </button>
          
          <div className="w-px h-6 bg-zinc-700 mx-1" />

          {/* Playlist Toggle */}
          <button
             onClick={onTogglePlaylist}
             className={`transition-colors ${isPlaylistOpen ? 'text-orange-500' : 'text-zinc-300 hover:text-white'}`}
             title="Toggle Playlist"
             aria-label="Playlist"
          >
            <List size={24} />
          </button>

          {/* Fullscreen */}
          <button 
            onClick={onToggleFullscreen}
            className="text-zinc-300 hover:text-white focus:outline-none"
            title="Toggle Fullscreen (F)"
            aria-label="Fullscreen"
          >
            {state.isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
          </button>
        </div>
      </div>
    </div>
  );
};