require "./lib/asset_hash_import_from"

# Per-page layout changes
page "/*.xml", layout: false
page "/*.json", layout: false
page "/*.txt", layout: false

config[:css_dir]      = "assets"
config[:images_dir]   = "assets/images"
config[:js_dir]       = "assets"

proxy "_headers", "netlify-headers", ignore: true
proxy "_redirects", "netlify-redirects", ignore: true

# load and activate all components
Dir["./components/**/*.rb"].each { |file| load file }
Pathname.new("./components").children.each do |entry|
  return unless entry.directory?
  activate "#{entry.basename.to_s}_component".to_sym
end

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
         command: build? ? "yarn run build" : "yarn run dev",
         source: ".tmp/dist",
         latency: 1

configure :build do
  activate :asset_hash
  # activate :asset_hash_import_from
  activate :minify_html do |config|
    config.remove_quotes = false
    config.remove_input_attributes = false
    config.remove_style_attributes = false
    config.remove_link_attributes = false
  end
end
