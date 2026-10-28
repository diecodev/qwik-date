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

export const MONTHS_SM = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  es: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
} as const;

export const LABELS = {
  en: {
    calendar: 'Calendar',
    previousMonth: 'go to previous month',
    nextMonth: 'go to next month',
    selectedDate: 'selected date:',
    placeholder: 'Select a date',
  },
  es: {
    calendar: 'Calendario',
    previousMonth: 'Ir al mes anterior',
    nextMonth: 'Ir al siguiente mes',
    selectedDate: 'fecha seleccionada:',
    placeholder: 'Seleccionar una fecha',
  },
} as const satisfies Record<BuiltInLocale, Labels>;

export const WEEKDAYS = {
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  es: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
} as const satisfies Record<BuiltInLocale, string[]>;
