"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import type { Slider } from "@/lib/types";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaOptionsType } from "embla-carousel";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import clsx from "clsx";
import { getImageUrl } from "@/lib/helpers";

const options: EmblaOptionsType = {
  loop: true,
  align: "start",
  dragFree: false,
  containScroll: "trimSnaps",
  skipSnaps: false,
};

export default function MainSlider() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["sliders"],
    queryFn: async () => {
      const res = await api.get("/sliders");
      return res.data as Slider[];
    },
  });

  const slides = (data ?? []).filter((s) => !!s.image);

  // RTL awareness
  const [isRTL, setIsRTL] = React.useState(false);
  React.useEffect(() => {
    if (typeof document !== "undefined") setIsRTL(document.dir === "rtl");
  }, []);

  // Autoplay plugin (stable ref)
  const autoplayRef = React.useRef(
    Autoplay({ delay: 3500, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { ...options, direction: isRTL ? "rtl" : "ltr" },
    [autoplayRef.current]
  );

  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);

  React.useEffect(() => {
    emblaApi?.reInit({ ...options, direction: isRTL ? "rtl" : "ltr" });
  }, [isRTL, emblaApi]);

  const onSelect = React.useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  const scrollPrev = React.useCallback(
    () => emblaApi?.scrollPrev(),
    [emblaApi]
  );
  const scrollNext = React.useCallback(
    () => emblaApi?.scrollNext(),
    [emblaApi]
  );
  const scrollTo = React.useCallback(
    (i: number) => emblaApi?.scrollTo(i),
    [emblaApi]
  );

  const pause = React.useCallback(() => {
    autoplayRef.current?.stop();
    setIsPaused(true);
  }, []);
  const play = React.useCallback(() => {
    autoplayRef.current?.play();
    setIsPaused(false);
  }, []);

  // Keyboard (←/→, space to pause/play)
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!emblaApi) return;
      if (e.key === "ArrowLeft") scrollPrev();
      if (e.key === "ArrowRight") scrollNext();
      if (e.key === " ") {
        e.preventDefault();
        isPaused ? play() : pause();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [emblaApi, isPaused, scrollPrev, scrollNext, pause, play]);

  // Helpers
  const hrefForSlide = (s: Slider): { href?: string; external?: boolean } => {
    if (s.type === "url" && s.url) return { href: s.url, external: true };
    if (s.type === "post") {
      // Adjust to your routes (slug vs id). Fallback uses id.
      const slug = (s as any)?.post?.slug as string | undefined;
      return { href: `/posts/${slug ?? s.post_id}`, external: false };
    }
    return {};
  };

  if (isLoading) {
    return (
      <div className="relative w-full">
        <div className="aspect-[16/7] w-full rounded-2xl bg-muted animate-pulse" />
      </div>
    );
  }

  if (isError || slides.length === 0) {
    return (
      <div className="relative w-full border rounded-2xl p-6 text-center text-muted-foreground">
        لا توجد شرائح للعرض الآن
      </div>
    );
  }

  return (
    <section
      aria-label="Main carousel"
      className="group relative w-full"
      onMouseEnter={() => {
        // only pause if user explicitly toggled? Autoplay already pauses on hover via config
        if (!isPaused) autoplayRef.current?.reset();
      }}
    >
      {/* Viewport */}
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {slides.map((s, i) => {
            const { href, external } = hrefForSlide(s);
            const SlideInner = (
              <div className="relative w-full aspect-[16/7] md:aspect-[21/9] select-none">
                <Image
                  src={getImageUrl(s.image)}
                  alt={`slide-${i + 1}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 1200px"
                  className="object-cover"
                  priority={i === 0}
                />
                {/* Optional overlay gradient for legibility (add captions later if you want) */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-black/0 to-black/10" />
              </div>
            );

            return (
              <div
                key={i}
                className="min-w-0 shrink-0 grow-0 basis-full"
                aria-roledescription="slide"
                aria-label={`${i + 1} / ${slides.length}`}
              >
                {href ? (
                  <Link
                    href={href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    className="block"
                  >
                    {SlideInner}
                  </Link>
                ) : (
                  SlideInner
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Arrows */}
      <button
        type="button"
        onClick={scrollPrev}
        aria-label="السابق"
        className={clsx(
          "absolute top-1/2 -translate-y-1/2 start-2 z-10 grid h-10 w-10 place-items-center",
          "rounded-full bg-black/40 text-white backdrop-blur transition",
          "hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white/60",
          "opacity-0 group-hover:opacity-100"
        )}
      >
        <ChevronRight className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={scrollNext}
        aria-label="التالي"
        className={clsx(
          "absolute top-1/2 -translate-y-1/2 end-2 z-10 grid h-10 w-10 place-items-center",
          "rounded-full bg-black/40 text-white backdrop-blur transition",
          "hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white/60",
          "opacity-0 group-hover:opacity-100"
        )}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* Pause/Play */}
      <button
        type="button"
        onClick={() => (isPaused ? play() : pause())}
        aria-pressed={isPaused}
        className={clsx(
          "absolute z-10 top-2 end-2 h-9 px-3 rounded-full",
          "bg-black/40 text-white backdrop-blur",
          "hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white/60"
        )}
        title={isPaused ? "تشغيل" : "إيقاف مؤقت"}
      >
        {isPaused ? (
          <Play className="h-4 w-4" />
        ) : (
          <Pause className="h-4 w-4" />
        )}
      </button>

      {/* Dots */}
      <div className="absolute z-10 bottom-3 inset-x-0 flex items-center justify-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            aria-label={`انتقال إلى الشريحة ${i + 1}`}
            className={clsx(
              "h-2.5 rounded-full transition",
              selectedIndex === i
                ? "w-6 bg-white"
                : "w-2.5 bg-white/60 hover:bg-white/80"
            )}
          />
        ))}
      </div>
    </section>
  );
}
