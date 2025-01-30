import { $, component$ } from '@builder.io/qwik';
// import * as HeadlessCalendar from './lib/headless';
import { DatePicker } from './lib';

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
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloremque, dignissimos. Eaque blanditiis ipsam
          perspiciatis provident facilis accusantium accusamus quae nostrum illo sequi? Suscipit praesentium similique
          voluptatum esse, et libero necessitatibus quo obcaecati voluptatibus corporis saepe inventore soluta tempore
          non amet, enim deleniti quia numquam itaque laboriosam! Cum molestias iusto itaque error quasi aut voluptas
          quaerat ipsam, fuga dolore sint non officia suscipit ullam dolorem impedit molestiae? Nostrum laboriosam
          beatae pariatur iusto libero nihil molestias dolore hic. In ullam cupiditate repellat architecto quasi esse
          explicabo. Totam ad aliquid, hic tempore odio alias ex vero temporibus! Quisquam facilis ratione qui quasi
          repellat!
        </p>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloremque, dignissimos. Eaque blanditiis ipsam
          perspiciatis provident facilis accusantium accusamus quae nostrum illo sequi? Suscipit praesentium similique
          voluptatum esse, et libero necessitatibus quo obcaecati voluptatibus corporis saepe inventore soluta tempore
          non amet, enim deleniti quia numquam itaque laboriosam! Cum molestias iusto itaque error quasi aut voluptas
          quaerat ipsam, fuga dolore sint non officia suscipit ullam dolorem impedit molestiae? Nostrum laboriosam
          beatae pariatur iusto libero nihil molestias dolore hic. In ullam cupiditate repellat architecto quasi esse
          explicabo. Totam ad aliquid, hic tempore odio alias ex vero temporibus! Quisquam facilis ratione qui quasi
          repellat!
        </p>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloremque, dignissimos. Eaque blanditiis ipsam
          perspiciatis provident facilis accusantium accusamus quae nostrum illo sequi? Suscipit praesentium similique
          voluptatum esse, et libero necessitatibus quo obcaecati voluptatibus corporis saepe inventore soluta tempore
          non amet, enim deleniti quia numquam itaque laboriosam! Cum molestias iusto itaque error quasi aut voluptas
          quaerat ipsam, fuga dolore sint non officia suscipit ullam dolorem impedit molestiae? Nostrum laboriosam
          beatae pariatur iusto libero nihil molestias dolore hic. In ullam cupiditate repellat architecto quasi esse
          explicabo. Totam ad aliquid, hic tempore odio alias ex vero temporibus! Quisquam facilis ratione qui quasi
          repellat!
        </p>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloremque, dignissimos. Eaque blanditiis ipsam
          perspiciatis provident facilis accusantium accusamus quae nostrum illo sequi? Suscipit praesentium similique
          voluptatum esse, et libero necessitatibus quo obcaecati voluptatibus corporis saepe inventore soluta tempore
          non amet, enim deleniti quia numquam itaque laboriosam! Cum molestias iusto itaque error quasi aut voluptas
          quaerat ipsam, fuga dolore sint non officia suscipit ullam dolorem impedit molestiae? Nostrum laboriosam
          beatae pariatur iusto libero nihil molestias dolore hic. In ullam cupiditate repellat architecto quasi esse
          explicabo. Totam ad aliquid, hic tempore odio alias ex vero temporibus! Quisquam facilis ratione qui quasi
          repellat!
        </p>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloremque, dignissimos. Eaque blanditiis ipsam
          perspiciatis provident facilis accusantium accusamus quae nostrum illo sequi? Suscipit praesentium similique
          voluptatum esse, et libero necessitatibus quo obcaecati voluptatibus corporis saepe inventore soluta tempore
          non amet, enim deleniti quia numquam itaque laboriosam! Cum molestias iusto itaque error quasi aut voluptas
          quaerat ipsam, fuga dolore sint non officia suscipit ullam dolorem impedit molestiae? Nostrum laboriosam
          beatae pariatur iusto libero nihil molestias dolore hic. In ullam cupiditate repellat architecto quasi esse
          explicabo. Totam ad aliquid, hic tempore odio alias ex vero temporibus! Quisquam facilis ratione qui quasi
          repellat!
        </p>
        <DatePicker
          fullWeeks
          defaultOpen={false}
          onDateChange$={$((date) => {
            console.log('Date changed:', date);
          })}
        />
      </body>
    </>
  );
});
