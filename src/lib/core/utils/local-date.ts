// Formats a date as 'yyyy-mm-dd' using its local calendar day (toISOString() would use the UTC one)
export const toLocalDateString = (date: Date) => {
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${mm}-${dd}`;
};

// Parses a 'yyyy-mm-dd' string as a local date (new Date('yyyy-mm-dd') would parse it as UTC midnight)
export const parseLocalDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// Adds months keeping the day inside the target month (Jan 31 + 1 month is Feb 29, not Mar 2)
export const addMonths = (date: Date, months: number) => {
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const daysInTarget = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(date.getDate(), daysInTarget));
  return target;
};

// A 'yyyy-mm-dd' string whose day exists in that month (the format alone accepts 2024-02-31)
export const isValidLocalDate = (value: string) => {
  if (!/^\d{4}-(0[1-9]|1[0-2])-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split('-').map(Number);
  return day >= 1 && day <= new Date(year, month, 0).getDate();
};
