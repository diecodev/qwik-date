import { $, component$ } from '@builder.io/qwik';
// import * as HeadlessCalendar from './lib/headless';
import { Calendar } from './lib';

export default component$(() => {
  // const datesArr = createSignal<number[][]>([]);

  return (
    <>
      <head>
        <meta charset='utf-8' />
        <title>Qwik Blank App</title>
        <meta name='viewport' content='width=device-width, initial-scale=1' />
      </head>
      <body lang='en'>
        <Calendar
          fullWeeks
          onDateChange$={$((date) => {
            console.log('Date changed:', date);
          })}
        />
      </body>
    </>
  );
});
