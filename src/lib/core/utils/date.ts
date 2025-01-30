import type { LocalDate, Month } from '../types';

type DaysArrParams = {
  month: Month;
  year: string;
  fullWeeks?: boolean;
};

const formatDate = (y: number, m: number, d: number) => {
  const mm = m < 10 ? `0${m}` : m;
  const dd = d < 10 ? `0${d}` : d;
  return `${y}-${mm}-${dd}`;
};

const getCalendarStartDate = (year: number, month: number) => {
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(1 - firstDayOfWeek);
  return startDate;
};

const generateFullWeeks = (year: number, month: number) => {
  const startDate = getCalendarStartDate(year, month);
  const days: string[] = [];

  for (let i = 0; i < 42; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    days.push(formatDate(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate()));
  }

  return Array.from({ length: 6 }, (_, i) => days.slice(i * 7, (i + 1) * 7));
};

const generatePartialWeeks = (year: number, month: number) => {
  const firstDayOfMonth = new Date(year, month - 1, 1);
  // Fix: Handle Sunday (0) by converting it to 7, otherwise use the day number
  const firstDayOfWeek = firstDayOfMonth.getDay();
  console.log({ firstDayOfWeek, firstDayOfMonth });
  const daysInMonth = new Date(year, month, 0).getDate();

  const previousDays = Array(firstDayOfWeek).fill(null);
  const currentDays = Array.from({ length: daysInMonth }, (_, i) => formatDate(year, month, i + 1));
  const totalDays = previousDays.length + currentDays.length;
  const trailingNulls = Array((7 - (totalDays % 7)) % 7).fill(null);

  const allDays = [...previousDays, ...currentDays, ...trailingNulls];
  return Array.from({ length: allDays.length / 7 }, (_, i) => allDays.slice(i * 7, (i + 1) * 7));
};

export const generateCalendarDays = ({ month, year, fullWeeks = false }: DaysArrParams) => {
  const numericYear = Number.parseInt(year, 10);
  const numericMonth = Number.parseInt(month, 10);

  return fullWeeks ? generateFullWeeks(numericYear, numericMonth) : generatePartialWeeks(numericYear, numericMonth);
};

/**
 * Calculates ISO week number for a date
 * @param date - Date in LocalDate format
 * @returns ISO week number
 */
export const getISOWeekNumber = (date: LocalDate): number => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
};
