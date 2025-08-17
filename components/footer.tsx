"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ExternalLink,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import clsx from "clsx";

type Social = { label: string; href: string; icon: React.ReactNode };
type QuickLink = { label: string; href: string };

const SOCIALS: Social[] = [
  {
    label: "Facebook",
    href: "https://facebook.com/your-page",
    icon: <Facebook className="size-4" />,
  },
  {
    label: "X (Twitter)",
    href: "https://x.com/your-handle",
    icon: <Twitter className="size-4" />,
  },
  {
    label: "Instagram",
    href: "https://instagram.com/your-page",
    icon: <Instagram className="size-4" />,
  },
  {
    label: "YouTube",
    href: "https://youtube.com/@your-page",
    icon: <Youtube className="size-4" />,
  },
];

const LINKS_PRIMARY: QuickLink[] = [
  { label: "عن الهيئة", href: "/about" },
  { label: "سياسة الخصوصية", href: "/privacy" },
  { label: "شروط الاستخدام", href: "/terms" },
  { label: "الأسئلة الشائعة", href: "/faqs" },
];

const LINKS_PORTALS: QuickLink[] = [
  { label: "الخريطة التفاعلية", href: "/map" },
  { label: "بوابة المراكز", href: "https://portal.romuz.com.ly" },
  { label: "بوابة الموظفين", href: "https://app.romuz.com.ly" },
];

const CONTACT = {
  email: "info@example.ly",
  phone: "+218 91 000 0000",
  address: "طرابلس، ليبيا",
  time: "الأحد–الخميس · 8:00–16:00",
  zone: "Africa/Tripoli",
};

function isExternal(href?: string) {
  if (!href) return false;
  return /^(https?:)?\/\//i.test(href);
}

function SmartLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return isExternal(href) ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={clsx(
        "inline-flex items-center gap-1 hover:opacity-90",
        className
      )}
    >
      {children}
      <ExternalLink className="size-3.5 opacity-60" />
    </a>
  ) : (
    <Link href={href} className={clsx("hover:opacity-90", className)}>
      {children}
    </Link>
  );
}

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer dir="rtl" className="mt-12 border-t border-gray-300 bg-background">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Top grid */}
        <div className="grid gap-10 py-10 md:grid-cols-2 lg:grid-cols-4 divide-x">
          {/* Brand & mission */}
          <section aria-labelledby="footer-brand" className="space-y-4">
            <div className="flex items-center justify-center gap-1 px-5">
              <Image
                src="/logo.png"
                alt="Logo"
                width={48}
                height={48}
                className="w-16 h-auto"
              />
              <div className="leading-tight">
                <h2 id="footer-brand" className="font-bold text-sm text-center">
                  الهيئة الوطنية لأمراض الكلى
                </h2>
              </div>
            </div>
            <p className="text-xs text-center leading-relaxed text-muted-foreground">
              نرتقي بخدمات أمراض الكلى ونُسهّل الوصول للمعلومات الصحية والبوابات
              ذات الصلة.
            </p>

            {/* Socials */}
            <div className="flex justify-center items-center gap-2 pt-1">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  title={s.label}
                  className={clsx(
                    "inline-flex size-9 items-center justify-center rounded-full border",
                    "transition-colors hover:bg-accent"
                  )}
                >
                  <span className="opacity-80">{s.icon}</span>
                  <span className="sr-only">{s.label}</span>
                </a>
              ))}
            </div>
          </section>

          {/* Primary links */}
          <nav aria-labelledby="footer-links" className="space-y-4">
            <h3 id="footer-links" className="text-sm font-semibold">
              روابط
            </h3>
            <ul className="space-y-2 text-sm">
              {LINKS_PRIMARY.map((l) => (
                <li key={l.href}>
                  <SmartLink
                    href={l.href}
                    className="underline-offset-4 hover:underline"
                  >
                    <span>- </span>
                    {l.label}
                  </SmartLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Portals */}
          <nav aria-labelledby="footer-portals" className="space-y-4">
            <h3 id="footer-portals" className="text-sm font-semibold">
              بوابات
            </h3>
            <ul className="space-y-2 text-sm">
              {LINKS_PORTALS.map((l) => (
                <li key={l.href}>
                  <SmartLink
                    href={l.href}
                    className="underline-offset-4 hover:underline"
                  >
                    <span>- </span>
                    {l.label}
                  </SmartLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <address
            className="not-italic space-y-4"
            aria-labelledby="footer-contact"
          >
            <h3 id="footer-contact" className="text-sm font-semibold">
              التواصل
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 size-4 opacity-80" />
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="hover:underline underline-offset-4"
                >
                  {CONTACT.email}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 size-4 opacity-80" />
                <a
                  href={`tel:${CONTACT.phone.replace(/\s+/g, "")}`}
                  className="hover:underline underline-offset-4 ltr"
                  dir="ltr"
                >
                  {CONTACT.phone}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 opacity-80" />
                <span>{CONTACT.address}</span>
              </li>
              <li className="text-xs text-muted-foreground">
                {CONTACT.time} · {CONTACT.zone}
              </li>
            </ul>
          </address>
        </div>

        {/* Bottom bar */}
        <div className="border-t pb-5 flex flex-col gap-2 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© {year} جميع الحقوق محفوظة</p>
          <div className="flex items-center gap-4">
            <SmartLink href="/privacy">سياسة الخصوصية</SmartLink>
            <SmartLink href="/terms">شروط الاستخدام</SmartLink>
            <SmartLink href="/contact">اتصل بنا</SmartLink>
          </div>
        </div>
      </div>
    </footer>
  );
}
