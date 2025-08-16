import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import AppProvider from "@/providers/app-provider";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic"],
  fallback: ["sans-serif"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "الهيئة الوطنية لأمراض الكلى",
  description: "موقع الهيئة الوطنية لأمراض الكلى",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={cn("antialiased", cairo.className)}>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
