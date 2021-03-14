module Components
  module Navigation
    class NavigationComponent < Middleman::Extension
      def initialize(app, options_hash={}, &block)
        super
      end

      helpers do
        def main_navigation(props, &block)
          concat(
            content_tag(:div, class: "terminal-nav") do 
              content_tag(:header, class: "terminal-logo") do
                content_tag(:div, class: "logo.terminal-prompt") do
                  link_to props[:title], props[:link], class: "no-style"
                end
              end +
              content_tag(:nav, class: "terminal-menu") do
                content_tag(:ul, typeof: "BreadcrumbList", vocab: "https://schema.org/") do
                  capture_html(&block)
                end
              end
            end
          )
        end
      end
    end
  end
end

::Middleman::Extensions.register(:navigation_component, Components::Navigation::NavigationComponent)
