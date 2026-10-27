// Formats a date as 'yyyy-mm-dd' using its local calendar day (toISOString() would use the UTC one)
export const toLocalDateString = (date: Date) => {
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${mm}-${dd}`;
};
