"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";

export default function CookieConsent() {
  useEffect(() => {
    const accepted = localStorage.getItem("cookie-consent");
    if (!accepted) {
      toast.custom(
        (id) => (
          <div className="p-4 w-[400px] bg-background rounded-xl shadow-md border">
            <div className="flex items-center font-medium mb-2">
              <Cookie className="ml-2 h-5 w-5 text-muted-foreground" />
              <span>نستخدم ملفات تعريف الارتباط</span>
            </div>
            <p className="text-muted-foreground mb-3">
              لتحسين تجربتك على الموقع. بالمتابعة فأنت توافق على سياسة الخصوصية.
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  toast.dismiss(id);
                }}
              >
                رفض
              </Button>
              <Button
                size="sm"
                variant={"outline"}
                onClick={() => {
                  localStorage.setItem("cookie-consent", "true");
                  toast.dismiss(id);
                }}
              >
                قبول
              </Button>
            </div>
          </div>
        ),
        { duration: Infinity }
      ); // stay until dismissed
    }
  }, []);

  return null; // doesn’t render UI directly
}
