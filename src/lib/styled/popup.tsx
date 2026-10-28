import { autoPlacement, autoUpdate, computePosition, offset, shift } from '@floating-ui/dom';
import { type Component, type PropsOf, component$, isSignal, useId, useStyles$, useVisibleTask$ } from '@qwik.dev/core';
import { TRIGGER_LABELS } from '../core';
import { CalendarIcon } from './icons';
import { Calendar, type CalendarProps } from './inline';
import styles from './style.css?inline';

export interface DatePickerProps extends CalendarProps {
  triggerProps?: PropsOf<'button'>;
  triggerIcon?: Component<PropsOf<'svg'>>;
  triggerLabel?: string;
}

const DatePicker = component$<DatePickerProps>(({ triggerProps = {}, triggerLabel, triggerIcon, ...props }) => {
  // always called: hooks can't be conditional, `unstyled` instances are excluded by the stylesheet itself
  useStyles$(styles);

  // identifier: keep a user-provided `containerProps.id`, the trigger has to point at the popover's real id
  const id = useId();
  const popoverId = props.containerProps?.id ?? `qwik-date-${id}`;

  const TriggerIcon = triggerIcon ?? CalendarIcon;
  const theme = props.theme ?? 'light';
  const themeValue = isSignal(theme) ? theme.value : theme;

  // The `document-ready` strategy runs on `qinit`, fired by the qwikloader once the container is
  // ready (and replayed for late listeners). `DOMContentLoaded` can fire before the qwikloader wires
  // the listener in some engines (WebKit), and the default strategy waits for the element to be
  // visible, which a closed popover never is. Unlike a plain `qinit` listener, a task can register a
  // cleanup, so floating-ui stops watching once the DatePicker is removed.
  useVisibleTask$(
    ({ cleanup }) => {
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
          // the browser's [popover] defaults (inset: 0, margin: auto) would center it, so the
          // placement styles are set here instead of relying on the stylesheet (absent with unstyled)
          Object.assign(popover.style, {
            position: 'absolute',
            inset: 'auto',
            margin: '0',
            left: `${x}px`,
            top: `${y}px`,
          });
        });
      };

      cleanup(autoUpdate(btn, popover, update));

      update();
    },
    { strategy: 'document-ready' },
  );

  return (
    <div data-qwik-wrapper data-unstyled={props.unstyled} data-theme={themeValue}>
      <button type='button' {...triggerProps} popovertarget={popoverId}>
        {triggerLabel ?? TRIGGER_LABELS[props.locale ?? 'en']}
        <TriggerIcon />
      </button>
      <Calendar
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
