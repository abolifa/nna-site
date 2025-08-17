import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import {
  CalendarDays,
  Facebook,
  Instagram,
  Languages,
  Linkedin,
  Twitter,
} from "lucide-react";
import React from "react";

const TopBar = () => {
  return (
    <div
      className="w-full bg-primary p-4 border-b-2 border-rose-600 text-primary-foreground"
      role="banner"
    >
      <div className="container mx-auto px-4 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1 text-sm">
            <CalendarDays className="w-4 h-4" />
            <span>{format(new Date(), "MMMM dd, yyyy", { locale: arSA })}</span>
          </div>
          <div className="h-4 border-l" />
          <div className="flex items-center gap-1 text-sm">
            <Languages className="w-4 h-4" />
            <span>العربية</span>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <a
            href="https://www.facebook.com/NNA.KSA"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-foreground hover:text-primary-foreground/80"
          >
            <Facebook className="w-5 h-5" />
          </a>
          <a
            href="https://www.twitter.com/NNA_KSA"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-foreground hover:text-primary-foreground/80"
          >
            <Twitter className="w-5 h-5" />
          </a>
          <a
            href="https://www.linkedin.com/company/nna-ksa"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-foreground hover:text-primary-foreground/80"
          >
            <Linkedin className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
