import { defineConfig } from "vite";
import pkg from "./package.json" with { type: "json" };
import { qwikVite } from "@qwik.dev/core/optimizer";
import { qwikRouter } from "@qwik.dev/router/vite";

type DepMap = Record<string, string>;
const { dependencies = {}, peerDependencies = {} } = pkg as {
  dependencies?: DepMap;
  peerDependencies?: DepMap;
};
const makeRegex = (dep: string) => new RegExp(`^${dep}(/.*)?$`);
const excludeAll = (obj: DepMap) => Object.keys(obj).map(makeRegex);

export default defineConfig(({ command }) => {
  return {
    // In Qwik v2 the dev SSR server lives in qwikRouter(), so the playground in
    // src/routes needs it. It is left out of builds: the lib never uses the router.
    plugins: [qwikVite(), ...(command === "serve" ? [qwikRouter()] : [])],
    build: {
      target: "es2020",
      outDir: "lib",
      lib: {
        // Entry names map 1:1 to the paths in package.json#exports.
        entry: {
          index: "src/lib/index.ts",
        },
        // Qwik v2 (@qwik.dev/core) is ESM-only, so there is no CJS output.
        formats: ["es"],
        fileName: (_format, entryName) => `${entryName}.qwik.mjs`,
      },
      emptyOutDir: true,
      rolldownOptions: {
        output: {
          chunkFileNames: "[name]-[hash].qwik.mjs",
        },
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
