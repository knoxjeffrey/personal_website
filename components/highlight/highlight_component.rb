module Components
  module Highlight
    class HighlightComponent < Middleman::Extension
      helpers do
        def highlight(opts, &block)
          concat(
            content_tag(:pre) do
              content_tag(:code, class: "hljs #{opts[:code]}") do
                CGI.escapeHTML(capture_html(&block))
              end
            end
          )
        end
      end
    end
  end
end

::Middleman::Extensions.register(:highlight_component, Components::Highlight::HighlightComponent)
