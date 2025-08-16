"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
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
  name: z.string().optional(),
  phone: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || phoneRegex.test(v), "رقم هاتف غير صالح."),
  message: z
    .string()
    .min(MIN_CHARS, {
      message: `الرسالة يجب أن تكون ${MIN_CHARS} أحرف على الأقل.`,
    })
    .max(MAX_CHARS, { message: `أقصى عدد للأحرف هو ${MAX_CHARS}.` }),
  // حقول مكافحة البوت:
  hp_company: z.string().optional(), // honeypot يجب أن يبقى فارغاً
  nonce: z.string().min(8),
  elapsed: z.number().int().nonnegative(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ApplyComplaint() {
  const [startedAt] = React.useState<number>(() => Date.now());
  const [submitting, setSubmitting] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = React.useState(false);

  // Nonce بسيط يولد عند التحميل (تحقق منه بالسيرفر لو حبيت)
  const nonce = React.useId().replace(/:/g, "").slice(0, 12);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      phone: "",
      message: "",
      hp_company: "",
      nonce,
      elapsed: 0,
    },
  });

  const msg = form.watch("message") ?? "";
  const used = msg.length;
  const remaining = Math.max(0, MAX_CHARS - used);
  const progress = Math.min(100, Math.round((used / MAX_CHARS) * 100));

  async function onSubmit(values: FormValues) {
    setServerError(null);
    setServerSuccess(false);

    const elapsedSec = Math.floor((Date.now() - startedAt) / 1000);
    if (values.hp_company) {
      setServerError("تم اكتشاف نشاط غير معتاد. الرجاء المحاولة مرة أخرى.");
      return;
    }
    if (elapsedSec < 3) {
      setServerError("الرجاء الانتظار بضع ثوانٍ قبل الإرسال.");
      return;
    }

    const payload: FormValues = {
      ...values,
      elapsed: elapsedSec,
      name: values.name?.trim() || "",
      phone: values.phone?.trim() || "",
      message: values.message.trim(),
    };

    try {
      setSubmitting(true);
      const res = await api.post("/complaints", payload);
      setServerSuccess(true);
      form.reset({
        name: "",
        phone: "",
        message: "",
        hp_company: "",
        nonce,
        elapsed: 0,
      });
    } catch (e: any) {
      setServerError(e.message || "حدث خطأ غير متوقع.");
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
            يرجى ملء البيانات التالية
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-5"
              noValidate
            >
              <div className="hidden" aria-hidden>
                <label htmlFor="hp_company">Company</label>
                <input
                  id="hp_company"
                  autoComplete="off"
                  tabIndex={-1}
                  {...form.register("hp_company")}
                />
              </div>

              <input type="hidden" value={nonce} {...form.register("nonce")} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="name">الإسم (اختياري)</FormLabel>
                      <FormControl>
                        <Input {...field} id="name" placeholder="اسمك هنا" />
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
                          placeholder="0912345678"
                          aria-describedby="phone_hint"
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
                        متبقٍ {remaining} / {MAX_CHARS}
                      </span>
                    </div>
                    <FormControl>
                      <Textarea
                        {...field}
                        id="message"
                        placeholder="اكتب تفاصيل الشكوى بوضوح…"
                        rows={6}
                        aria-describedby="message_hint"
                        maxLength={MAX_CHARS}
                        className="resize-none h-64"
                      />
                    </FormControl>
                    <FormDescription>
                      يجب أن تكون الرسالة بين {MIN_CHARS} و {MAX_CHARS} حرفًا.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* رسائل حالة السيرفر */}
              {serverError && (
                <p className="text-sm text-red-600">{serverError}</p>
              )}
              {serverSuccess && (
                <p className="text-sm text-green-600">
                  تم استلام الشكوى بنجاح. سنراجعها ونرد في أقرب وقت.
                </p>
              )}

              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  سنستخدم بياناتك وفق سياسة الخصوصية. يمكن ترك الاسم/الهاتف
                  فارغين.
                </p>
                <Button
                  type="submit"
                  className="w-36 flex items-center gap-1.5"
                  disabled={submitting || !form.formState.isValid}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      جارٍ الإرسال…
                    </>
                  ) : (
                    <>
                      <Send className="size-4" />
                      <span>إرسال</span>
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
