import esbuild from "rollup-plugin-esbuild"
import { defineConfig } from "vite"
import RubyPlugin from "vite-plugin-ruby"

export default defineConfig({
  build: {
    brotliSize: false,
    emptyOutDir: true,
    minify: "esbuild",
    rollupOptions: {
      output: {
        format: "es",
        manualChunks: {
          game_vendor: ["crypto-es"]
        }
      }
    }
  },
  plugins: [
    esbuild({
      target: [
        "es2020"
      ]
    }),
    RubyPlugin(),
  ]
})
