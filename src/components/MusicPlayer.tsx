import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { TRACKS } from '../constants';

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch((e) => console.error('Audio play failed:', e));
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrackIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const handleEnded = () => {
    nextTrack();
  };

  return (
    <div className="bg-black/80 border border-fuchsia-500/50 rounded-xl p-4 shadow-[0_0_15px_rgba(217,70,239,0.3)] backdrop-blur-sm w-full max-w-md mx-auto flex flex-col items-center gap-4">
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onEnded={handleEnded}
        preload="auto"
      />
      
      <div className="text-center w-full">
        <h3 className="text-fuchsia-400 font-bold text-lg truncate drop-shadow-[0_0_5px_rgba(217,70,239,0.8)]">
          {currentTrack.title}
        </h3>
        <p className="text-cyan-400/80 text-sm truncate">
          {currentTrack.artist}
        </p>
      </div>

      <div className="flex items-center justify-center gap-6 w-full">
        <button
          onClick={prevTrack}
          className="text-cyan-400 hover:text-cyan-300 hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] transition-all"
        >
          <SkipBack size={24} />
        </button>
        
        <button
          onClick={togglePlay}
          className="bg-fuchsia-500 hover:bg-fuchsia-400 text-black rounded-full p-3 shadow-[0_0_15px_rgba(217,70,239,0.6)] hover:shadow-[0_0_25px_rgba(217,70,239,0.8)] transition-all transform hover:scale-105"
        >
          {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
        </button>
        
        <button
          onClick={nextTrack}
          className="text-cyan-400 hover:text-cyan-300 hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] transition-all"
        >
          <SkipForward size={24} />
        </button>
      </div>

      <div className="flex items-center gap-3 w-full px-4">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="text-gray-400 hover:text-fuchsia-400 transition-colors"
        >
          {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onChange={(e) => {
            setVolume(parseFloat(e.target.value));
            setIsMuted(false);
          }}
          className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
        />
      </div>
    </div>
  );
}
