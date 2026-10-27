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
