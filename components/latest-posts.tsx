"use client";

import * as React from "react";
import api from "@/lib/api";
import { PaginatedPosts, Post } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import PostContainer from "./post-container";
import Link from "next/link";
import { MoveLeft } from "lucide-react";
import { Skeleton } from "./ui/skeleton";

export default function LatestPosts() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") || "1");

  const { data, isLoading, isError } = useQuery<PaginatedPosts>({
    queryKey: ["latestPosts", page],
    queryFn: async () => {
      const res = await api.get(`/posts?page=${page}`);
      return res.data as PaginatedPosts;
    },
  });

  const posts = data?.data ?? [];
  const current = data?.current_page ?? 1;
  const last = data?.last_page ?? 1;

  const goTo = (p: number) => {
    const sp = new URLSearchParams(searchParams);
    if (p <= 1) sp.delete("page");
    else sp.set("page", String(p));
    router.push(`?${sp.toString()}`, { scroll: true });
  };

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <h2 className="text-xl font-bold">أحدث المنشورات</h2>
        <span className="text-sm text-muted-foreground">
          الصفحة {current} من {last}
        </span>
        <Link
          href="/posts"
          className="text-sm font-medium flex items-center gap-1.5 text-muted-foreground hover:underline hover:text-primary"
        >
          عرض الكل
          <MoveLeft className="w-4 h-4" />
        </Link>
      </header>

      <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <li key={i} className="flex w-full flex-col gap-3 p-3 border">
              <h2 className="text-md font-semibold truncate">
                <Skeleton className="h-4 w-full" />
              </h2>
              <div className="flex items-center justify-start gap-1.5">
                <Skeleton className="h-4 w-4" />
                <span className="text-sm text-muted-foreground">
                  <Skeleton className="h-4 w-24" />
                </span>
              </div>
              <div className="w-full h-64 aspect-auto bg-accent overflow-hidden">
                <Skeleton className="h-full w-full" />
              </div>
            </li>
          ))
        ) : isError ? (
          <li className="flex w-full flex-col gap-3 p-3 border">
            <h2 className="text-md font-semibold truncate">
              حدث خطأ أثناء تحميل المنشورات. يرجى المحاولة لاحقًا.
            </h2>
          </li>
        ) : posts.length === 0 ? (
          <li className="flex w-full col-span-3 items-center justify-center py-24">
            <h2 className="text-md text-muted-foreground">لا توجد منشورات.</h2>
          </li>
        ) : (
          posts.map((post) => <PostContainer key={post.id} post={post} />)
        )}
      </ul>
      <Pagination current={current} last={last} onChange={goTo} radius={1} />
    </section>
  );
}

function Pagination({
  current,
  last,
  onChange,
  radius = 1,
}: {
  current: number;
  last: number;
  onChange: (p: number) => void;
  radius?: number;
}) {
  if (last <= 1) return null;

  const pages = buildPageWindow(current, last, radius);

  return (
    <nav
      className="flex items-center justify-center gap-0"
      aria-label="Pagination"
    >
      <PageBtn
        onClick={() => onChange(1)}
        disabled={current === 1}
        title="الأولى"
      >
        الأولى
      </PageBtn>
      <PageBtn
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        title="السابق"
      >
        السابق
      </PageBtn>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground">
            …
          </span>
        ) : (
          <PageBtn
            key={p}
            onClick={() => onChange(p)}
            active={p === current}
            aria-current={p === current ? "page" : undefined}
            title={`الانتقال إلى الصفحة ${p}`}
          >
            {p}
          </PageBtn>
        )
      )}

      <PageBtn
        onClick={() => onChange(current + 1)}
        disabled={current === last}
        title="التالي"
      >
        التالي
      </PageBtn>
      <PageBtn
        onClick={() => onChange(last)}
        disabled={current === last}
        title="الأخيرة"
      >
        الأخيرة
      </PageBtn>
    </nav>
  );
}

function PageBtn({
  children,
  onClick,
  disabled,
  active,
  title,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={[
        "h-9 min-w-9 px-3 rounded-none border-1 text-sm",
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-background hover:bg-accent border-input",
        disabled ? "opacity-50 cursor-not-allowed" : "",
      ].join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
}

function buildPageWindow(
  current: number,
  last: number,
  radius: number
): (number | "…")[] {
  const pages: (number | "…")[] = [];
  const add = (n: number | "…") => pages.push(n);
  const start = Math.max(1, current - radius);
  const end = Math.min(last, current + radius);
  if (start > 1) {
    add(1);
    if (start > 2) add("…");
  }
  for (let p = start; p <= end; p++) add(p);
  if (end < last) {
    if (end < last - 1) add("…");
    add(last);
  }

  return pages;
}
