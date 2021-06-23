import esbuild from "rollup-plugin-esbuild"
import globImport from "rollup-plugin-glob-import"

export default ({ command, mode }) => {
  let minifySetting
  
  if (mode === "development") {
    minifySetting = false  
  } else {
    minifySetting = "esbuild" 
  }

  return {
    build: {
      brotliSize: false,
      emptyOutDir: true,
      minify: minifySetting,
      outDir: ".tmp/dist/assets",
      rollupOptions: {
        input: {
          "components": "./source/assets/javascripts/components.js",
          "main": "./source/assets/javascripts/main.js",
          "game": "./source/assets/javascripts/game/game.js",
          "commento_css": "./source/assets/stylesheets/commento.css",
          "components_css": "./source/assets/stylesheets/components.css",
          "game_css": "./source/assets/stylesheets/game.css",
          "main_css": "./source/assets/stylesheets/main.css",
        },
        output: {
          assetFileNames: "[name].css",
          chunkFileNames: "[name].js",
          entryFileNames: "[name].js",
          format: "es",
          manualChunks: {
            game_vendor: ["crypto-es"]
          }
        },
        plugins: [
          esbuild({
            target: "es2015"
          }),
          globImport()
        ],
      }
    },
    server: {
      port: "3333"
    }
  }
}
