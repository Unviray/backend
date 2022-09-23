import { defineConfig } from "vite";
import { VitePluginNode } from "vite-plugin-node";

const importMode = false;

export default defineConfig({
  server: {
    // vite server configs, for details see [vite doc](https://vitejs.dev/config/#server-host)
    port: 3000,
  },
  plugins: [
    ...VitePluginNode({
      exportName: "sreport",
      adapter: "express",
      appPath: importMode ? "./scripts/import_es21.ts" : "./src/index.ts",
    }),
  ],
  optimizeDeps: {},
});
