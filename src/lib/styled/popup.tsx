import { autoPlacement, autoUpdate, computePosition, offset, shift } from '@floating-ui/dom';
import { $, type Component, type PropsOf, component$, useId, useOnDocument, useStyles$ } from '@qwik.dev/core';
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

  // identifier: keep a user-provided `containerProps.id`, the trigger has to point at the popover's real id
  const id = useId();
  const popoverId = props.containerProps?.id ?? `qwik-date-${id}`;

  const TriggerIcon = triggerIcon ?? Calendar;

  // `qinit` is fired by the qwikloader once the container is ready (and replayed for
  // late listeners). `DOMContentLoaded` can fire before the qwikloader wires the
  // listener in some engines (WebKit), so the popover would never be positioned.
  useOnDocument(
    'qinit',
    $(() => {
      const btn = document.querySelector(`button[popovertarget="${popoverId}"]`) as HTMLButtonElement | null;
      const popover = document.getElementById(popoverId);

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
      <button type='button' {...triggerProps} popovertarget={popoverId}>
        {triggerLabel ?? TRIGGER_LABELS[props.locale ?? 'en']}
        <TriggerIcon />
      </button>
      <CalendarInline
        {...props}
        containerProps={{
          id: popoverId,
          popover: 'auto',
          ...props.containerProps,
        }}
      />
    </div>
  );
});

export { DatePicker };
