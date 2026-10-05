import React, { useEffect, useRef, useState } from 'react';

export const AutoplayVideo = ({ src, poster, className = '', background = false }) => {
  const videoRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncPlayback = () => {
      if (motionPreference.matches) {
        video.pause();
      } else {
        video.play().catch((error) => {
          if (error.name !== 'NotAllowedError') {
            console.warn('FarmCraft video could not start playback.', error);
          }
        });
      }
    };

    if (motionPreference.matches) video.pause();
    motionPreference.addEventListener('change', syncPlayback);
    return () => motionPreference.removeEventListener('change', syncPlayback);
  }, []);

  const handleVideoError = () => {
    setIsReady(true);
    console.warn('FarmCraft video could not be loaded; its poster image will remain visible.');
  };

  return (
    <div aria-hidden="true" className={`${background ? 'absolute' : 'relative'} isolate overflow-hidden ${className}`}>
      {poster && (
        <img
          src={poster}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-out ${isReady ? 'opacity-0' : 'opacity-100'}`}
        />
      )}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={poster}
        className={`relative z-10 h-full w-full object-cover transition-opacity duration-1000 ease-out ${isReady ? 'opacity-100' : 'opacity-0'}`}
        tabIndex={-1}
        onCanPlay={() => setIsReady(true)}
        onPlaying={() => setIsReady(true)}
        onError={handleVideoError}
      >
        <source src={src} type="video/mp4" />
      </video>
    </div>
  );
};
