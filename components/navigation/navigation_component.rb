module Components
  module Navigation
    class NavigationComponent < Middleman::Extension
      def initialize(app, options_hash={}, &block)
        super
      end

      helpers do
        def main_navigation(opts, &block)
          concat(
            content_tag(:div, class: "terminal-nav") do 
              content_tag(:header, class: "terminal-logo") do
                content_tag(:div, class: "logo terminal-prompt") do
                  link_to opts[:title], opts[:link], class: "no-style"
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

        def main_footer(&block)
          concat(
            tag(:hr) +
            content_tag(:footer) do
              capture_html(&block)
            end +
            tag(:hr)
          )
        end

        def navigation_list_item(opts)
          active = opts[:active] == true || opts[:link] == current_page.url
          active = active ? " active" : ""
          
          content_tag(:li) do
            link_to opts[:text], opts[:link], class: "menu-item#{active}"
          end
        end
      end
    end
  end
end

::Middleman::Extensions.register(:navigation_component, Components::Navigation::NavigationComponent)
