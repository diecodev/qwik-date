import type { Month } from '../types';

export const daysArrGenerator = ({
  month,
  year,
  fullWeeks = false,
}: {
  month: Month;
  year: string;
  fullWeeks?: boolean;
}) => {
  const date = new Date(+year, +month - 1, 1);
  const firstDayOfWeek = date.getDay();
  const daysInMonth = new Date(+year, +month, 0).getDate();

  const weeks = [];
  let currentWeek = [];

  // Helper function to format date as 'yyyy-mm-dd'
  const formatDate = (y: number, m: number, d: number) => {
    const mm = m < 10 ? `0${m}` : m;
    const dd = d < 10 ? `0${d}` : d;
    return `${y}-${mm}-${dd}`;
  };

  // Fill the previous month's days if fullWeeks is true
  if (fullWeeks) {
    // Previous month's details
    const prevMonth = +month === 1 ? 12 : +month - 1;
    const prevYear = +month === 1 ? +year - 1 : +year;
    const daysInPrevMonth = new Date(prevYear, prevMonth, 0).getDate();

    // Fill the previous month's days
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      currentWeek.push(formatDate(prevYear, prevMonth, daysInPrevMonth - i));
    }
  } else {
    // Fill the previous days with nulls
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push(null);
    }
  }

  // Fill the current month's days
  for (let day = 1; day <= daysInMonth; day++) {
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(formatDate(+year, +month, day));
  }

  // Fill the next month's days if fullWeeks is true
  if (fullWeeks) {
    let nextMonthDay = 1;
    const nextMonth = +month === 12 ? 1 : +month + 1;
    const nextYear = +month === 12 ? +year + 1 : +year;

    while (currentWeek.length < 7) {
      currentWeek.push(formatDate(nextYear, nextMonth, nextMonthDay++));
    }
    weeks.push(currentWeek);

    while (weeks.length < 6) {
      currentWeek = [];
      for (let i = 0; i < 7; i++) {
        currentWeek.push(formatDate(nextYear, nextMonth, nextMonthDay++));
      }
      weeks.push(currentWeek);
    }
  } else {
    // Fill the rest of the last week with nulls
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  return weeks;
};
