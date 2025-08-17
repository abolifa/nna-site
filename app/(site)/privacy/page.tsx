"use client";

import ErrorComponent from "@/components/error-component";
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import React from "react";

interface PrivacyPolicy {
  privacy_policy_title?: string;
  privacy_policy_content?: string;
}

const PrivacyPage = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["privacy-policy"],
    queryFn: async () => {
      const res = await api.get("/settings/privacy-policy");
      return res.data as PrivacyPolicy;
    },
  });

  if (isLoading)
    return (
      <div className="w-full flex items-center justify-center py-10">
        <Loader className="animate-spin" />
      </div>
    );
  if (isError)
    return <ErrorComponent error={error} keyParam={"privacy-policy"} />;

  return (
    <div className="w-full space-y-5 py-10 pl-10">
      <h1 className="text-3xl font-bold">{data?.privacy_policy_title}</h1>
      <p
        className="leading-loose text-justify"
        dangerouslySetInnerHTML={{ __html: data?.privacy_policy_content ?? "" }}
      ></p>
    </div>
  );
};

export default PrivacyPage;
