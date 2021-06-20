import globImport from "rollup-plugin-glob-import"
import esbuild from "rollup-plugin-esbuild"
import path from "path"

export default {
  server: {
    port: "3333"
  },
  build: {
    brotliSize: false,
    emptyOutDir: true,
    minify: "esbuild",
    outDir: ".tmp/dist/assets",
    rollupOptions: {
      input: {
        "main": path.resolve(__dirname, "./source/assets/javascripts/main.js"),
        "components": path.resolve(__dirname, "./source/assets/javascripts/components.js"),
        "game": path.resolve(__dirname, "./source/assets/javascripts/game/game.js"),
        "main_css": path.resolve(__dirname, "./source/assets/stylesheets/main.css"),
        "components_css": path.resolve(__dirname, "./source/assets/stylesheets/components.css"),
        "commento_css": path.resolve(__dirname, "./source/assets/stylesheets/commento.css"),
        "game_css": path.resolve(__dirname, "./source/assets/stylesheets/game.css")
      },
      output: {
        format: "es",
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name].[ext]"
      },
      plugins: [
        esbuild({
          target: "es2015"
        }),
        globImport()
      ]
    }
  }
}
