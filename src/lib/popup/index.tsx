import {
  $,
  type Component,
  type PropsOf,
  type Signal,
  component$,
  useId,
  useOnWindow,
  useSignal,
  useStyles$,
} from '@builder.io/qwik';
import { autoPlacement, autoUpdate, computePosition, offset, shift } from '@floating-ui/dom';
import { TRIGGER_LABELS } from '../core';
import { Calendar as CalendarInline, type CalendarInlineProps } from '../index';
import { Calendar } from './icons';
import styles from './style.css?inline';

export interface DatePickerProps extends CalendarInlineProps {
  triggerProps?: PropsOf<'button'>;
  triggerIcon?: Component<PropsOf<'svg'>>;
  triggerLabel?: string;
  defaultOpen?: boolean;
}

const DatePicker = component$<DatePickerProps>(
  ({ triggerProps = {}, triggerLabel, triggerIcon, defaultOpen = false, ...props }) => {
    if (!props.unStyled) useStyles$(styles);

    const inlineRef = (props.containerProps?.ref as Signal<HTMLDivElement>) || useSignal<HTMLDivElement>();
    const triggerRef = (triggerProps.ref as Signal<HTMLButtonElement>) || useSignal<HTMLButtonElement>();

    // identifier
    const id = useId();

    const TriggerIcon = triggerIcon ?? Calendar;

    useOnWindow(
      'DOMContentLoaded',
      $(() => {
        const btn = triggerRef.value;
        const popover = inlineRef.value;

        if (!btn || !popover) return;

        // if (defaultOpen) {
        //   console.log({ defaultOpen });
        //   btn.click();
        // }

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
        <button type='button' {...triggerProps} ref={triggerRef} popovertarget={`qwik-date-${id}`}>
          {triggerLabel ?? TRIGGER_LABELS[props.locale ?? 'en']}
          <TriggerIcon />
        </button>

        <CalendarInline
          {...props}
          containerProps={{
            id: `qwik-date-${id}`,
            popover: 'auto',
            ref: inlineRef,
            ...props.containerProps,
          }}
        />
      </div>
    );
  },
);

export { DatePicker };
