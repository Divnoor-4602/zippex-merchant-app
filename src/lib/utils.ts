import { type ClassValue, clsx } from "clsx";
import { useRouter } from "next/navigation";
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subWeeks,
} from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalizeFirstLetter(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export function getPreviousWeekRange() {
  const now = new Date();
  const startWeek = startOfWeek(subWeeks(now, 0), { weekStartsOn: 1 }); // Last Monday
  const endWeek = endOfWeek(subWeeks(now, 0), { weekStartsOn: 1 }); // Last Sunday
  return { startWeek, endWeek };
}

export function getMonthRange() {
  const date = new Date();
  const startMonth = startOfMonth(date);
  const endMonth = endOfMonth(date);
  return { startMonth, endMonth };
}

export function getDayRange() {
  const date = new Date();
  const startDay = startOfDay(date);
  const endDay = endOfDay(date);
  return { startDay, endDay };
}
