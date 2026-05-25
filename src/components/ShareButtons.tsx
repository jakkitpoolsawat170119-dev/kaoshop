"use client";

import { useState, useEffect } from "react";
import { Link2, Check } from "lucide-react";

interface Props {
  title: string;
}

function FacebookIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function LineIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  );
}

export default function ShareButtons({ title }: Props) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-gray-400">แชร์:</span>
      <a
        href={fbUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-full transition-colors"
        aria-label="แชร์ Facebook"
      >
        <FacebookIcon />
        Facebook
      </a>
      <a
        href={lineUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-full transition-colors"
        aria-label="แชร์ Line"
      >
        <LineIcon />
        Line
      </a>
      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-full transition-colors"
        aria-label="คัดลอกลิงก์"
      >
        {copied ? <Check size={12} /> : <Link2 size={12} />}
        {copied ? "คัดลอกแล้ว!" : "คัดลอกลิงก์"}
      </button>
    </div>
  );
}
