// src/components/calendar/keyboard-navigation.ts
import { $ } from '@builder.io/qwik';
import type { Signal } from '@builder.io/qwik';
import { ACTION_KEYS } from '../constants';
import type { LocalDate, Month } from '../types';

interface KeyboardNavigationParams {
  currentMonth: Signal<Month>;
  navigateMonth: (direction: 'prev' | 'next', newDate?: LocalDate) => void;
  updateFocusDate: Signal<LocalDate>;
}

interface FocusMovement {
  newIndex: number;
  newDate?: LocalDate;
  monthNavigation?: 'prev' | 'next';
}

/**
 * Creates a keyboard handler for calendar navigation
 */
export const createKeyDownHandler = ({ currentMonth, navigateMonth, updateFocusDate }: KeyboardNavigationParams) => {
  /**
   * Finds the nearest focusable index in the given direction
   */
  const findFocusableIndex = $((buttons: HTMLButtonElement[], currentIndex: number, step: number): number => {
    const newIndex = currentIndex + step;
    const isValidIndex = newIndex >= 0 && newIndex < buttons.length;
    const isFocusable = isValidIndex && !buttons[newIndex].disabled;

    return isFocusable ? newIndex : currentIndex;
  });

  /**
   * Handles arrow key navigation (Up/Down/Left/Right)
   */
  const handleArrowKey = $(
    async (key: string, buttons: HTMLButtonElement[], currentIndex: number): Promise<FocusMovement> => {
      const steps: Record<string, number> = {
        arrowup: -7,
        arrowdown: 7,
        arrowleft: -1,
        arrowright: 1,
      };

      const step = steps[key];
      const newIndex = await findFocusableIndex(buttons, currentIndex, step);

      if (newIndex === currentIndex) {
        const currentDate = new Date(buttons[currentIndex].dataset.value!);
        const direction = key === 'arrowup' || key === 'arrowleft' ? 'prev' : 'next';

        currentDate.setDate(currentDate.getDate() + step);
        return {
          newIndex,
          newDate: currentDate.toISOString().split('T')[0] as LocalDate,
          monthNavigation: direction,
        };
      }

      return { newIndex };
    },
  );

  /**
   * Handles month changes (PageUp/PageDown)
   */
  const handleMonthChange = $((button: HTMLButtonElement, direction: 'prev' | 'next'): FocusMovement => {
    const currentDate = new Date(button.dataset.value!);
    currentDate.setMonth(currentDate.getMonth() + (direction === 'prev' ? -1 : 1));

    return {
      newIndex: -1, // Will be updated after month change
      newDate: currentDate.toISOString().split('T')[0] as LocalDate,
      monthNavigation: direction,
    };
  });

  /**
   * Handles row navigation (Home/End)
   */
  const handleRowNavigation = $(
    (buttons: HTMLButtonElement[], currentIndex: number, position: 'start' | 'end'): FocusMovement => {
      const rowIndex = Math.floor(currentIndex / 7);
      const rowStart = rowIndex * 7;
      const rowEnd = Math.min(rowStart + 6, buttons.length - 1);

      const targetIndex = position === 'start' ? rowStart : rowEnd;
      const targetDate = buttons[targetIndex].dataset.value! as LocalDate;
      const needsMonthChange = targetDate.split('-')[1] !== currentMonth.value;

      return {
        newIndex: targetIndex,
        newDate: targetDate,
        monthNavigation: needsMonthChange ? (position === 'start' ? 'prev' : 'next') : undefined,
      };
    },
  );

  /**
   * Main keyboard handler
   */
  return $(async (event: KeyboardEvent, tbody: HTMLTableSectionElement) => {
    const key = event.key.toLowerCase();
    if (!ACTION_KEYS.includes(key as any)) return;

    const focusedButton = document.activeElement as HTMLButtonElement | null;
    if (!focusedButton?.matches('button')) return;

    const buttons = Array.from(tbody.querySelectorAll('button'));
    const currentIndex = buttons.indexOf(focusedButton);

    let movement: FocusMovement = { newIndex: currentIndex };

    switch (key) {
      case 'arrowup':
      case 'arrowdown':
      case 'arrowleft':
      case 'arrowright':
        movement = await handleArrowKey(key, buttons, currentIndex);
        break;

      case 'pageup':
        movement = await handleMonthChange(focusedButton, 'prev');
        break;

      case 'pagedown':
        movement = await handleMonthChange(focusedButton, 'next');
        break;

      case 'home':
        movement = await handleRowNavigation(buttons, currentIndex, 'start');
        break;

      case 'end':
        movement = await handleRowNavigation(buttons, currentIndex, 'end');
        break;

      case ' ':
      case 'enter':
        focusedButton.click();
        return;
    }

    // Update month if needed
    if (movement.monthNavigation) {
      navigateMonth(movement.monthNavigation, movement.newDate);
    }

    // Determine focus target date
    const targetDate = movement.newDate || (buttons[movement.newIndex]?.dataset.value as LocalDate);
    if (!targetDate) return;

    // Update focus state
    updateFocusDate.value = targetDate;
    for (const button of buttons) {
      button.tabIndex = -1;
    }

    const targetButton = buttons[movement.newIndex];
    targetButton.tabIndex = 0;
    targetButton.focus({ preventScroll: true });
  });
};
