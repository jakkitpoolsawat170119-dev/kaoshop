"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";

interface ProductImageGalleryProps {
  featuredImage: string | null;
  images: string | null;
  productName: string | null;
  title: string;
}

export default function ProductImageGallery({
  featuredImage,
  images,
  productName,
  title,
}: ProductImageGalleryProps) {
  const parseImages = (): string[] => {
    let extra: string[] = [];
    try {
      if (images) {
        const parsed = JSON.parse(images);
        extra = Array.isArray(parsed) ? parsed.filter(Boolean) : [];
      }
    } catch { /* ใช้ array ว่าง */ }

    const all: string[] = [];
    if (featuredImage?.startsWith("http")) all.push(featuredImage);
    extra.forEach((url) => {
      if (url.startsWith("http") && !all.includes(url)) all.push(url);
    });
    return all;
  };

  const allImages = parseImages();
  const [selected, setSelected] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const prev = useCallback(() => setSelected((i) => (i - 1 + allImages.length) % allImages.length), [allImages.length]);
  const next = useCallback(() => setSelected((i) => (i + 1) % allImages.length), [allImages.length]);

  // ปิด lightbox ด้วย Escape
  useEffect(() => {
    if (!lightbox) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox, prev, next]);

  // ล็อก scroll ตอน lightbox เปิด
  useEffect(() => {
    document.body.style.overflow = lightbox ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightbox]);

  if (allImages.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl font-bold">
        KaoShop
      </div>
    );
  }

  const alt = productName || title;

  return (
    <>
      <div className="flex flex-col gap-3 w-full">
        {/* Main Image */}
        <div className="relative w-full aspect-square bg-white overflow-hidden rounded-xl group">
          {/* คลิกเพื่อขยาย */}
          <button
            onClick={() => setLightbox(true)}
            className="relative w-full h-full block"
            aria-label="ดูรูปขนาดเต็ม"
          >
            <Image
              src={allImages[selected]}
              alt={`${alt} รูปที่ ${selected + 1}`}
              fill
              className="object-contain transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 340px"
              priority={selected === 0}
            />
            {/* ไอคอน zoom */}
            <span className="absolute bottom-2 right-2 bg-white/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <ZoomIn size={16} className="text-gray-600" />
            </span>
          </button>

          {/* Prev / Next */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                aria-label="รูปก่อนหน้า"
              >
                <ChevronLeft size={18} className="text-gray-700" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                aria-label="รูปถัดไป"
              >
                <ChevronRight size={18} className="text-gray-700" />
              </button>

              {/* Dot indicator */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                {allImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setSelected(i); }}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      i === selected ? "bg-orange-500" : "bg-gray-300"
                    }`}
                    aria-label={`รูปที่ ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {allImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {allImages.map((url, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={`relative shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-colors ${
                  i === selected ? "border-orange-500" : "border-transparent hover:border-gray-300"
                }`}
                aria-label={`เลือกรูปที่ ${i + 1}`}
              >
                <Image
                  src={url}
                  alt={`${alt} thumbnail ${i + 1}`}
                  fill
                  className="object-contain bg-white"
                  sizes="56px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightbox(false)}
        >
          {/* ปุ่มปิด */}
          <button
            onClick={() => setLightbox(false)}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition-colors"
            aria-label="ปิด"
          >
            <X size={24} />
          </button>

          {/* รูปใหญ่ */}
          <div
            className="relative w-full max-w-3xl max-h-[85vh] aspect-square mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={allImages[selected]}
              alt={`${alt} รูปที่ ${selected + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          {/* ลูกศร lightbox */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-3 transition-colors"
                aria-label="รูปก่อนหน้า"
              >
                <ChevronLeft size={28} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-3 transition-colors"
                aria-label="รูปถัดไป"
              >
                <ChevronRight size={28} />
              </button>
            </>
          )}

          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
            {selected + 1} / {allImages.length}
          </div>
        </div>
      )}
    </>
  );
}
