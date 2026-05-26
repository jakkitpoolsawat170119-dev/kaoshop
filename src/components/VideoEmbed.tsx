"use client";

import { useState, useRef } from "react";

interface Props {
  videoUrl: string;
  title: string;
}

function getYouTubeEmbedUrl(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? `https://www.youtube-nocookie.com/embed/${match[1]}` : null;
}

function getTikTokEmbedUrl(url: string): string | null {
  const match = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/);
  return match ? `https://www.tiktok.com/embed/v2/${match[1]}` : null;
}

function isDirectVideo(url: string): boolean {
  return (
    /\.(mp4|webm|mov)(\?|$)/i.test(url) ||
    url.includes("res.cloudinary.com") ||
    url.includes("cdn.shotstack.io")
  );
}

function isShotstackVideo(url: string): boolean {
  return url.includes("cdn.shotstack.io");
}

function DirectVideoPlayer({ videoUrl, title }: { videoUrl: string; title: string }) {
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isAI = isShotstackVideo(videoUrl);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !muted;
      setMuted(!muted);
    }
  };

  return (
    <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
      <video
        ref={videoRef}
        src={videoUrl}
        title={`วิดีโอรีวิว ${title}`}
        className="absolute inset-0 w-full h-full object-cover bg-black"
        controls
        autoPlay={isAI}
        muted={isAI}
        loop={false}
        preload="auto"
        playsInline
      />
      {isAI && (
        <button
          onClick={toggleMute}
          className="absolute bottom-12 right-3 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5"
          aria-label={muted ? "เปิดเสียง" : "ปิดเสียง"}
        >
          {muted ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.63 3.63a.996.996 0 000 1.41L7.29 8.7 7 9H4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71v-4.17l4.18 4.18c-.49.37-1.02.68-1.6.91-.36.15-.58.53-.58.92 0 .72.73 1.18 1.39.91.8-.33 1.55-.77 2.22-1.31l1.34 1.34a.996.996 0 101.41-1.41L5.05 3.63c-.39-.39-1.02-.39-1.42 0zM19 12c0 .82-.15 1.61-.41 2.34l1.53 1.53c.56-1.17.88-2.48.88-3.87 0-3.83-2.4-7.11-5.78-8.4-.59-.23-1.22.2-1.22.84v.08c0 .38.25.71.61.85C17.18 6.54 19 9.06 19 12zm-8.71-6.29l-.17.17L12 7.76V6.41c0-.89-1.08-1.33-1.71-.7zM16.5 12A4.5 4.5 0 0014 7.97v1.79l2.48 2.48c.01-.08.02-.16.02-.24z"/>
              </svg>
              แตะเพื่อเปิดเสียง
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
              เสียงเปิดอยู่
            </>
          )}
        </button>
      )}
    </div>
  );
}

export default function VideoEmbed({ videoUrl, title }: Props) {
  const ytEmbed = getYouTubeEmbedUrl(videoUrl);
  const ttEmbed = !ytEmbed ? getTikTokEmbedUrl(videoUrl) : null;
  const isDirect = !ytEmbed && !ttEmbed && isDirectVideo(videoUrl);
  const isAI = isDirect && isShotstackVideo(videoUrl);

  if (!ytEmbed && !ttEmbed && !isDirect) return null;

  const label = ytEmbed ? "YouTube" : ttEmbed ? "TikTok" : "วิดีโอรีวิว";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden mb-6">
      <div className="px-6 pt-5 pb-3 flex items-center gap-2">
        <span className="w-7 h-7 bg-red-500 rounded-full flex items-center justify-center shrink-0">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="white">
            <polygon points="3,1 9,5 3,9" />
          </svg>
        </span>
        <h2 className="font-bold text-gray-800 dark:text-gray-200 text-base">
          วิดีโอรีวิว {label}
        </h2>
        {isAI && (
          <span className="ml-auto text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/40 border border-purple-200 dark:border-purple-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
            </svg>
            AI Video
          </span>
        )}
      </div>
      {isDirect ? (
        <DirectVideoPlayer videoUrl={videoUrl} title={title} />
      ) : (
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          <iframe
            src={(ytEmbed || ttEmbed)!}
            title={`วิดีโอรีวิว ${title}`}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
}
