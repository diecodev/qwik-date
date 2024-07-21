import { component$ } from '@builder.io/qwik';
// import * as HeadlessCalendar from './lib/headless';
import { Calendar } from './lib/styled/calendar';

export default component$(() => {
  // const datesArr = createSignal<number[][]>([]);

  return (
    <>
      <head>
        <meta charset='utf-8' />
        <title>Qwik Blank App</title>
      </head>
      <body lang='en'>
        <div>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt atque sed deleniti vitae, consequuntur, ad
            accusantium suscipit reiciendis impedit non, doloribus illo? Voluptate cum commodi possimus autem doloremque
            quod odit ipsum dolore excepturi quasi fugit voluptas ratione placeat voluptatum earum, architecto,
            temporibus ad omnis error similique officia porro dolor rerum ducimus? Culpa quibusdam soluta praesentium
            animi repellat quam nostrum ex obcaecati ducimus incidunt error mollitia maiores quaerat, et assumenda eaque
            quis quia tempore voluptate quas eos voluptatibus sint. In quae ut enim animi dolor amet facilis incidunt
            velit, dicta nulla praesentium aliquid distinctio? At, nobis modi adipisci eum enim id.
          </p>
          <Calendar date='2024-08-06' iconLeft={IconLeft} iconRight={IconRight} />
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt atque sed deleniti vitae, consequuntur, ad
            accusantium suscipit reiciendis impedit non, doloribus illo? Voluptate cum commodi possimus autem doloremque
            quod odit ipsum dolore excepturi quasi fugit voluptas ratione placeat voluptatum earum, architecto,
            temporibus ad omnis error similique officia porro dolor rerum ducimus? Culpa quibusdam soluta praesentium
            animi repellat quam nostrum ex obcaecati ducimus incidunt error mollitia maiores quaerat, et assumenda eaque
            quis quia tempore voluptate quas eos voluptatibus sint. In quae ut enim animi dolor amet facilis incidunt
            velit, dicta nulla praesentium aliquid distinctio? At, nobis modi adipisci eum enim id.
          </p>
        </div>
      </body>
    </>
  );
});

const IconLeft = component$(() => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
    stroke-width='1.5'
    stroke='currentColor'
    role='graphics-symbol img'
  >
    <path stroke-linecap='round' stroke-linejoin='round' d='M6.75 15.75 3 12m0 0 3.75-3.75M3 12h18' />
  </svg>
));

const IconRight = component$(() => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
    stroke-width='1.5'
    stroke='currentColor'
    class='size-6'
    role='graphics-symbol img'
  >
    <path stroke-linecap='round' stroke-linejoin='round' d='M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3' />
  </svg>
));
