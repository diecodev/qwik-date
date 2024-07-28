import { $, component$ } from '@builder.io/qwik';
// import * as HeadlessCalendar from './lib/headless';
import { Calendar, DatePicker } from './lib';

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
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt atque sed deleniti vitae, consequuntur, ad
            accusantium suscipit reiciendis impedit non, doloribus illo? Voluptate cum commodi possimus autem doloremque
            quod odit ipsum dolore excepturi quasi fugit voluptas ratione placeat voluptatum earum, architecto,
            temporibus ad omnis error similique officia porro dolor rerum ducimus? Culpa quibusdam soluta praesentium
            animi repellat quam nostrum ex obcaecati ducimus incidunt error mollitia maiores quaerat, et assumenda eaque
            quis quia tempore voluptate quas eos voluptatibus sint. In quae ut enim animi dolor amet facilis incidunt
            velit, dicta nulla praesentium aliquid distinctio? At, nobis modi adipisci eum enim id.
          </p>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt atque sed deleniti vitae, consequuntur, ad
            accusantium suscipit reiciendis impedit non, doloribus illo? Voluptate cum commodi possimus autem doloremque
            quod odit ipsum dolore excepturi quasi fugit voluptas ratione placeat voluptatum earum, architecto,
            temporibus ad omnis error similique officia porro dolor rerum ducimus? Culpa quibusdam soluta praesentium
            animi repellat quam nostrum ex obcaecati ducimus incidunt error mollitia maiores quaerat, et assumenda eaque
            quis quia tempore voluptate quas eos voluptatibus sint. In quae ut enim animi dolor amet facilis incidunt
            velit, dicta nulla praesentium aliquid distinctio? At, nobis modi adipisci eum enim id.
          </p>
          <div style={{ display: 'flex' }}>
            <span>
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ullam id sequi quod saepe accusamus quisquam
              provident distinctio
            </span>
            <Calendar
              date='2024-08-06'
              onDateChange$={$((date) => {
                console.log('Date changed:', date);
              })}
            />
            <DatePicker
              date='2024-08-06'
              onDateChange$={$((date) => {
                console.log('Date changed:', date);
              })}
            />
          </div>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt atque sed deleniti vitae, consequuntur, ad
            accusantium suscipit reiciendis impedit non, doloribus illo? Voluptate cum commodi possimus autem doloremque
            quod odit ipsum dolore excepturi quasi fugit voluptas ratione placeat voluptatum earum, architecto,
            temporibus ad omnis error similique officia porro dolor rerum ducimus? Culpa quibusdam soluta praesentium
            animi repellat quam nostrum ex obcaecati ducimus incidunt error mollitia maiores quaerat, et assumenda eaque
            quis quia tempore voluptate quas eos voluptatibus sint. In quae ut enim animi dolor amet facilis incidunt
            velit, dicta nulla praesentium aliquid distinctio? At, nobis modi adipisci eum enim id.
          </p>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt atque sed deleniti vitae, consequuntur, ad
            accusantium suscipit reiciendis impedit non, doloribus illo? Voluptate cum commodi possimus autem doloremque
            quod odit ipsum dolore excepturi quasi fugit voluptas ratione placeat voluptatum earum, architecto,
            temporibus ad omnis error similique officia porro dolor rerum ducimus? Culpa quibusdam soluta praesentium
            animi repellat quam nostrum ex obcaecati ducimus incidunt error mollitia maiores quaerat, et assumenda eaque
            quis quia tempore voluptate quas eos voluptatibus sint. In quae ut enim animi dolor amet facilis incidunt
            velit, dicta nulla praesentium aliquid distinctio? At, nobis modi adipisci eum enim id.
          </p>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt atque sed deleniti vitae, consequuntur, ad
            accusantium suscipit reiciendis impedit non, doloribus illo? Voluptate cum commodi possimus autem doloremque
            quod odit ipsum dolore excepturi quasi fugit voluptas ratione placeat voluptatum earum, architecto,
            temporibus ad omnis error similique officia porro dolor rerum ducimus? Culpa quibusdam soluta praesentium
            animi repellat quam nostrum ex obcaecati ducimus incidunt error mollitia maiores quaerat, et assumenda eaque
            quis quia tempore voluptate quas eos voluptatibus sint. In quae ut enim animi dolor amet facilis incidunt
            velit, dicta nulla praesentium aliquid distinctio? At, nobis modi adipisci eum enim id.
          </p>
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
