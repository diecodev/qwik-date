import { defineConfig } from "vite";
import pkg from "./package.json";
import { qwikVite } from "@builder.io/qwik/optimizer";
import tsconfigPaths from "vite-tsconfig-paths";

const { dependencies = {}, peerDependencies = {} } = pkg as any;
const makeRegex = (dep) => new RegExp(`^${dep}(/.*)?$`);
const excludeAll = (obj) => Object.keys(obj).map(makeRegex);

export default defineConfig(({ command }) => {
  return {
    plugins: [qwikVite(), tsconfigPaths()],
    build: {
      target: "esnext",
      outDir: "lib",
      lib: {
        entry: [
          "src/lib/styled/inline.tsx",
          "src/lib/styled/popup.tsx",
          "src/lib/index.ts",
        ],
        fileName: (format, entry) => {
          const ext = format === 'es' ? 'mjs' : 'cjs';
          const name = entry;
          return `${name}.qwik.${ext}`;
        },
      },
      emptyOutDir: true,
      rollupOptions: {
        output: {
          preserveModules: true,
          preserveModulesRoot: 'src/lib',
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
