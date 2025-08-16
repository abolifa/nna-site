"use client";

import * as React from "react";
import api from "@/lib/api";
import { Accouncement } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Pause, Play, Zap } from "lucide-react";
import { Button } from "./ui/button";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";

const HOLD_MS = 3000; // how long each item stays visible
const ENTER_MS = 0.28; // enter animation duration
const EXIT_MS = 0.2; // exit animation duration
const ADVANCE_MS = HOLD_MS + 80; // timer to trigger next (slightly before exit)

export default function AnnounceComponent() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const res = await api.get("/announcements");
      return res.data as Accouncement[];
    },
  });

  const items = (data ?? []).map((a) => a.title).filter(Boolean);
  const [idx, setIdx] = React.useState(0);
  const [paused, setPaused] = React.useState(false);

  // auto-advance
  React.useEffect(() => {
    if (!items.length || paused) return;
    const t = setTimeout(() => {
      setIdx((i) => (i + 1) % items.length);
    }, ADVANCE_MS);
    return () => clearTimeout(t);
  }, [items.length, idx, paused]);

  const next = React.useCallback(() => {
    if (!items.length) return;
    setIdx((i) => (i + 1) % items.length);
  }, [items.length]);

  const prev = React.useCallback(() => {
    if (!items.length) return;
    setIdx((i) => (i - 1 + items.length) % items.length);
  }, [items.length]);

  return (
    <aside
      aria-label="Site announcements"
      className="w-full h-10 border flex items-center gap-2 bg-background"
    >
      {/* Prefix */}
      <div className="flex h-full w-32 justify-center items-center gap-1 bg-primary text-primary-foreground">
        <Zap className="w-4 h-4" />
        <span className="text-sm">الإعلانات</span>
      </div>

      {/* Announcement viewport */}
      <div
        className="flex-1 h-full flex items-center overflow-hidden px-3"
        aria-live="polite"
      >
        <div className="relative w-full">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={items.length ? `${idx}-${items[idx]}` : "placeholder"}
              initial={{ x: 24, opacity: 0 }}
              animate={{ x: 0, opacity: 1, transition: { duration: ENTER_MS } }}
              exit={{ x: -24, opacity: 0, transition: { duration: EXIT_MS } }}
              className="absolute inset-0 flex items-center"
            >
              {isLoading ? (
                <span className="text-sm text-muted-foreground">
                  ...يتم التحميل
                </span>
              ) : isError ? (
                <span className="text-sm text-destructive">
                  تعذّر جلب الإعلانات
                </span>
              ) : items.length ? (
                <span className="text-sm truncate">{items[idx]}</span>
              ) : (
                <span className="text-sm text-muted-foreground">
                  لا توجد إعلانات الآن
                </span>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-stretch">
        <Button
          title="السابق"
          onClick={prev}
          disabled={!items.length}
          className="rounded-none border-0 border-r-1 text-muted-foreground"
          variant={"outline"}
        >
          <ArrowUp className="w-4 h-4" />
        </Button>
        <Button
          title={paused ? "تشغيل" : "إيقاف مؤقت"}
          onClick={() => setPaused((p) => !p)}
          disabled={!items.length}
          aria-pressed={paused}
          className="rounded-none border-0 border-r-1 text-muted-foreground"
          variant={"outline"}
        >
          {paused ? (
            <Play className="w-4 h-4" />
          ) : (
            <Pause className="w-4 h-4" />
          )}
        </Button>
        <Button
          title="التالي"
          onClick={next}
          disabled={!items.length}
          className="rounded-none border-0 border-r-1 text-muted-foreground"
          variant={"outline"}
        >
          <ArrowDown className="w-4 h-4" />
        </Button>
      </div>
    </aside>
  );
}
