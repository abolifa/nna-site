"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import ErrorComponent from "@/components/error-component";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, Link as LinkIcon, HelpCircle, RefreshCcw } from "lucide-react";

interface Faqs {
  faqs_title?: string;
  faqs_content?: string;
  faq: { question: string; answer: string }[];
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^\w\u0600-\u06FF\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

const SkeletonRow = () => (
  <div className="animate-pulse space-y-3 rounded-2xl border p-4">
    <div className="h-4 w-2/3 rounded bg-muted" />
    <div className="h-3 w-full rounded bg-muted" />
    <div className="h-3 w-5/6 rounded bg-muted" />
  </div>
);

export default function FaqsPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["faq"],
    queryFn: async () => {
      const res = await api.get("/settings/faq");
      return res.data as Faqs;
    },
  });

  const [query, setQuery] = React.useState("");

  const items = React.useMemo(() => data?.faq ?? [], [data]);

  const filtered = React.useMemo(() => {
    if (!query) return items;
    const q = query.trim().toLowerCase();
    return items.filter((i) =>
      [i.question, i.answer].some((t) => t?.toLowerCase().includes(q))
    );
  }, [items, query]);

  if (isLoading) {
    return (
      <div className="w-full py-10">
        <div className="space-y-4 px-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-7 w-64 animate-pulse rounded bg-muted" />
              <div className="h-4 w-80 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-9 w-48 animate-pulse rounded bg-muted" />
          </div>
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full py-10">
        <div className="px-4">
          <ErrorComponent error={error} keyParam={"faq"} />
          <div className="mt-4 flex gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCcw className="mr-2 h-4 w-4" /> إعادة المحاولة
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-10" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        className="space-y-6 px-4"
      >
        <header className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              {data?.faqs_title || "الأسئلة الشائعة"}
            </h1>
            {data?.faqs_content && (
              <p className="mt-1 text-sm text-muted-foreground">
                {data.faqs_content}
              </p>
            )}
          </div>
          <Badge variant="secondary" className="text-base">
            <HelpCircle className="ml-2 h-4 w-4" />
            {filtered.length} سؤال
          </Badge>
        </header>

        <div className="relative">
          <Search className="pointer-events-none absolute right-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث في الأسئلة (مواعيد، أدوية، نتائج...)"
            className="pr-9"
            aria-label="بحث"
          />
        </div>

        <Separator />

        {filtered.length === 0 ? (
          <div className="rounded-2xl border p-6 text-center">
            <p className="mb-4 text-muted-foreground">
              لم نعثر على نتائج مطابقة لــ "{query}"
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button variant="outline" onClick={() => setQuery("")}>
                مسح البحث
              </Button>
              <Button
                variant="ghost"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                <RefreshCcw className="ml-2 h-4 w-4" /> تحديث القائمة
              </Button>
            </div>
          </div>
        ) : (
          <Accordion type="single" collapsible className="space-y-3">
            {filtered.map((faq) => {
              const id = slugify(faq.question);
              return (
                <AccordionItem
                  key={id}
                  value={id}
                  className="rounded-2xl border px-2"
                >
                  <div id={id} />
                  <AccordionTrigger className="px-2 text-right text-base font-semibold">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-2 text-justify leading-8">
                    <div className="prose prose-neutral max-w-none prose-p:my-3 rtl:prose-p:text-right">
                      <p>{faq.answer}</p>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const url = `${window.location.origin}${window.location.pathname}#${id}`;
                          navigator.clipboard.writeText(url);
                        }}
                        aria-label="نسخ رابط السؤال"
                      >
                        <LinkIcon className="ml-2 h-4 w-4" /> نسخ الرابط
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </motion.div>
    </div>
  );
}
