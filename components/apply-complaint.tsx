"use client";

import React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, ShieldCheck, Loader2 } from "lucide-react";
import api from "@/lib/api";

const MAX_CHARS = 500;
const MIN_CHARS = 10;
const phoneRegex = /^\+?\d{8,15}$/;

const formSchema = z.object({
  name: z.string().max(120).optional(),
  phone: z
    .string()
    .optional()
    .refine((v) => !v || phoneRegex.test(v), "Invalid phone number."),
  message: z
    .string()
    .min(MIN_CHARS, `Message must be at least ${MIN_CHARS} characters.`)
    .max(MAX_CHARS, `Max characters is ${MAX_CHARS}.`),
  // keep honeypot
  hp_company: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ApplyComplaint() {
  const [submitting, setSubmitting] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      phone: "",
      message: "",
      hp_company: "",
    },
  });

  const msg = form.watch("message") ?? "";
  const remaining = Math.max(0, MAX_CHARS - msg.length);

  async function onSubmit(values: FormValues) {
    setServerError(null);
    setServerSuccess(false);

    // Honeypot check only. No timers, no key listeners.
    if (values.hp_company) {
      setServerError("تم الكشف عن نشاط مشبوه. يرجى المحاولة مرة أخرى.");
      return;
    }

    const payload = {
      name: (values.name ?? "").trim(),
      phone: (values.phone ?? "").trim(),
      message: values.message.trim(),
    };

    try {
      setSubmitting(true);
      await api.post("/complaints", payload);
      setServerSuccess(true);
      form.reset({
        name: "",
        phone: "",
        message: "",
        hp_company: "",
      });
    } catch (e: any) {
      setServerError(e?.message || "حدث خطأ غير متوقع.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-bold">تقديم شكوى</h2>
        <Badge className="gap-1 bg-green-50 text-green-600" variant="secondary">
          <ShieldCheck className="size-4" />
          نموذج آمن
        </Badge>
      </div>

      <Card className="border rounded-lg">
        <CardHeader>
          <CardTitle className="text-base md:text-lg">
            يرجى ملء التفاصيل
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-5"
              noValidate
            >
              {/* Honeypot (hidden) */}
              <div className="hidden" aria-hidden>
                <label htmlFor="hp_company">Company</label>
                <input
                  id="hp_company"
                  autoComplete="off"
                  tabIndex={-1}
                  {...form.register("hp_company")}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="name">الاسم (اختياري)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          id="name"
                          inputMode="text"
                          autoComplete="name"
                          placeholder="Your name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="phone">
                        رقم الهاتف (اختياري)
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          id="phone"
                          inputMode="tel"
                          autoComplete="tel"
                          placeholder="0912345678"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel htmlFor="message">الرسالة</FormLabel>
                      <span className="text-xs text-muted-foreground">
                        متبقي {remaining} / {MAX_CHARS}
                      </span>
                    </div>
                    <FormControl>
                      <Textarea
                        {...field}
                        id="message"
                        placeholder="قم بكتابة شكواك بوضوح..."
                        rows={6}
                        maxLength={MAX_CHARS}
                        className="resize-none h-64"
                      />
                    </FormControl>
                    <FormDescription>
                      الرسالة يجب أن تكون بين {MIN_CHARS} و {MAX_CHARS} حرفًا.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {serverError && (
                <p className="text-sm text-red-600">{serverError}</p>
              )}
              {serverSuccess && (
                <p className="text-sm text-green-600">
                  تم استلام شكواك. سنقوم بمراجعتها والرد قريبًا.
                </p>
              )}

              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  سيتم التعامل مع بياناتك وفقًا لسياسة الخصوصية الخاصة بنا.
                </p>
                <Button
                  type="submit"
                  className="w-36 flex items-center gap-1.5"
                  disabled={submitting || !form.formState.isValid}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <Send className="size-4" />
                      <span>Send</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
