import React, { Suspense } from "react";
import ApplyComplaint from "@/components/apply-complaint";
import LatestPosts from "@/components/latest-posts";
import MainSlider from "@/components/main-slider";
import SystemStats from "@/components/system-stats";
import { Separator } from "@/components/ui/separator";

/* Skeletons (super light) */
function SliderSkeleton() {
  return <div className="h-56 rounded-2xl bg-muted animate-pulse" />;
}
function PostsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-36 rounded-xl bg-muted animate-pulse" />
      ))}
    </div>
  );
}
function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
      ))}
    </div>
  );
}
function ComplaintSkeleton() {
  return <div className="h-72 rounded-2xl bg-muted animate-pulse" />;
}

export default function Home() {
  return (
    <div className="space-y-5">
      <Suspense fallback={<SliderSkeleton />}>
        <MainSlider />
      </Suspense>

      <Separator />

      <Suspense fallback={<PostsSkeleton />}>
        <LatestPosts />
      </Suspense>

      <Separator />

      <Suspense fallback={<StatsSkeleton />}>
        <SystemStats />
      </Suspense>

      <Separator />

      <Suspense fallback={<ComplaintSkeleton />}>
        <ApplyComplaint />
      </Suspense>
    </div>
  );
}
