"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import ErrorComponent from "@/components/error-component";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, Phone, Copy, CheckCircle2, Clock, Globe } from "lucide-react";
import clsx from "clsx";

type ContactType = "email" | "phone";

interface Contact {
  type: ContactType;
  name?: string;
  value?: string;
  time_period?: string; // e.g., "8:00–16:00"
  zone?: string; // e.g., "UTC+2" or "Africa/Tripoli"
}

/** Utilities */
const isEmail = (v?: string) => !!v && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isPhone = (v?: string) => !!v && /^[+()\d\s\-]{6,}$/.test(v);

function linkFor(contact: Contact): string | undefined {
  const val = contact.value?.trim();
  if (!val) return;
  if (contact.type === "email" && isEmail(val)) return `mailto:${val}`;
  if (contact.type === "phone" && isPhone(val))
    return `tel:${val.replace(/\s+/g, "")}`;
  return;
}

function TypeIcon({
  type,
  className,
}: {
  type: ContactType;
  className?: string;
}) {
  return type === "email" ? (
    <Mail className={className} />
  ) : (
    <Phone className={className} />
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children?: React.ReactNode;
}) {
  if (!children) return null;
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="min-w-16 text-muted-foreground">{label}</span>
      <span className="font-medium">{children}</span>
    </div>
  );
}

function CopyButton({ value }: { value?: string }) {
  const [copied, setCopied] = React.useState(false);
  if (!value) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="نسخ"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // ignore
        }
      }}
    >
      {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
    </Button>
  );
}

function ContactCard({ c }: { c: Contact }) {
  const href = linkFor(c);

  return (
    <Card className="rounded-2xl shadow-sm border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TypeIcon type={c.type} className="size-5 opacity-80" />
            <CardTitle className="text-base">
              {c.name || (c.type === "email" ? "البريد الإلكتروني" : "الهاتف")}
            </CardTitle>
          </div>

          <div className="flex items-center gap-1">
            {c.time_period && (
              <Badge variant="secondary" className="gap-1">
                <Clock className="size-3.5" />
                {c.time_period}
              </Badge>
            )}
            {c.zone && (
              <Badge variant="outline" className="gap-1">
                <Globe className="size-3.5" />
                {c.zone}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <Separator />

        <Field label="النوع">
          {c.type === "email" ? "بريد إلكتروني" : "هاتف"}
        </Field>

        <Field label="التواصل">
          <div className="flex items-center gap-2">
            {href ? (
              <a
                href={href}
                className={clsx(
                  "font-semibold underline underline-offset-4 hover:opacity-90",
                  c.type === "phone" && "ltr"
                )}
                dir={c.type === "phone" ? "ltr" : undefined}
              >
                {c.value}
              </a>
            ) : (
              <span className="font-semibold">{c.value || "-"}</span>
            )}
            <CopyButton value={c.value} />
          </div>
        </Field>
      </CardContent>
    </Card>
  );
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="rounded-2xl">
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export default function ContactPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["contact"],
    queryFn: async () => {
      const res = await api.get("/settings/contact");
      // Expecting: { contact: Contact[] }
      const list = (res.data?.contact ?? []) as Contact[];
      // Basic sanitization / sort: email first, then phone
      return list
        .filter((c) => c?.type && c?.value)
        .sort((a, b) => (a.type > b.type ? 1 : -1));
    },
  });

  if (isLoading) {
    return (
      <section className="container mx-auto max-w-6xl px-4 py-10">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">بيانات التواصل</h1>
          <p className="text-muted-foreground text-sm">
            تجد هنا طرق التواصل الرسمية.
          </p>
        </header>
        <LoadingGrid />
      </section>
    );
  }

  if (isError) {
    return (
      <section className="container mx-auto max-w-3xl px-4 py-10">
        <ErrorComponent error={error} keyParam="contact" />
      </section>
    );
  }

  const hasData = (data?.length ?? 0) > 0;

  return (
    <section className="container mx-auto max-w-6xl px-4 py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">بيانات التواصل</h1>
        <p className="text-muted-foreground text-sm">
          يمكنكم مراسلتنا عبر البريد الإلكتروني أو الاتصال الهاتفي خلال أوقات
          الدوام.
        </p>
      </header>

      {hasData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {data!.map((c, idx) => (
            <ContactCard key={`${c.type}-${c.value}-${idx}`} c={c} />
          ))}
        </div>
      ) : (
        <Card className="rounded-2xl">
          <CardContent className="py-8">
            <div className="text-center space-y-2">
              <p className="text-lg font-semibold">
                لا توجد بيانات تواصل متاحة حالياً
              </p>
              <p className="text-sm text-muted-foreground">
                بمجرد إضافة قنوات تواصل من لوحة التحكم ستظهر هنا.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
