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

proxy "_headers", "netlify-headers", ignore: true
proxy "_redirects", "netlify-redirects", ignore: true

activate :blog do |blog|
  blog.prefix = "blog"
  blog.name = "blog"
  blog.sources = "/{year}-{month}-{day}-{title}.html"
  blog.permalink = "{title}.html"
  blog.layout = "layouts/blog_article"
  blog.tag_template = "blog/tag.html"
  blog.taglink = "category/{tag}.html"
  blog.paginate = true
  blog.per_page = 10
  blog.publish_future_dated = true
  blog.generate_month_pages = false
  blog.generate_day_pages = false
  blog.generate_year_pages = false
  blog.summary_separator = /<!--more-->/
end

activate :directory_indexes

activate :external_pipeline,
         name: :webpack,
         command: build? ? "yarn run build" : "yarn run start",
         source: ".tmp/dist",
         latency: 1

configure :build do
  activate :asset_hash
  activate :minify_css
end
