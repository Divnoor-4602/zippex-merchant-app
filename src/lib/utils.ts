import { type ClassValue, clsx } from "clsx";
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

// Helper function to convert timestamp to Date object
export function timestampToDate(timestamp: {
  seconds: number;
  nanoseconds: number;
}) {
  return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
}

// Helper function to get the start of the week (Sunday) for a given date
export function getStartOfWeek(date: Date) {
  const dayOfWeek = date.getDay(); // Sunday is 0, Monday is 1, etc.
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - dayOfWeek); // Get previous Sunday
  return new Date(startOfWeek.setHours(0, 0, 0, 0)); // Set to midnight
}

// Helper function to get the end of the week (Saturday) for a given date
export function getEndOfWeek(date: Date) {
  const dayOfWeek = date.getDay();
  const endOfWeek = new Date(date);
  endOfWeek.setDate(date.getDate() + (6 - dayOfWeek)); // Get Saturday
  return new Date(endOfWeek.setHours(23, 59, 59, 999)); // Set to end of the day
}

export function getMonthName(monthNumber: number) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return months[monthNumber - 1];
}

export function getDayName(dayNumber: number) {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[dayNumber];
}
