import React, { useCallback, useState } from 'react';
import { Rabbit, FileUp, Layers } from 'lucide-react';

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFilesSelected }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(Array.from(e.dataTransfer.files));
    }
  }, [onFilesSelected]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
    }
  }, [onFilesSelected]);

  return (
    <div 
      className={`flex flex-col items-center justify-center w-full h-screen bg-zinc-900 text-zinc-300 transition-colors duration-200 ${isDragging ? 'bg-zinc-800' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="p-12 border-4 border-dashed border-zinc-700 rounded-xl flex flex-col items-center space-y-6 max-w-xl text-center bg-zinc-900/50 backdrop-blur-sm">
        <div className="relative">
          <Rabbit size={80} className="text-orange-500" />
          {isDragging && (
            <div className="absolute -top-2 -right-2">
              <span className="flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500"></span>
              </span>
            </div>
          )}
        </div>
        
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">R-PLAYER</h1>
          <p className="text-zinc-400 text-lg">Drop video files here to play</p>
        </div>

        <div className="w-full h-px bg-zinc-700 my-4" />

        <label className="group relative cursor-pointer">
          <input 
            type="file" 
            className="hidden" 
            multiple
            accept="video/*,.mkv,.avi,.mp4,.webm,.mov" 
            onChange={handleInputChange}
          />
          <div className="flex items-center gap-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 px-6 py-3 rounded-lg transition-all shadow-lg group-hover:border-orange-500/50">
            <FileUp className="text-orange-500" />
            <span className="font-medium group-hover:text-white">Select files manually</span>
          </div>
        </label>
        
        <div className="flex items-center gap-2 text-xs text-zinc-600 mt-4">
          <Layers size={14} />
          <span>Supports playlists (drag multiple files)</span>
        </div>
      </div>
    </div>
  );
};