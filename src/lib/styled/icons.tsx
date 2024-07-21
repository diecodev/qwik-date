import { component$ } from '@builder.io/qwik';

export const ChevronLeft = component$(() => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      stroke-width={1}
      stroke='currentColor'
      role='graphics-symbol img'
    >
      <path stroke-linecap='round' stroke-linejoin='round' d='M15.75 19.5 8.25 12l7.5-7.5' />
    </svg>
  );
});

export const ChevronRight = component$(() => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      stroke-width={1}
      stroke='currentColor'
      role='graphics-symbol img'
    >
      <path stroke-linecap='round' stroke-linejoin='round' d='m8.25 4.5 7.5 7.5-7.5 7.5' />
    </svg>
  );
});
