import {
  $,
  type Component,
  component$,
  type PropsOf,
  type Signal,
  useComputed$,
  useSignal,
  useStyles$,
  useVisibleTask$,
} from '@builder.io/qwik';
import { isServer } from '@builder.io/qwik/build';
import { ARIA_LABELS, MONTHS_LG, WEEKDAYS, daysArrGenerator, getWeekNumber, type Locale } from '../core';
import { ChevronLeft, ChevronRight } from './icons';
import styles from './style.css?inline';

const regex = /^\d{4}-(0[1-9]|1[0-2])-\d{2}$/;
const dateFormatter = (locale: Locale) =>
  new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

type LocalDate = `${number}-${number}-${number}`;
type Month = '01' | '02' | '03' | '04' | '05' | '06' | '07' | '08' | '09' | '10' | '11' | '12';
const ACTION_KEYS = [
  'enter',
  ' ',
  'arrowup',
  'arrowdown',
  'arrowleft',
  'arrowright',
  'home',
  'end',
  'pageup',
  'pagedown',
] as const;

interface QwikCalendarProps extends PropsOf<'div'> {
  locale?: Locale;
  showWeekNumber?: boolean;
  fullWeeks?: boolean;
  date?: LocalDate;
  'bind:date'?: Signal<LocalDate>;
  showDaysOfWeek?: boolean;
  unStyled?: boolean;
  iconLeft?: Component<PropsOf<'svg'>>;
  iconRight?: Component<PropsOf<'svg'>>;
}

const QwikCalendar = component$<QwikCalendarProps>(
  ({
    date: dateProp,
    fullWeeks = false,
    locale = 'en',
    showWeekNumber = false,
    showDaysOfWeek = true,
    unStyled = false,
    iconLeft,
    iconRight,
    ...props
  }) => {
    if (!unStyled) useStyles$(styles);

    // root constants
    const date = new Date().toISOString().split('T')[0] as LocalDate;
    const labelStr = props['aria-label'] ?? ARIA_LABELS[locale].root;

    // signals
    const dateSignal = useSignal<LocalDate>(dateProp ?? date);
    const defaultDate = props['bind:date'] ?? dateSignal;
    const activeDate = useSignal<LocalDate>(defaultDate.value);
    const monthToRender = useSignal<Month>(defaultDate.value.split('-')[1] as Month);
    const yearToRender = useSignal<number>(+defaultDate.value.split('-')[0]);
    const dateToFocus = useSignal<LocalDate>(activeDate.value);

    // computed
    const labelSignal = useComputed$(() => {
      const [year, month] = activeDate.value.split('-');

      return `${labelStr} ${MONTHS_LG[locale][+month - 1]} ${year}`;
    });
    const datesArray = useComputed$(() => {
      const dates = daysArrGenerator({
        month: monthToRender.value,
        year: yearToRender.value.toString(),
        fullWeeks,
      });
      return dates;
    });

    if (!regex.test(defaultDate.value))
      throw new Error('Invalid date format in Calendar. Please use YYYY-MM-DD format.');

    // header utils
    const hMonth = MONTHS_LG[locale][+monthToRender.value - 1];
    const hTitle = `${hMonth} ${yearToRender.value}`;
    const decreaseDate = $(() => {
      console.log('decrease fn');
      if (monthToRender.value === '01') {
        monthToRender.value = '12';
        yearToRender.value -= 1;
        return;
      }

      monthToRender.value = String(+monthToRender.value - 1).padStart(2, '0') as Month;
    });
    const increaseDate = $(() => {
      if (monthToRender.value === '12') {
        monthToRender.value = '01';
        yearToRender.value += 1;
        return;
      }

      monthToRender.value = String(+monthToRender.value + 1).padStart(2, '0') as Month;
    });

    // days of the week
    const daysOfWeek = WEEKDAYS[locale];

    // icons
    const IconLeft = iconLeft ?? ChevronLeft;
    const IconRight = iconRight ?? ChevronRight;

    // events handlers
    const updateDateFocused = $((e: KeyboardEvent, tbody: HTMLTableSectionElement) => {
      if (!ACTION_KEYS.includes(e.key.toLowerCase() as (typeof ACTION_KEYS)[number])) return;

      const elFocus = document.activeElement;

      if (elFocus?.tagName.toLowerCase() !== 'button') return;

      const buttons = Array.from(tbody.getElementsByTagName('button'));

      const getNewIndex = ({ currentIdx, step }: { currentIdx: number; step: number }) => {
        const newIdx = currentIdx + step;

        if (newIdx < 0 || newIdx >= buttons.length) return currentIdx;

        const btn = buttons[newIdx];

        if (btn.hasAttribute('disabled')) return currentIdx;

        return newIdx;
      };

      const idx = buttons.indexOf(elFocus as HTMLButtonElement);

      // local helpers
      let localIdx: number = idx;
      let newDate: LocalDate | null = null;

      switch (e.key.toLowerCase()) {
        case 'arrowup': {
          localIdx = getNewIndex({ currentIdx: idx, step: -7 });
          if (idx === localIdx) {
            const d = new Date(elFocus.getAttribute('data-value') as LocalDate);
            newDate = new Date(d.setDate(d.getDate() - 7)).toISOString().split('T')[0] as LocalDate;

            decreaseDate();
          }
          break;
        }
        case 'arrowdown': {
          localIdx = getNewIndex({ currentIdx: idx, step: 7 });
          if (idx === localIdx) {
            const d = new Date(elFocus.getAttribute('data-value') as LocalDate);
            newDate = new Date(d.setDate(d.getDate() + 7)).toISOString().split('T')[0] as LocalDate;

            increaseDate();
          }

          break;
        }
        case 'arrowleft': {
          localIdx = getNewIndex({ currentIdx: idx, step: -1 });
          if (idx === localIdx) {
            const d = new Date(elFocus.getAttribute('data-value') as LocalDate);
            newDate = new Date(d.setDate(d.getDate() - 1)).toISOString().split('T')[0] as LocalDate;

            decreaseDate();
          }
          break;
        }
        case 'arrowright': {
          localIdx = getNewIndex({ currentIdx: idx, step: 1 });
          if (idx === localIdx) {
            const d = new Date(elFocus.getAttribute('data-value') as LocalDate);
            newDate = new Date(d.setDate(d.getDate() + 1)).toISOString().split('T')[0] as LocalDate;

            increaseDate();
          }
          break;
        }
      }

      dateToFocus.value = newDate ?? (buttons[localIdx].getAttribute('data-value') as LocalDate);
    });

    useVisibleTask$(({ track, cleanup }) => {
      track(() => dateToFocus.value);
      track(() => datesArray.value);

      if (isServer) return;

      if (datesArray.value.flat().includes(dateToFocus.value)) {
        const btn = document.querySelector(`button[data-value="${dateToFocus.value}"]`) as HTMLButtonElement | null;
        btn?.focus();
        console.log('focus', btn?.value, btn?.getAttribute('data-value'));
        btn?.setAttribute('tabindex', '0');
      }

      cleanup(() => {
        const btn = document.querySelector(`button[data-value="${dateToFocus.value}"]`) as HTMLButtonElement | null;
        btn?.setAttribute('tabindex', '-1');
        btn?.blur();
      });
    });

    return (
      <div data-qwik-date data-theme='light' aria-label={labelSignal.value} {...props}>
        <header>
          <button
            type='button'
            onClick$={[
              decreaseDate,
              $(() => {
                dateToFocus.value = `${yearToRender.value}-${monthToRender.value}-01`;
              }),
            ]}
            aria-label={ARIA_LABELS[locale].previous}
          >
            <IconLeft />
          </button>

          <div aria-live='polite' role='presentation' {...props}>
            {hTitle}
          </div>

          <button
            type='button'
            onClick$={[
              increaseDate,
              $(() => {
                dateToFocus.value = `${yearToRender.value}-${monthToRender.value}-01`;
              }),
            ]}
            aria-label={ARIA_LABELS[locale].next}
          >
            <IconRight />
          </button>
        </header>

        <table tabIndex={-1} role='grid' aria-labelledby={props['aria-labelledby']} {...props}>
          {showDaysOfWeek && (
            <thead {...props}>
              <tr {...props}>
                {showWeekNumber && <td />}
                {daysOfWeek.map((day) => (
                  <th key={day} scope='col' aria-label={day}>
                    {
                      day
                        .slice(0, 2)
                        .normalize('NFD')
                        .replace(/\p{M}/gu, '') // remove accents, special things on letters, etc.
                    }
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody
            {...props}
            onKeyDown$={[
              $((e: KeyboardEvent, target: HTMLTableSectionElement) => {
                updateDateFocused(e, target);
              }),
            ]}
          >
            {datesArray.value.map((week) => {
              return (
                <tr key={week.toString()}>
                  {showWeekNumber && (
                    <td>
                      <span>{getWeekNumber(week.filter((day) => day !== null)[0]).toString()}</span>
                    </td>
                  )}
                  {week.map((day) => {
                    const label = day ? dateFormatter(locale).format(new Date(`${day}T12:00:00`)) : undefined; // the T12:00:00 is to avoid timezone issues
                    const disabled = day?.split('-')[1] !== monthToRender.value;

                    return (
                      <td key={`${week.toString()}-${day}`} role='presentation' aria-disabled={disabled}>
                        {day && (
                          <button
                            type='button'
                            data-preselected={day === activeDate.value}
                            data-value={day}
                            aria-label={label}
                            disabled={disabled}
                            tabIndex={day === dateToFocus.value ? 0 : -1}
                          >
                            {day.split('-')[2]}
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  },
);

export { QwikCalendar as Calendar };
