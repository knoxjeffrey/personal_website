require "./components/button/button_component"
require "./components/navigation/navigation_component"

# Per-page layout changes
page "/*.xml", layout: false
page "/*.json", layout: false
page "/*.txt", layout: false

config[:images_dir] = "assets/images"
config[:js_dir]     = "assets/javascripts"
config[:css_dir]    = "assets/stylesheets"

activate :button_component
activate :navigation_component

activate :external_pipeline,
         name: :webpack,
         command: build? ? "yarn run build" : "yarn run start",
         source: "dist",
         latency: 1
