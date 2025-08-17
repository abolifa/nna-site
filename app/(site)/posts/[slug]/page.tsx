"use client";
import ErrorComponent from "@/components/error-component";
import PostContainer from "@/components/post-container";
import PostGallery from "@/components/post-gallery";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import { Post } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { CalendarDays, Loader, MapPin } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";

/* --- added: simple persistent uid --- */
function getUid() {
  const k = "romuz_uid";
  try {
    let id = localStorage.getItem(k);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(k, id);
    }
    return id;
  } catch {
    return "nouid";
  }
}

const SinglePost = () => {
  const { slug: rawSlug } = useParams();
  const slug = Array.isArray(rawSlug)
    ? rawSlug.join("/")
    : String(rawSlug ?? "");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["post", slug],
    queryFn: async () => {
      const res = await api.get(`/posts/${slug}`);
      return res.data as Post;
    },
    enabled: !!slug,
  });

  const { data: related } = useQuery({
    queryKey: ["relatedPosts", slug],
    queryFn: async () => {
      const res = await api.get(`/posts/${slug}/related`);
      return res.data as Post[];
    },
    enabled: !!slug,
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);
  const sentRef = useRef<string | null>(null);
  useEffect(() => {
    if (!slug) return;
    if (sentRef.current === slug) return;
    sentRef.current = slug;
    const uid = getUid();
    api.post("/track-view", { slug, uid });
  }, [slug]);

  if (isError) {
    return <ErrorComponent error={error as Error} keyParam={slug} />;
  }

  return (
    <div className="border p-4 flex flex-col w-full space-y-3">
      {/* Data & Location */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          {isLoading ? (
            <Skeleton className="w-24 h-5" />
          ) : (
            <span>طرابلس، ليبيا</span>
          )}
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <CalendarDays className="w-4 h-4" />
          <span>
            {isLoading ? (
              <Skeleton className="w-24 h-5" />
            ) : (
              format(
                new Date(data?.created_at ?? new Date()),
                "MMMM dd, yyyy",
                { locale: arSA }
              )
            )}
          </span>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-xl font-bold line-clamp-2">
        {isLoading ? <Skeleton className="w-full h-8" /> : data?.title}
      </h1>

      {/* Tags */}
      <div className="flex flex-wrap gap-3">
        {data?.tags?.map((tag) => (
          <span key={tag} className="cursor-pointer text-blue-500">
            {tag.startsWith("#") ? tag : `#${tag}`}
          </span>
        ))}
      </div>

      {/* Image Section */}
      <div className="w-full">
        {isLoading ? (
          <div className="w-full h-64 flex items-center justify-center">
            <Loader className="animate-spin" />
          </div>
        ) : (
          <PostGallery
            mainImage={data?.main_image ?? ""}
            otherImages={data?.other_images ?? []}
            isLoading={isLoading}
            alt={data?.title ?? "Post image"}
          />
        )}
      </div>

      {/* Content */}
      <div>
        {isLoading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-full h-4" />
          </div>
        ) : (
          <p
            className="text-justify text-md leading-loose"
            dangerouslySetInnerHTML={{ __html: data?.content ?? "" }}
          />
        )}
      </div>

      {/* Related Posts */}
      {related && related.length > 0 ? (
        <div className="mt-6 space-y-4">
          <h2 className="text-lg font-bold">منشورات ذات صلة</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {related.map((post) => (
              <PostContainer key={post.id} post={post} />
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

export default SinglePost;
