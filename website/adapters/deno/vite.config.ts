import { denoServerAdapter } from "@qwik.dev/router/adapters/deno-server/vite";
import { extendConfig } from "@qwik.dev/router/vite";
import baseConfig from "../../vite.config";

export default extendConfig(baseConfig, () => {
  return {
    build: {
      ssr: true,
      rolldownOptions: {
        input: ["src/entry.deno.ts"],
      },
      minify: false,
    },
    plugins: [
      denoServerAdapter({
        ssg: {
          include: ["/*"],
          origin: "https://qwik-date.dieco.dev",
        },
      }),
    ],
  };
});
