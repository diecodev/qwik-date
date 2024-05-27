import { component$ } from "@builder.io/qwik";

const props = [
  {
    name: "defaultDate",
    description: `The default date to display (use ISO string or 'yyyy-mm-dd')`,
    default: "today",
  },
  {
    name: "minDate",
    description: `The minimum date to display`,
    default: "-100 years",
  },
  {
    name: "maxDate",
    description: `The maximum date to display`,
    default: "+100 years",
  },
  {
    name: "theme",
    description: `The theme of the calendar`,
    default: "system",
  },
  {
    name: "locale",
    description: `The locale of the calendar`,
    default: "en",
  },
  {
    name: "showWeekNumbers",
    description: `Show the week numbers`,
    default: "false",
  },
  {
    name: "showWeekdays",
    description: `Show the weekdays`,
    default: "true",
  },
  {
    name: "onDateSelect$",
    description: `The callback function to call when a date is selected`,
    default: "-",
  },
  {
    name: "prevButtonProps",
    description: `The props for the previous button`,
    default: "-",
  },
  {
    name: "nextButtonProps",
    description: `The props for the next button`,
    default: "-",
  },
  {
    name: "headerProps",
    description: `The props for the header`,
    default: "-",
  },
  {
    name: "dateButtonProps",
    description: `The props for the date button`,
    default: "-",
  },
  {
    name: "format",
    description: `The format of the date`,
    default: "yyyy-mm-dd",
  },
  {
    name: "separator",
    description: `The separator of the date`,
    default: "-",
  },
  {
    name: "edgeArrows",
    description: `Show the edge arrows`,
    default: "false",
  },
  {
    name: "arrowLeftIcon",
    description: `The icon for the left arrow`,
    default: "-",
  },
  {
    name: "arrowRightIcon",
    description: `The icon for the right arrow`,
    default: "-",
  },
  {
    name: "completeWeeks",
    description: `Show the complete weeks`,
    default: "false",
  },
  {
    name: "dir",
    description: `The direction of the calendar`,
    default: "ltr",
  },
];

export const Docs = component$(() => {
  return (
    <table class="border-collapse border border-neutral-200 text-sm leading-none">
      <thead>
        <tr class="dark:text-white">
          <th class="border border-neutral-200 p-3 pl-4 text-left">Property</th>
          <th class="border border-neutral-200 p-3">Description</th>
          <th class="border border-neutral-200 p-3 pr-4 text-right">Default</th>
        </tr>
      </thead>
      <tbody class="text-neutral-800 dark:text-neutral-300">
        {props.map((prop) => (
          <tr key={prop.name}>
            <td class="border border-neutral-200 p-2 px-4 ">{prop.name}</td>
            <td class="border border-neutral-200 p-2 text-center leading-relaxed">
              {prop.description}
            </td>
            <td class="w-32 border border-neutral-200 p-2 pr-4 text-right text-neutral-500">
              <div class="ml-auto w-fit rounded-md bg-neutral-100 px-2 py-1 text-right font-mono text-xs dark:bg-neutral-800 dark:text-neutral-300">
                {prop.default}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
});
