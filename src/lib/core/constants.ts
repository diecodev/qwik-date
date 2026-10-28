import type { BuiltInLocale, Labels } from './types';

export const MONTHS_LG = {
  en: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  es: [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ],
} as const;

export const LABELS = {
  en: {
    calendar: 'Calendar',
    previousMonth: 'go to previous month',
    nextMonth: 'go to next month',
    previousYear: 'go to previous year',
    nextYear: 'go to next year',
    previousYears: 'go to previous years',
    nextYears: 'go to next years',
    selectedDate: 'selected date:',
    selectedRange: 'selected range:',
    selectedDates: 'selected dates:',
  },
  es: {
    calendar: 'Calendario',
    previousMonth: 'Ir al mes anterior',
    nextMonth: 'Ir al siguiente mes',
    previousYear: 'Ir al año anterior',
    nextYear: 'Ir al siguiente año',
    previousYears: 'Ir a los años anteriores',
    nextYears: 'Ir a los siguientes años',
    selectedDate: 'fecha seleccionada:',
    selectedRange: 'rango seleccionado:',
    selectedDates: 'fechas seleccionadas:',
  },
} as const satisfies Record<BuiltInLocale, Labels>;

export const WEEKDAYS = {
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  es: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
} as const satisfies Record<BuiltInLocale, string[]>;
