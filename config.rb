require "vite_ruby"
require "vite_padrino/tag_helpers"

# Per-page layout changes
page "/*.xml", layout: false
page "/*.json", layout: false
page "/*.txt", layout: false

config[:images_dir] = "assets/images"

proxy "_headers", "netlify-headers", ignore: true
proxy "_redirects", "netlify-redirects", ignore: true

# load and activate all components
Dir["./components/**/*.rb"].each { |file| load file }
Pathname.new("./components").children.each do |entry|
  return unless entry.directory?
  activate "#{entry.basename.to_s}_component".to_sym
end

# Vite configuration
configure :development do
  use ViteRuby::DevServerProxy, ssl_verify_none: true
end
helpers VitePadrino::TagHelpers

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

configure :build do
  activate :minify_html do |config|
    config.remove_quotes = false
    config.remove_input_attributes = false
    config.remove_style_attributes = false
    config.remove_link_attributes = false
  end
end
