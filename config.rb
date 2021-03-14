# require all components
require_all "./components/**/*.rb"

# Per-page layout changes
page "/*.xml", layout: false
page "/*.json", layout: false
page "/*.txt", layout: false

config[:css_dir]      = "assets/stylesheets"
config[:images_dir]   = "assets/images"
config[:js_dir]       = "assets/javascripts"

# activate all components
Pathname.new("./components").children.each do |entry|
  return unless entry.directory?
  activate "#{entry.basename.to_s}_component".to_sym
end

activate :external_pipeline,
         name: :webpack,
         command: build? ? "yarn run build" : "yarn run start",
         source: "dist",
         latency: 1
