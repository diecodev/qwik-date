import { defineConfig } from "vite";
import pkg from "./package.json";
import { qwikVite } from "@builder.io/qwik/optimizer";
import tsconfigPaths from "vite-tsconfig-paths";

const { dependencies = {}, peerDependencies = {} } = pkg as any;
const makeRegex = (dep) => new RegExp(`^${dep}(/.*)?$`);
const excludeAll = (obj) => Object.keys(obj).map(makeRegex);

export default defineConfig({
  plugins: [qwikVite(), tsconfigPaths()],
  build: {
    target: "es2020",
    lib: {
      entry: {
        utils: "./src/lib/core/utils/utils.ts",
        constants: "./src/lib/core/constants/constants.ts",
        types: "./src/lib/core/types.ts",
      },
      formats: ["es", "cjs"],
      fileName: (format, entry) => {
        console.log({ format, entry });
        return `${entry}.qwik.${format === "es" ? "mjs" : "cjs"}`;
      },
    },
    rollupOptions: {
      // externalize deps that shouldn't be bundled into the library
      external: [
        /^node:.*/,
        ...excludeAll(dependencies),
        ...excludeAll(peerDependencies),
      ],
    },
  },
});
