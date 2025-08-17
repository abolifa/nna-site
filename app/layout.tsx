import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Cairo } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import AppProvider from "@/providers/app-provider";
import { ThemeProvider } from "@/components/theme-provider";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://romuz.com.ly";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  fallback: ["system-ui", "Segoe UI", "Tahoma", "Arial", "sans-serif"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "الهيئة الوطنية لأمراض الكلى | National Nephrology Authority",
    template: "%s | الهيئة الوطنية لأمراض الكلى",
  },
  description:
    "الموقع الرسمي للهيئة الوطنية لأمراض الكلى في ليبيا: أخبار، توعية صحية، خدمات، وبيانات التواصل.",
  keywords: [
    "أمراض الكلى",
    "الهيئة الوطنية لأمراض الكلى",
    "ليبيا",
    "توعية صحية",
    "National Nephrology Authority",
    "Kidney Diseases Libya",
  ],
  applicationName: "National Nephrology Authority",
  authors: [{ name: "National Nephrology Authority" }],
  generator: "Next.js",
  category: "health",
  alternates: {
    canonical: "/",
    languages: {
      ar: "/",
    },
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "الهيئة الوطنية لأمراض الكلى",
    title: "الهيئة الوطنية لأمراض الكلى | National Nephrology Authority",
    description:
      "الموقع الرسمي للهيئة الوطنية لأمراض الكلى في ليبيا: أخبار، توعية صحية، خدمات، وبيانات التواصل.",
    locale: "ar_LY",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "الهيئة الوطنية لأمراض الكلى",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@your_handle",
    creator: "@your_handle",
    title: "الهيئة الوطنية لأمراض الكلى",
    description:
      "الموقع الرسمي للهيئة الوطنية لأمراض الكلى في ليبيا: أخبار، توعية صحية، خدمات، وبيانات التواصل.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: ["/favicon.ico"],
  },
  manifest: "/site.webmanifest",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0B0B0B" },
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "light dark",
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#ffffff" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "GovernmentOrganization",
    name: "الهيئة الوطنية لأمراض الكلى",
    alternateName: "National Nephrology Authority",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    sameAs: [
      "https://www.facebook.com/profile.php?id=61575060608329#",
      "https://x.com/your-handle",
      "https://instagram.com/your-page",
      "https://youtube.com/@your-page",
    ],
    address: {
      "@type": "PostalAddress",
      addressCountry: "LY",
      addressLocality: "Tripoli",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "info@example.ly",
        telephone: "+218910000000",
        availableLanguage: ["ar", "en"],
      },
    ],
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: SITE_URL,
    name: "الهيئة الوطنية لأمراض الكلى",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/search?q={query}`,
      "query-input": "required name=query",
    },
  };

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={cn("antialiased", cairo.className)}
        suppressHydrationWarning
      >
        {/* Schema.org JSON-LD */}
        <Script
          id="ld-org"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <Script
          id="ld-website"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />

        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AppProvider>{children}</AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
