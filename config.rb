# require all components
require_all "./components/**/*.rb"

BLOG_PATH = "./content/blog".freeze

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

Dir.each_child(BLOG_PATH) do |filename|
  loader = ->(string) { YAML.load(string) }
  parsed = FrontMatterParser::Parser.parse_file("#{BLOG_PATH}/#{filename}", loader: loader)
  
  path = filename.match /\d{4}-\d{2}-\d{2}-(?<name>.*).md/
  proxy "/blog/#{path[:name]}/index.html",
        "/blog/article_template.html",
        locals: { frontmatter: parsed.front_matter, content: parsed.content },
        ignore: true
end

activate :external_pipeline,
         name: :webpack,
         command: build? ? "yarn run build" : "yarn run start",
         source: "dist",
         latency: 1
