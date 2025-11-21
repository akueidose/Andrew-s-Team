import React, { useRef, useState, useEffect, useCallback } from 'react';
import { PlayerControls } from './PlayerControls';
import { AnalysisOverlay } from './AnalysisOverlay';
import { PlaylistSidebar } from './PlaylistSidebar';
import { VideoState, PlayerState, GeminiStatus, AnalysisResult } from '../types';
import { analyzeFrame } from '../services/geminiService';
import { ArrowLeft } from 'lucide-react';

interface PlayerProps {
  videoState: VideoState;
  onBack: () => void;
  onNext: () => void;
  onPrevious: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
  playlist: VideoState[];
  currentIndex: number;
  onSelect: (index: number) => void;
}

export const Player: React.FC<PlayerProps> = ({ 
  videoState, 
  onBack,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious,
  playlist,
  currentIndex,
  onSelect
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<PlayerState>({
    isPlaying: true,
    volume: 1,
    currentTime: 0,
    duration: 0,
    isMuted: false,
    isFullscreen: false,
    playbackRate: 1,
  });

  const [showControls, setShowControls] = useState(true);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const controlsTimeoutRef = useRef<number | null>(null);
  
  // AI State
  const [geminiStatus, setGeminiStatus] = useState<GeminiStatus>(GeminiStatus.IDLE);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // Focus on mount
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.focus();
    }
  }, []);

  // Handle video change
  useEffect(() => {
    setAnalysisResult(null);
    setGeminiStatus(GeminiStatus.IDLE);
    if (videoRef.current) {
      videoRef.current.playbackRate = state.playbackRate;
      videoRef.current.play().catch(() => {
        setState(prev => ({ ...prev, isPlaying: false }));
      });
      setState(prev => ({ ...prev, isPlaying: true }));
    }
  }, [videoState.url]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      if (['input', 'textarea'].includes((e.target as HTMLElement).tagName.toLowerCase())) return;

      const video = videoRef.current;
      if (!video) return;

      switch(e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          if (video.paused) {
            video.play();
            setState(prev => ({ ...prev, isPlaying: true }));
          } else {
            video.pause();
            setState(prev => ({ ...prev, isPlaying: false }));
          }
          break;
        case 'arrowright':
          e.preventDefault();
          video.currentTime = Math.min(video.duration, video.currentTime + 5);
          break;
        case 'arrowleft':
          e.preventDefault();
          video.currentTime = Math.max(0, video.currentTime - 5);
          break;
        case 'arrowup':
          e.preventDefault();
          {
            const newVol = Math.min(1, video.volume + 0.1);
            video.volume = newVol;
            setState(prev => ({ ...prev, volume: newVol, isMuted: newVol === 0 }));
          }
          break;
        case 'arrowdown':
          e.preventDefault();
          {
            const newVol = Math.max(0, video.volume - 0.1);
            video.volume = newVol;
            setState(prev => ({ ...prev, volume: newVol, isMuted: newVol === 0 }));
          }
          break;
        case 'f':
          e.preventDefault();
          handleToggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          handleToggleMute();
          break;
        case 'n':
          if (hasNext) onNext();
          break;
        case 'p':
          if (hasPrevious) onPrevious();
          break;
      }

      // Show controls on key press
      setShowControls(true);
      if (controlsTimeoutRef.current) window.clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = window.setTimeout(() => {
        if (state.isPlaying && !showPlaylist) setShowControls(false);
      }, 3000);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasNext, hasPrevious, onNext, onPrevious, showPlaylist, state.isPlaying]);

  // Mouse movement handler for controls visibility
  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    document.body.style.cursor = 'default';
    
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }

    if (state.isPlaying && !showPlaylist) {
      controlsTimeoutRef.current = window.setTimeout(() => {
        setShowControls(false);
        document.body.style.cursor = 'none';
      }, 3000);
    }
  }, [state.isPlaying, showPlaylist]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (controlsTimeoutRef.current) window.clearTimeout(controlsTimeoutRef.current);
      document.body.style.cursor = 'default';
    };
  }, [handleMouseMove]);

  // Event Wrappers
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setState(prev => ({ ...prev, currentTime: videoRef.current!.currentTime }));
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setState(prev => ({ ...prev, duration: videoRef.current!.duration }));
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (state.isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
    }
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setState(prev => ({ ...prev, currentTime: time }));
    }
  };

  const handleVolumeChange = (volume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      setState(prev => ({ ...prev, volume, isMuted: volume === 0 }));
    }
  };

  const handleToggleMute = () => {
    if (videoRef.current) {
      const newMuted = !state.isMuted;
      videoRef.current.muted = newMuted;
      setState(prev => ({ ...prev, isMuted: newMuted }));
    }
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => console.error(err));
      setState(prev => ({ ...prev, isFullscreen: true }));
    } else {
      document.exitFullscreen();
      setState(prev => ({ ...prev, isFullscreen: false }));
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setState(prev => ({ ...prev, playbackRate: rate }));
    }
  };

  const handleAnalyzeFrame = async () => {
    if (!videoRef.current) return;

    videoRef.current.pause();
    setState(prev => ({ ...prev, isPlaying: false }));
    setGeminiStatus(GeminiStatus.ANALYZING);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Could not get canvas context");
      
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const base64Image = canvas.toDataURL('image/png');

      const text = await analyzeFrame(base64Image);
      
      setAnalysisResult({
        text,
        timestamp: videoRef.current.currentTime
      });
      setGeminiStatus(GeminiStatus.SUCCESS);
    } catch (e) {
      console.error(e);
      setGeminiStatus(GeminiStatus.ERROR);
      setAnalysisResult({
        text: "Failed to analyze frame. Please check API Key.",
        timestamp: videoRef.current.currentTime
      });
    }
  };

  return (
    <div 
      ref={containerRef}
      tabIndex={0}
      className="relative w-full h-screen bg-black flex items-center justify-center overflow-hidden group outline-none"
    >
      {/* Header */}
      <div className={`absolute top-0 left-0 right-0 p-6 z-20 flex items-start justify-between transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'} bg-gradient-to-b from-black/90 via-black/50 to-transparent pb-20`}>
         <button 
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-200 hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg backdrop-blur-md border border-white/5 shadow-lg"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Close</span>
        </button>

        <h1 className="absolute left-1/2 -translate-x-1/2 top-6 text-white/95 text-xl font-semibold tracking-wide drop-shadow-lg max-w-3xl truncate px-4 pointer-events-none text-center">
          {videoState.name}
        </h1>
      </div>

      <video
        ref={videoRef}
        src={videoState.url}
        className="max-w-full max-h-full shadow-2xl"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onClick={handlePlayPause}
        onEnded={() => {
          if (hasNext) {
            onNext();
          } else {
            setState(prev => ({ ...prev, isPlaying: false }));
          }
        }}
      />

      <AnalysisOverlay 
        result={analysisResult} 
        onClose={() => setAnalysisResult(null)} 
      />

      <PlaylistSidebar 
        isOpen={showPlaylist} 
        onClose={() => setShowPlaylist(false)} 
        playlist={playlist} 
        currentIndex={currentIndex} 
        onSelect={(index) => {
          onSelect(index);
        }}
      />

      <div className={`transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <PlayerControls 
          state={state}
          onPlayPause={handlePlayPause}
          onVolumeChange={handleVolumeChange}
          onToggleMute={handleToggleMute}
          onSeek={handleSeek}
          onToggleFullscreen={handleToggleFullscreen}
          onPlaybackRateChange={handlePlaybackRateChange}
          onAnalyze={handleAnalyzeFrame}
          geminiStatus={geminiStatus}
          fileName={videoState.name}
          onNext={onNext}
          onPrevious={onPrevious}
          hasNext={hasNext}
          hasPrevious={hasPrevious}
          onTogglePlaylist={() => setShowPlaylist(!showPlaylist)}
          isPlaylistOpen={showPlaylist}
        />
      </div>
    </div>
  );
};