import globImport from "rollup-plugin-glob-import"
import esbuild from "rollup-plugin-esbuild"
import path from "path"

export default {
  build: {
    brotliSize: false,
    emptyOutDir: true,
    minify: "esbuild",
    outDir: ".tmp/dist/assets",
    rollupOptions: {
      input: {
        "components": path.resolve(__dirname, "./source/assets/javascripts/components.js"),
        "main": path.resolve(__dirname, "./source/assets/javascripts/main.js"),
        "game": path.resolve(__dirname, "./source/assets/javascripts/game/game.js"),
        "commento_css": path.resolve(__dirname, "./source/assets/stylesheets/commento.css"),
        "components_css": path.resolve(__dirname, "./source/assets/stylesheets/components.css"),
        "game_css": path.resolve(__dirname, "./source/assets/stylesheets/game.css"),
        "main_css": path.resolve(__dirname, "./source/assets/stylesheets/main.css"),
      },
      output: {
        assetFileNames: "[name].[ext]",
        chunkFileNames: "[name].js",
        entryFileNames: "[name].js",
        format: "es"
      },
      plugins: [
        esbuild({
          target: "es2015"
        }),
        globImport()
      ]
    }
  },
  server: {
    port: "3333"
  }
}
