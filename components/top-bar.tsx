import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { CalendarDays, Languages, MapPin } from "lucide-react";
import React from "react";

const TopBar = () => {
  return (
    <div
      className="w-full bg-primary p-3 flex items-center justify-between border-b-2 border-rose-600 text-primary-foreground"
      role="banner"
    >
      <div className="flex items-center gap-5 container mx-auto px-4 lg:px-8">
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
    </div>
  );
};

export default TopBar;
