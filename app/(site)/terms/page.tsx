"use client";

import ErrorComponent from "@/components/error-component";
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import React from "react";

interface TermsOfService {
  terms_of_service_title?: string;
  terms_of_service_content?: string;
}

const TermsOfServicePage = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["terms"],
    queryFn: async () => {
      const res = await api.get("/settings/terms");
      return res.data as TermsOfService;
    },
  });

  if (isLoading)
    return (
      <div className="w-full flex items-center justify-center py-10">
        <Loader className="animate-spin" />
      </div>
    );
  if (isError) return <ErrorComponent error={error} keyParam={"terms"} />;

  return (
    <div className="w-full space-y-5 py-10 pl-10">
      <h1 className="text-3xl font-bold">{data?.terms_of_service_title}</h1>
      <p
        className="leading-loose text-justify"
        dangerouslySetInnerHTML={{
          __html: data?.terms_of_service_content ?? "",
        }}
      ></p>
    </div>
  );
};

export default TermsOfServicePage;
