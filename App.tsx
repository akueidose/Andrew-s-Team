import React, { useState } from 'react';
import { DropZone } from './components/DropZone';
import { Player } from './components/Player';
import { VideoState } from './types';

const App: React.FC = () => {
  const [playlist, setPlaylist] = useState<VideoState[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleFilesSelected = (files: File[]) => {
    const newVideos = files.map(file => ({
      url: URL.createObjectURL(file),
      name: file.name,
      type: file.type
    }));
    setPlaylist(newVideos);
    setCurrentIndex(0);
  };

  const handleBack = () => {
    playlist.forEach(video => URL.revokeObjectURL(video.url));
    setPlaylist([]);
    setCurrentIndex(0);
  };

  const handleNext = () => {
    if (currentIndex < playlist.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSelect = (index: number) => {
    if (index >= 0 && index < playlist.length) {
      setCurrentIndex(index);
    }
  };

  const currentVideo = playlist[currentIndex] || null;

  return (
    <div className="w-full h-screen bg-zinc-900 text-zinc-100 font-sans overflow-hidden">
      {currentVideo ? (
        <Player 
          videoState={currentVideo} 
          onBack={handleBack} 
          onNext={handleNext}
          onPrevious={handlePrevious}
          hasNext={currentIndex < playlist.length - 1}
          hasPrevious={currentIndex > 0}
          playlist={playlist}
          currentIndex={currentIndex}
          onSelect={handleSelect}
        />
      ) : (
        <DropZone onFilesSelected={handleFilesSelected} />
      )}
    </div>
  );
};

export default App;