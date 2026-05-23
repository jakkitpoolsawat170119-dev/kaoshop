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

export default function VideoEmbed({ videoUrl, title }: Props) {
  const ytEmbed = getYouTubeEmbedUrl(videoUrl);
  const ttEmbed = !ytEmbed ? getTikTokEmbedUrl(videoUrl) : null;

  if (!ytEmbed && !ttEmbed) return null;

  const src = ytEmbed || ttEmbed!;
  const isYouTube = !!ytEmbed;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden mb-6">
      <div className="px-6 pt-5 pb-3 flex items-center gap-2">
        <span className="w-7 h-7 bg-red-500 rounded-full flex items-center justify-center shrink-0">
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="white"
          >
            <polygon points="3,1 9,5 3,9" />
          </svg>
        </span>
        <h2 className="font-bold text-gray-800 dark:text-gray-200 text-base">
          วิดีโอรีวิว {isYouTube ? "YouTube" : "TikTok"}
        </h2>
      </div>
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        <iframe
          src={src}
          title={`วิดีโอรีวิว ${title}`}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"
          loading="lazy"
        />
      </div>
    </div>
  );
}
