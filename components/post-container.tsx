"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Loader2, ImageOff } from "lucide-react";
import { easeInOut, motion } from "framer-motion";
import { format } from "date-fns";
import { getImageUrl } from "@/lib/helpers";
import type { Post } from "@/lib/types";

const cardVariants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: easeInOut },
  },
};

export default function PostContainer({ post }: { post: Post }) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const createdAt = new Date(post.created_at);

  return (
    <li className="w-full">
      <Link
        href={`/posts/${post.slug}`}
        scroll={true}
        className="group block focus:outline-none"
      >
        <motion.article
          variants={cardVariants}
          initial="initial"
          animate="animate"
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.985 }}
          className="flex w-full flex-col gap-3 p-3 border rounded-none bg-background transition-shadow shadow-sm hover:shadow-lg focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <h2 title={post.title} className="text-md font-semibold truncate">
            {post.title}
          </h2>

          <div className="flex items-center gap-1.5 text-muted-foreground">
            <CalendarDays className="w-4 h-4" />
            <span className="text-sm">
              {isNaN(createdAt.getTime())
                ? "—"
                : format(createdAt, "dd/MM/yyyy")}
            </span>
          </div>

          <div className="relative w-full h-64 overflow-hidden rounded-md bg-accent">
            {loading && !error && (
              <div className="absolute inset-0 grid place-items-center">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <div className="h-2 w-40 overflow-hidden rounded bg-muted">
                    <div className="h-full w-1/2 animate-[shimmer_1.2s_infinite]" />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="absolute inset-0 grid place-items-center text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ImageOff className="w-5 h-5" />
                  <span className="text-sm">تعذّر تحميل الصورة</span>
                </div>
              </div>
            )}

            {!error && (
              <Image
                src={getImageUrl(post.main_image)}
                alt={post.title}
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover transition duration-300 ease-out group-hover:scale-105"
                style={{ opacity: loading ? 0 : 1 }}
                loading="lazy"
                onLoad={() => setLoading(false)}
                onError={() => {
                  setLoading(false);
                  setError(true);
                }}
              />
            )}

            <motion.div
              initial={{ x: "-120%" }}
              whileHover={{ x: "120%" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="pointer-events-none absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100"
            />
          </div>
        </motion.article>
      </Link>
    </li>
  );
}
