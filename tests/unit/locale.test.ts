import { describe, expect, it } from 'vitest';
import { formatDate, formatMonth, resolveLabels, weekdayNames } from '../../src/lib/core';

describe('resolveLabels', () => {
  it('uses the built-in texts of en and es, with overrides', () => {
    expect(resolveLabels('es').previousMonth).toBe('Ir al mes anterior');
    const labels = resolveLabels('en', { calendar: 'Due date' });
    expect(labels.calendar).toBe('Due date');
    expect(labels.nextMonth).toBe('go to next month');
  });

  it('takes the given texts for any other locale', () => {
    const fr = {
      calendar: 'Calendrier',
      previousMonth: 'Mois précédent',
      nextMonth: 'Mois suivant',
      selectedDate: 'date sélectionnée :',
      placeholder: 'Choisir une date',
    };
    expect(resolveLabels('fr', fr)).toEqual(fr);
  });
});

describe('formatMonth', () => {
  it('keeps the built-in names of en and es', () => {
    expect(formatMonth(2024, 8, 'en')).toBe('August 2024');
    expect(formatMonth(2024, 8, 'es')).toBe('Agosto 2024');
  });

  it('takes any other language from Intl, with a capital month', () => {
    expect(formatMonth(2024, 8, 'fr-FR')).toBe('Août 2024');
    expect(formatMonth(2024, 8, 'pt-BR')).toBe('Agosto de 2024');
    expect(formatMonth(2024, 8, 'ja')).toBe('2024年8月');
  });
});

describe('weekdayNames', () => {
  it('starts on weekStartsOn', () => {
    expect(weekdayNames('en').map((day) => day.short)).toEqual(['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']);
    expect(weekdayNames('es', 1).map((day) => day.short)).toEqual(['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do']);
    expect(weekdayNames('en', 6)[0]).toEqual({ short: 'Sa', long: 'Saturday' });
  });

  it('takes any other language from Intl, capitalized', () => {
    expect(weekdayNames('fr-FR', 1)[0]).toEqual({ short: 'Lun.', long: 'Lundi' });
    expect(weekdayNames('de')[0]).toEqual({ short: 'So', long: 'Sonntag' });
  });
});

describe('formatDate', () => {
  it('formats any language, with a two-digit day and a capital month', () => {
    expect(formatDate('2024-08-01', 'fr-FR')).toBe('01 Août 2024');
    expect(formatDate('2024-08-01', 'de')).toBe('01. Aug. 2024');
  });
});
