"use client";

import { Toaster } from "@/components/ui/sonner";
import queryClient from "@/lib/client";
import { QueryClientProvider } from "@tanstack/react-query";

import React from "react";

const AppProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster />
    </QueryClientProvider>
  );
};

export default AppProvider;
