"use client";

import { ChangeEvent, useRef, useState } from "react";

type IntroVideoProps = {
  src: string;
  poster?: string;
};

export function IntroVideo({ src, poster }: IntroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(0.5);

  function toggleSound() {
    const video = videoRef.current;
    if (!video) return;

    if (muted) {
      video.muted = false;
      video.volume = volume;
      video.currentTime = 0;
      void video.play();
      setMuted(false);
    } else {
      video.muted = true;
      setMuted(true);
    }
  }

  function changeVolume(event: ChangeEvent<HTMLInputElement>) {
    const nextVolume = Number(event.target.value);
    const video = videoRef.current;
    setVolume(nextVolume);
    if (!video) return;

    video.volume = nextVolume;
    video.muted = nextVolume === 0;
    setMuted(nextVolume === 0);
    if (nextVolume > 0) void video.play();
  }

  return (
    <>
      <div className="orbit-photo orbit-video-frame">
        <video ref={videoRef} src={src} poster={poster} autoPlay muted={muted} playsInline preload="auto" />
      </div>
      <div className="intro-audio-control">
        <button type="button" onClick={toggleSound} aria-pressed={!muted}>
          {muted ? "Sound on" : "Mute"}
        </button>
        <label>
          <span>Volume</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={changeVolume}
            aria-label="Introduction video volume"
          />
        </label>
      </div>
    </>
  );
}
