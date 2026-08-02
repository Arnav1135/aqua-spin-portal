'use client';

import { useState, useRef } from 'react';
import { Maximize2, Minimize2, AlertTriangle } from 'lucide-react';

interface GamePlayerProps {
  title: string;
  iframeUrl: string;
}

export function GamePlayer({ title, iframeUrl }: GamePlayerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Listen for fullscreen changes to update UI state
  if (typeof window !== 'undefined') {
    window.onfullscreenchange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
  }

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Player Container */}
      <div 
        ref={containerRef}
        className={`relative bg-black w-full overflow-hidden border border-white/10 ${
          isFullscreen ? 'h-screen rounded-none' : 'aspect-video rounded-xl shadow-2xl shadow-cyan-500/10'
        }`}
      >
        <iframe
          src={iframeUrl}
          title={title}
          className="w-full h-full border-none"
          // CRITICAL SECURITY REQUIREMENT:
          // We explicitly OMIT 'allow-top-navigation' and 'allow-popups' to prevent iframe breakout.
          sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-forms"
          allow="gamepad; autoplay"
        />

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/80 text-white p-2 rounded-lg backdrop-blur-md transition-colors z-10 border border-white/10"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex items-center gap-2 text-xs text-neutral-400 bg-neutral-900/50 p-3 rounded-lg border border-neutral-800">
        <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
        <p>
          This game runs in a secure sandbox. It cannot access your main browser window, open popups, or redirect this tab.
        </p>
      </div>
    </div>
  );
}
