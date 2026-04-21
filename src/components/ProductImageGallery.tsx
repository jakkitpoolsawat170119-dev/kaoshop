"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductImageGalleryProps {
  featuredImage: string | null;
  images: string | null; // JSON array string from DB
  productName: string | null;
  title: string;
}

export default function ProductImageGallery({
  featuredImage,
  images,
  productName,
  title,
}: ProductImageGalleryProps) {
  // รวมรูปทั้งหมด: featuredImage ก่อน แล้วต่อด้วย images[]
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

  const prev = () => setSelected((i) => (i - 1 + allImages.length) % allImages.length);
  const next = () => setSelected((i) => (i + 1) % allImages.length);

  // ถ้าไม่มีรูปเลย
  if (allImages.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl font-bold">
        KaoShop
      </div>
    );
  }

  const alt = productName || title;

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Main Image */}
      <div className="relative w-full aspect-square bg-white overflow-hidden rounded-xl group">
        <div className="relative w-full h-full transition-transform duration-300 ease-in-out group-hover:scale-105 cursor-zoom-in">
          <Image
            src={allImages[selected]}
            alt={`${alt} รูปที่ ${selected + 1}`}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 340px"
            priority={selected === 0}
          />
        </div>

        {/* Prev / Next ปุ่ม — แสดงเมื่อมีหลายรูป */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="รูปก่อนหน้า"
            >
              <ChevronLeft size={18} className="text-gray-700" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="รูปถัดไป"
            >
              <ChevronRight size={18} className="text-gray-700" />
            </button>

            {/* Dot indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {allImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
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

      {/* Thumbnails — แสดงเมื่อมีมากกว่า 1 รูป */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {allImages.map((url, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`relative shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-colors ${
                i === selected
                  ? "border-orange-500"
                  : "border-transparent hover:border-gray-300"
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
  );
}
