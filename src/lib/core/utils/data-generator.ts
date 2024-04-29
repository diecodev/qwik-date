interface YearsProps {
  minYear: number;
  activeYear: number;
  maxYear: number;
}
interface InlineYearsObject {
  prevYear: number | null;
  nextYear: number | null;
}
export function generateInlineYearsObject({
  activeYear,
  maxYear,
  minYear,
}: YearsProps): InlineYearsObject | undefined {
  if (minYear > maxYear) {
    throw new Error("minimum year cannot be greater than maximum year");
  }

  if (activeYear < minYear || activeYear > maxYear) {
    throw new Error("active year must be between min and max years");
  }

  if (minYear === maxYear) {
    return {
      prevYear: null,
      nextYear: null,
    };
  }

  return {
    prevYear: activeYear === minYear ? null : activeYear - 1,
    nextYear: activeYear === maxYear ? null : activeYear + 1,
  };
}

interface MonthsProps {
  activeMonth: number;
  maxMonth?: number;
  minMonth?: number;
  maxYear?: number;
  minYear?: number;
  activeYear?: number;
}
interface InlineMonthsObject {
  prevMonth: number | null;
  nextMonth: number | null;
}
export function generateInlineMonthsObject({
  activeMonth,
  activeYear = new Date().getFullYear(),
  maxMonth = new Date().getMonth(),
  maxYear = new Date().getFullYear(),
  minMonth = new Date().getMonth(),
  minYear = new Date().getFullYear(),
}: MonthsProps): InlineMonthsObject | undefined {
  if (minMonth > maxMonth && minYear >= maxYear) {
    throw new Error(
      "minimum month/year cannot be greater than maximum month/year"
    );
  }

  if (
    (activeMonth < minMonth && activeYear <= minYear) ||
    (activeMonth > maxMonth && activeYear >= maxYear)
  ) {
    throw new Error("active month must be between min and max months");
  }

  if (
    minMonth === maxMonth &&
    activeYear === minYear &&
    activeYear === maxYear
  ) {
    return {
      prevMonth: null,
      nextMonth: null,
    };
  }

  let prevMonth: number = activeMonth - 1;
  let nextMonth: number = activeMonth + 1;

  if (activeMonth === 0) {
    prevMonth = 11;
  }

  if (activeMonth === 11) {
    nextMonth = 0;
  }

  return {
    prevMonth:
      activeMonth === minMonth && activeYear === minYear ? null : prevMonth,
    nextMonth:
      activeMonth === maxMonth && activeYear === maxYear ? null : nextMonth,
  };
}

interface DaysProps {
  activeDate: Date | string;
  minDate?: Date | string;
  maxDate?: Date | string;
}

export function generateDaysGrid({ activeDate, minDate, maxDate }: DaysProps) {
  const date = new Date();
  const min = new Date(
    minDate ?? (date.getFullYear() - 1, date.getMonth(), date.getDate())
  );
  const max = new Date(maxDate ?? date);
  console.log({ min, max });

  if (min > max) {
    throw new Error("minimum date cannot be greater than maximum date");
  }

  const active = new Date(activeDate);

  if (active < min || active > max) {
    throw new Error("active date must be between min and max dates");
  }

  const daysInMonth = new Date(
    active.getFullYear(),
    active.getMonth() + 1,
    0
  ).getDate();
  const firstWeekDay = new Date(
    active.getFullYear(),
    active.getMonth(),
    1
  ).getDay();

  const days = [];

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return {
    days,
    weekDayStart: firstWeekDay,
  };
}

console.log(
  generateDaysGrid({
    activeDate: new Date(),
    minDate: new Date(2024, 2, 31),
    maxDate: new Date(2024, 3, 30),
  })
);
