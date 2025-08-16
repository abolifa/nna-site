"use client";

import { useEffect, useMemo, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { PaginatedPosts, Post } from "@/lib/types";
import PostContainer from "@/components/post-container";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader } from "lucide-react";

export default function PostsPage() {
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<PaginatedPosts>({
    queryKey: ["latestPosts"],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await api.get(`/posts?page=${pageParam}`);
      return res.data as PaginatedPosts;
    },
    initialPageParam: 1,
    getNextPageParam: (last) => {
      if (!last.next_page_url) return undefined;
      const url = new URL(last.next_page_url);
      const next = url.searchParams.get("page");
      return next ? Number(next) : undefined;
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  // Flatten pages -> posts[]
  const posts: Post[] = useMemo(
    () => (data?.pages ?? []).flatMap((p) => p.data),
    [data]
  );

  // IntersectionObserver sentinel
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { root: null, rootMargin: "400px 0px", threshold: 0 } // prefetch 400px early
    );

    obs.observe(el);
    return () => {
      obs.unobserve(el);
      obs.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isError) {
    return (
      <div className="p-6 text-sm text-red-600">
        فشل تحميل المنشورات: {(error as Error)?.message}
      </div>
    );
  }

  return (
    <div className="w-full p-4">
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <li key={`skeleton-${i}`} className="w-full">
              <div className="flex flex-col gap-3 p-3 border bg-background">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-64 w-full" />
              </div>
            </li>
          ))}
        {posts.map((post) => (
          <PostContainer key={post.id} post={post} />
        ))}
      </ul>
      <div ref={loadMoreRef} className="h-10" />
      {isFetchingNextPage && (
        <div className="flex items-center justify-center w-full">
          <Loader className="animate-spin" />
        </div>
      )}
      {!hasNextPage && !isLoading && posts.length > 0 && (
        <div className="mt-6 text-center text-sm text-muted-foreground">
          لا توجد نتائج إضافية.
        </div>
      )}
    </div>
  );
}
