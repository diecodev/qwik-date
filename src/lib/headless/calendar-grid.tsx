import {
  $,
  component$,
  PropsOf,
  Slot,
  useComputed$,
  useContext,
} from "@builder.io/qwik";
import { QwikDateCtxId } from "./context";
import { generateDaysGrid, WEEKDAYS } from "../core";
import { getClientLocalDate } from "../core/utils/timezone-formatter";

export const CalendarGrid = component$<PropsOf<"table">>((props) => {
  return (
    <table {...props} role="grid" aria-labelledby="qwik-date-heading">
      <Slot />
    </table>
  );
});

export const CalendarWeekdays = component$<PropsOf<"thead">>((props) => {
  const { locale } = useContext(QwikDateCtxId);

  return (
    <thead {...props}>
      <tr>
        {WEEKDAYS[locale].map((day) => (
          <th key={day} scope="col" aria-label={day}>
            {day
              .slice(0, 2)
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")}
          </th>
        ))}
      </tr>
    </thead>
  );
});

export const CalendarDays = component$<PropsOf<"button">>((props) => {
  const { dateToRender, minDate, maxDate, completeWeeks, locale, activeDate } =
    useContext(QwikDateCtxId);

  const daysArr = useComputed$(() => {
    return generateDaysGrid({
      activeDate: dateToRender.value,
      minDate: minDate.value,
      maxDate: maxDate.value,
      completeWeeks: completeWeeks,
    });
  });

  const intlFormat = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  const validateIfDisabled = (props: {
    day: string | null;
    minDate: Date;
    maxDate: Date;
  }) => {
    const { day, minDate, maxDate } = props;
    if (!day) return true;

    const localMinDate = getClientLocalDate({
      date: minDate,
      locale,
    });

    const localMaxDate = getClientLocalDate({
      date: maxDate,
      locale,
    });

    return day >= localMaxDate || day < localMinDate;
  };

  const validateIfSelected = (props: {
    day: string | null;
    activeDate: Date | null;
  }) => {
    const { day, activeDate } = props;
    if (!day) return false;

    if (!activeDate) return false;

    const localActiveDate = getClientLocalDate({
      date: activeDate,
      locale,
    });

    return day === localActiveDate;
  };

  return (
    <tbody role="rowgroup">
      {daysArr.value.days.map((arr, arrIdx) => (
        <tr key={arr.join("")}>
          {arr.map((day, idx) => {
            const disabled = validateIfDisabled({
              day,
              minDate: minDate.value,
              maxDate: maxDate.value,
            });

            const isSelected = validateIfSelected({
              day,
              activeDate: activeDate.value,
            });

            return (
              <td role="presentation" key={idx} aria-disabled={disabled}>
                {day && (
                  <button
                    {...props}
                    role="gridcell"
                    name="day"
                    tabIndex={-1}
                    type="button"
                    aria-selected={isSelected}
                    onClick$={[
                      props.onClick$,
                      $(() => {
                        // convert `day` to a Date object but respecting the client's timezone (is UTC by default)
                        const currentTZ = new Date().getTimezoneOffset();
                        const rawDateObject = new Date(day + "T00:00:00Z");
                        rawDateObject.setMinutes(currentTZ);
                        activeDate.value = rawDateObject;
                      }),
                    ]}
                    aria-label={intlFormat.format(new Date(day))}
                    data-value={day}
                    disabled={disabled}
                    data-qwik-date-day
                  >
                    {day.split("-")[2]}
                  </button>
                )}
              </td>
            );
          })}
        </tr>
      ))}
    </tbody>
  );
});
