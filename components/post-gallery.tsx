"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { getImageUrl } from "@/lib/helpers";

export interface PostGalleryProps {
  mainImage: string;
  otherImages: string[];
  isLoading?: boolean;
  alt?: string;
}

function Tile({
  src,
  alt,
  className,
  priority = false,
  onClick,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "relative w-full h-full overflow-hidden bg-muted focus:outline-none focus:ring-2 focus:ring-primary",
        className
      )}
      aria-label={alt}
    >
      <Image
        src={getImageUrl(src)}
        alt={alt}
        fill
        sizes="(min-width:1280px) 1100px, (min-width:1024px) 900px, 100vw"
        className="object-cover"
        priority={priority}
      />
    </button>
  );
}

// Lightbox Modal
function Lightbox({
  images,
  index,
  onClose,
  setIndex,
}: {
  images: string[];
  index: number;
  onClose: () => void;
  setIndex: (i: number) => void;
}) {
  const startX = useRef<number | null>(null);

  const prev = useCallback(
    () => setIndex((index - 1 + images.length) % images.length),
    [index, images.length, setIndex]
  );
  const next = useCallback(
    () => setIndex((index + 1) % images.length),
    [index, images.length, setIndex]
  );

  // keyboard controls
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, onClose, prev]);

  // lock scroll behind modal
  useEffect(() => {
    const original = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = original;
    };
  }, []);

  // touch swipe
  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (startX.current == null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    if (Math.abs(dx) > 40) {
      dx > 0 ? prev() : next();
    }
    startX.current = null;
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        aria-modal
        role="dialog"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center bg-white/10 text-white backdrop-blur-md hover:bg-white/20"
          aria-label="Close image viewer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Prev */}
        <button
          onClick={prev}
          className="absolute left-4 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center bg-white/10 text-white hover:bg-white/20"
          aria-label="Previous image"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        {/* Next */}
        <button
          onClick={next}
          className="absolute right-4 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center bg-white/10 text-white hover:bg-white/20"
          aria-label="Next image"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Image */}
        <motion.div
          key={index}
          className="relative w-[92vw] max-w-6xl aspect-[16/10]"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <Image
            src={getImageUrl(images[index])}
            alt="Preview"
            fill
            className="object-contain"
            sizes="(min-width:1280px) 1200px, 92vw"
            priority
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function PostGallery({
  mainImage,
  otherImages,
  isLoading,
  alt = "Post image",
}: PostGalleryProps) {
  const images = useMemo(
    () => [mainImage, ...(otherImages || [])].filter(Boolean),
    [mainImage, otherImages]
  );

  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const openAt = (i: number) => {
    setIndex(i);
    setOpen(true);
  };

  if (images.length === 0) return null;

  // ---- 1 IMAGE: full hero ----
  if (images.length === 1) {
    return (
      <>
        <Tile
          src={images[0]}
          alt={alt}
          priority
          onClick={() => openAt(0)}
          className="aspect-[16/10] cursor-zoom-in"
        />
        {open && (
          <Lightbox
            images={images}
            index={index}
            setIndex={setIndex}
            onClose={() => setOpen(false)}
          />
        )}
      </>
    );
  }

  // ---- 2 IMAGES: split in two columns ----
  if (images.length === 2) {
    return (
      <>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-3">
          <Tile
            src={images[0]}
            alt="Main image"
            priority
            onClick={() => openAt(0)}
            className="h-[300px] md:h-[420px] cursor-zoom-in"
          />
          <Tile
            src={images[1]}
            alt="Second image"
            onClick={() => openAt(1)}
            className="h-[300px] md:h-[420px] cursor-zoom-in"
          />
        </div>

        {open && (
          <Lightbox
            images={images}
            index={index}
            setIndex={setIndex}
            onClose={() => setOpen(false)}
          />
        )}
      </>
    );
  }

  // ---- 3+ IMAGES: main big (2x2), two stacked on right
  // If >3, bottom-right shows +N overlay but is still clickable
  const extras = images.slice(1);
  const topRightIdx = 1; // global index in images[]
  const bottomRightIdx = 2; // global index in images[]
  const hasOverflow = extras.length > 2;
  const remaining = hasOverflow ? extras.length - 2 : 0;

  return (
    <>
      <div
        className={clsx(
          "grid gap-2 md:gap-3",
          // Give rows a height so fill images render
          "auto-rows-[180px] md:grid-cols-3 md:auto-rows-[210px] lg:auto-rows-[240px]"
        )}
      >
        {/* Main (spans 2x2 on md+) */}
        <div className="md:col-span-2 md:row-span-2">
          <Tile
            src={images[0]}
            alt="Main image"
            priority
            onClick={() => openAt(0)}
            className="h-[280px] md:h-full cursor-zoom-in"
          />
        </div>

        {/* Top-right */}
        <Tile
          src={images[topRightIdx]}
          alt="Gallery image 2"
          onClick={() => openAt(topRightIdx)}
          className="cursor-zoom-in"
        />

        {/* Bottom-right (+N overlay if overflow) */}
        <div className="relative">
          <Tile
            src={images[bottomRightIdx]}
            alt="Gallery image 3"
            onClick={() => openAt(bottomRightIdx)}
            className="cursor-zoom-in"
          />
          {hasOverflow && (
            <button
              type="button"
              onClick={() => openAt(bottomRightIdx)}
              className="absolute inset-0 flex items-center justify-center bg-black/45 focus:outline-none"
              aria-label={`Show ${remaining} more images`}
            >
              <span className="bg-black/55 px-3 py-1 text-base font-semibold text-white shadow">
                +{remaining}
              </span>
            </button>
          )}
        </div>
      </div>

      {open && (
        <Lightbox
          images={images}
          index={index}
          setIndex={setIndex}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

export function PostGalleryWithLightbox(props: PostGalleryProps) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const images = useMemo(
    () => [props.mainImage, ...(props.otherImages || [])].filter(Boolean),
    [props.mainImage, props.otherImages]
  );

  return (
    <div className="relative">
      <InnerGallery
        {...props}
        onOpen={(i) => {
          setIndex(i);
          setOpen(true);
        }}
      />
      {open && (
        <Lightbox
          images={images}
          index={index}
          setIndex={(i) => setIndex(i)}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

function InnerGallery({
  onOpen,
  ...props
}: PostGalleryProps & { onOpen: (i: number) => void }) {
  const images = useMemo(
    () => [props.mainImage, ...(props.otherImages || [])].filter(Boolean),
    [props.mainImage, props.otherImages]
  );
  const [index, setIndex] = useState<number | null>(null);
  return (
    <div className="contents">
      <PostGallery {...props} />
    </div>
  );
}
