import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Schedule } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isOpenNow(schedules: Schedule[] | undefined, now = new Date()) {
  if (!schedules?.length) return false;
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const today = dayNames[now.getDay()];
  const todays = schedules.filter((s) => s.is_active && s.day === today);
  if (!todays.length) return false;

  const pad = (n: number) => String(n).padStart(2, "0");
  const cur = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

  return todays.some((s) => s.start_time <= cur && cur <= s.end_time);
}

export function todayRanges(
  schedules: Schedule[] | undefined,
  now = new Date()
) {
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const today = dayNames[now.getDay()];
  return (schedules ?? [])
    .filter((s) => s.is_active && s.day === today)
    .map((s) => `${s.start_time} – ${s.end_time}`);
}
