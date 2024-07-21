export const getWeekNumber = (dateString: string) => {
  const date = new Date(dateString);
  const target = new Date(date.valueOf());
  const dayNumber = (date.getDay() + 6) % 7; // Make Monday=0, Tuesday=1, ..., Sunday=6
  target.setDate(target.getDate() - dayNumber + 3); // Set to nearest Thursday
  const firstThursday = new Date(target.getFullYear(), 0, 4); // The first Thursday of the year
  const weekNumber =
    1 +
    Math.round(((target.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getDay() + 6) % 7)) / 7);
  return weekNumber;
};
