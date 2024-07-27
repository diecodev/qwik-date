import { $, type Component, type PropsOf, component$, useId, useOnWindow, useStyles$ } from '@builder.io/qwik';
import { autoPlacement, autoUpdate, computePosition, offset, shift } from '@floating-ui/dom';
import { TRIGGER_LABELS } from '../core';
import { Calendar } from './icons';
import { CalendarInline, type CalendarInlineProps } from './inline';
import styles from './style.css?inline';

export interface DatePickerProps extends CalendarInlineProps {
  triggerProps?: PropsOf<'button'>;
  triggerIcon?: Component<PropsOf<'svg'>>;
  triggerLabel?: string;
}

const DatePicker = component$<DatePickerProps>(({ triggerProps = {}, triggerLabel, triggerIcon, ...props }) => {
  if (!props.unStyled) useStyles$(styles);

  // identifier
  const id = useId();

  const TriggerIcon = triggerIcon ?? Calendar;

  useOnWindow(
    'DOMContentLoaded',
    $(() => {
      const btn = document.querySelector(`button[popovertarget="qwik-date-${id}"]`) as HTMLButtonElement | null;
      const popover = document.querySelector(`#qwik-date-${id}`) as HTMLDivElement | null;

      if (!btn || !popover) return;

      const update = () => {
        computePosition(btn, popover, {
          placement: 'bottom',
          middleware: [
            offset(8),
            autoPlacement({
              allowedPlacements: ['bottom', 'top'],
            }),
            shift({ padding: 0 }),
          ],
        }).then(({ x, y }) => {
          Object.assign(popover.style, {
            left: `${x}px`,
            top: `${y}px`,
          });
        });
      };

      const cleanup = autoUpdate(btn, popover, update);

      update();

      return cleanup;
    }),
  );

  return (
    <div data-qwik-wrapper>
      <button type='button' {...triggerProps} popovertarget={`qwik-date-${id}`}>
        {triggerLabel ?? TRIGGER_LABELS[props.locale ?? 'en']}
        <TriggerIcon />
      </button>
      <CalendarInline
        {...props}
        containerProps={{
          id: `qwik-date-${id}`,
          popover: 'auto',
          ...props.containerProps,
        }}
      />
    </div>
  );
});

export { DatePicker };
