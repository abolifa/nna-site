"use client";

import ErrorComponent from "@/components/error-component";
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import React from "react";

interface About {
  about_title?: string;
  about_content?: string;
}

const AboutPage = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["about"],
    queryFn: async () => {
      const res = await api.get("/settings/about");
      console.log(res.data);
      return res.data as About;
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <ErrorComponent error={error} keyParam={"about"} />;

  return (
    <div className="w-full space-y-5 py-10 pl-10">
      <h1 className="text-3xl font-bold">{data?.about_title}</h1>
      <p
        className="leading-loose text-justify"
        dangerouslySetInnerHTML={{ __html: data?.about_content ?? "" }}
      ></p>
    </div>
  );
};

export default AboutPage;
