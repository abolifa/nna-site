"use client";

import ErrorComponent from "@/components/error-component";
import api from "@/lib/api";
import { getImageUrl } from "@/lib/helpers";
import { Awareness } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useParams } from "next/navigation";
import React from "react";

const page = () => {
  const { id } = useParams();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["awareness", id],
    queryFn: async () => {
      const res = await api.get(`/awareness/${id}`);
      return res.data as Awareness;
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <ErrorComponent error={error} />;

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold">{data?.title}</h1>
      <div
        className="px-5 pl-10 text-justify leading-loose"
        dangerouslySetInnerHTML={{ __html: data?.description ?? "" }}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {data?.attachments?.map((item) => {
          return (
            <div className="w-full p-3 border space-y-2" key={item.title}>
              <h4 className="font-semibold">{item.title}</h4>
              <div className="w-full h-64 bg-gray-200 mb-2">
                <Image
                  src={getImageUrl(item.image ?? "")}
                  alt={item.title}
                  width={300}
                  height={300}
                  className="w-full h-full object-cover rounded-lg"
                  priority
                />
              </div>
              {item.content && (
                <p className="text-sm text-gray-500">{item.content}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default page;
