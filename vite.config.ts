import { defineConfig } from "vite";
import pkg from "./package.json";
import { qwikVite } from "@builder.io/qwik/optimizer";
import tsconfigPaths from "vite-tsconfig-paths";

const { dependencies = {}, peerDependencies = {} } = pkg as any;
const makeRegex = (dep) => new RegExp(`^${dep}(/.*)?$`);
const excludeAll = (obj) => Object.keys(obj).map(makeRegex);

export default defineConfig(({ command }) => {
  const env = process.env.ENTRY as "styled" | "headless" | undefined;

  if (!env && command === "build") throw new Error("ENTRY env var is required");

  const entry =
    env === "headless"
      ? "src/lib/headless/index.ts"
      : "src/lib/styled/calendar.tsx";

  return {
    plugins: [qwikVite(), tsconfigPaths()],
    build: {
      target: "es2020",
      outDir: "lib",
      lib: {
        entry,
        formats: ["es", "cjs"],
        fileName: (format) => {
          const ext = format === "es" ? "mjs" : "cjs";
          const name = env === "headless" ? "headless" : "index";
          return `${name}.qwik.${ext}`;
        },
      },
      emptyOutDir: env === "headless",
      rollupOptions: {
        // externalize deps that shouldn't be bundled into the library
        external: [
          /^node:.*/,
          ...excludeAll(dependencies),
          ...excludeAll(peerDependencies),
        ],
      },
    },
  };
});
