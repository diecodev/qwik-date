import { component$, type PropsOf, Slot } from "@builder.io/qwik";

export const Button = component$<
  Pick<PropsOf<"button">, "onClick$"> & { active: boolean }
>((props) => {
  return (
    <button
      onClick$={props.onClick$}
      class={[
        "rounded-xl border-2 px-3 py-1 text-sm transition-all",
        props.active
          ? "border-black bg-black font-medium text-white dark:border-white dark:bg-white dark:text-black"
          : "border-neutral-400 bg-white text-neutral-500 dark:border-neutral-300 dark:bg-black dark:text-neutral-300",
      ]}
    >
      <Slot />
    </button>
  );
});
