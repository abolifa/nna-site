"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

import { Menu, ChevronRight, Search } from "lucide-react";
import clsx from "clsx";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { ModeToggle } from "./mode-toggle";

export type NavLink = {
  label: string;
  href?: string;
  children?: { label: string; href: string }[];
  badge?: string;
};

const BASE_MENU: NavLink[] = [
  { label: "الرئيسية", href: "/" },
  {
    label: "عن الهيئة",
    children: [
      { label: "عن الهيئة", href: "/about" },
      { label: "سياسة الخصوصية", href: "/privacy" },
      { label: "الهيكل التنظيمي", href: "/structure" },
      { label: "شروط الاستخدام", href: "/terms" },
      { label: "الأسئلة الشائعة", href: "/faqs" },
    ],
  },
  {
    label: "التوعية الصحية",
    children: [],
  },
  {
    label: "بوابات",
    children: [
      { label: "الخريطة التفاعلية", href: "/map" },
      { label: "بوابة المراكز", href: "https://portal.romuz.com.ly" },
      { label: "بوابة الموظفين", href: "https://romuz.com.ly" },
    ],
  },
  { label: "اتصل بنا", href: "/contact" },
];

function useMenu() {
  const { data: awareness } = useQuery({
    queryKey: ["awareness"],
    queryFn: async () => {
      const res = await api.get("/awareness");
      return res.data as { id: number; title: string }[];
    },
  });

  return React.useMemo(() => {
    return BASE_MENU.map((item) =>
      item.label === "التوعية الصحية"
        ? {
            ...item,
            children:
              awareness?.map((a) => ({
                label: a.title,
                href: `/awareness/${a.id}`,
              })) ?? [],
          }
        : item
    );
  }, [awareness]);
}

function DesktopNav() {
  const pathname = usePathname();
  const menu = useMenu();

  return (
    <div className="hidden lg:flex items-center gap-6">
      <NavigationMenu dir="rtl">
        <NavigationMenuList>
          {menu.map((item) => (
            <NavigationMenuItem key={item.label}>
              {item.children?.length ? (
                <>
                  <NavigationMenuTrigger className="text-sm">
                    {item.label}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid grid-cols-2 gap-2 p-4 bg-popover border rounded-2xl shadow-xl min-w-[520px]">
                      {item.children.map((child) =>
                        isExternal(child.href) ? (
                          <a
                            key={child.label}
                            href={child.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={clsx(
                              "group rounded-xl p-3 hover:bg-accent transition",
                              pathname === child.href &&
                                "ring-1 ring-primary/40"
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <ChevronRight size={18} className="opacity-60" />
                              <span className="font-medium">{child.label}</span>
                            </div>
                          </a>
                        ) : (
                          <Link
                            key={child.label}
                            href={child.href}
                            className={clsx(
                              "group rounded-xl p-3 hover:bg-accent transition",
                              pathname === child.href &&
                                "ring-1 ring-primary/40"
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <ChevronRight size={18} className="opacity-60" />
                              <span className="font-medium">{child.label}</span>
                            </div>
                          </Link>
                        )
                      )}
                    </div>
                  </NavigationMenuContent>
                </>
              ) : (
                <NavigationMenuLink asChild>
                  <Link
                    href={item.href ?? "#"}
                    className={clsx(
                      navigationMenuTriggerStyle(),
                      "text-base",
                      pathname === item.href && "text-primary"
                    )}
                  >
                    {item.label}
                  </Link>
                </NavigationMenuLink>
              )}
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
        <NavigationMenuViewport />
      </NavigationMenu>
    </div>
  );
}

function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const menu = useMenu();
  const pathname = usePathname();

  return (
    <div className="lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[88vw] sm:w-[420px] p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="text-base">القائمة الرئيسية</SheetTitle>
          </SheetHeader>
          <div className="p-2">
            <nav aria-label="Mobile">
              <Accordion type="single" collapsible className="px-2">
                {menu.map((item) =>
                  !item.children?.length ? (
                    <Link
                      key={item.label}
                      href={item.href ?? "#"}
                      className={clsx(
                        "flex items-center justify-between py-3 px-3 rounded-lg hover:bg-accent",
                        pathname === item.href && "bg-accent/60"
                      )}
                      onClick={() => setOpen(false)}
                    >
                      <span>{item.label}</span>
                      <ChevronRight size={18} className="opacity-60" />
                    </Link>
                  ) : (
                    <AccordionItem key={item.label} value={item.label}>
                      <AccordionTrigger className="px-3 py-3 text-base">
                        {item.label}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="ps-2 pe-1 pb-2 grid gap-1">
                          {item.children.map((child) =>
                            isExternal(child.href) ? (
                              <a
                                key={child.label}
                                href={child.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={clsx(
                                  "flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-accent"
                                )}
                                onClick={() => setOpen(false)}
                              >
                                <span className="text-sm">{child.label}</span>
                                <ChevronRight
                                  size={16}
                                  className="opacity-60"
                                />
                              </a>
                            ) : (
                              <Link
                                key={child.label}
                                href={child.href}
                                className={clsx(
                                  "flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-accent",
                                  pathname === child.href && "bg-accent/60"
                                )}
                                onClick={() => setOpen(false)}
                              >
                                <span className="text-sm">{child.label}</span>
                                <ChevronRight
                                  size={16}
                                  className="opacity-60"
                                />
                              </Link>
                            )
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )
                )}
              </Accordion>
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default function SiteNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur py-3">
      <div className="container mx-auto max-w-6xl px-4 lg:px-0">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3 min-w-0">
            <Image
              src="/logo.png"
              alt="Logo"
              width={100}
              height={100}
              className="h-10 w-auto object-contain"
              priority
            />
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-md">
                الهيئة الوطنية لأمراض الكلى
              </span>
              <span className="text-sm text-muted-foreground">
                National Nephrology Authority
              </span>
            </div>
          </Link>
          <DesktopNav />
          <MobileNav />
          <div className="mr-auto">
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}

function isExternal(href?: string) {
  if (!href) return false;
  return /^(https?:)?\/\//i.test(href);
}
