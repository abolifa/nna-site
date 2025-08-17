"use client";

import CookieConsent from "@/components/cookie-consent";
import { Toaster } from "@/components/ui/sonner";
import queryClient from "@/lib/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { Cairo } from "next/font/google";

import React from "react";

const AppProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        toastOptions={{
          style: {
            fontFamily: "Cairo, sans-serif",
          },
        }}
      />
      <CookieConsent />
    </QueryClientProvider>
  );
};

export default AppProvider;
