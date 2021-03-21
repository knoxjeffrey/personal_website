# Helpers to assist with building out HTML
module HtmlHelpers
  def render_erb_from_string(content)
    ERB.new(content).result(binding)
  end
end
