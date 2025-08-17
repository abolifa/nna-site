"use client";

import AnnounceComponent from "@/components/announce";
import Navbar from "@/components/navbar";
import TopBar from "@/components/top-bar";
import React from "react";
import "leaflet/dist/leaflet.css";
import SiteFooter from "@/components/footer";

const SiteLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full h-full min-h-dvh flex flex-col bg-accent">
      <TopBar />
      <Navbar />
      <div className="container mx-auto max-w-6xl bg-background border border-t-0 shadow p-5 mt-5 rounded-sm">
        <AnnounceComponent />
        <main className="mt-5">{children}</main>
      </div>
      <SiteFooter />
    </div>
  );
};

export default SiteLayout;
