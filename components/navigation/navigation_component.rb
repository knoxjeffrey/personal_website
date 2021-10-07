module Components
  module Navigation
    class NavigationComponent < Middleman::Extension
      helpers do
        def navigation_main(opts, &block)
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

        def navigation_sub(&block)
          concat(
            content_tag(:div, class: "terminal-nav terminal-nav--sub-navigation") do 
              content_tag(:nav, class: "terminal-menu") do
                content_tag(:ul, typeof: "BreadcrumbList", vocab: "https://schema.org/") do
                  capture_html(&block)
                end
              end
            end
          )
        end

        def navigation_main_footer(&block)
          concat(
            tag(:hr) +
            content_tag(:footer) do
              capture_html(&block)
            end +
            tag(:hr)
          )
        end

        def navigation_list(&block)
          concat(
            content_tag(:nav) do
              content_tag(:ul) do
                capture_html(&block)
              end
            end
          )
        end

        def navigation_list_item(opts)
          active = opts[:active] == true || current_page.url.start_with?(opts[:link])
          active = active ? " active" : ""
          
          return item_list_element(opts, active) if opts[:item_list_element] == true
          standard_list_item(opts, active)
        end

        private

        def item_list_element(opts, active)

          content_tag(:li, property: "itemListElement", typeof: "ListItem") do
            link_to(opts[:link], build_list_html(opts, active, true)) do
              content_tag(:span, opts[:text], property: "name")
            end +
            tag(:meta, property: "position", content: opts[:position])
          end
        end

        def standard_list_item(opts, active)
          content_tag(:li) do
            link_to opts[:text], opts[:link], class: "menu-item#{active}"
          end
        end

        def build_list_html(opts, active, item_list=false)
          classes = opts.dig(:html, :class) ? "menu-item#{active} #{opts[:html][:class]}" : "menu-item#{active}"
          opts[:html] ||= {}
          opts[:html][:class] = classes
          opts[:html][:property] = "item" if item_list
          opts[:html][:typeof] = "WebPage" if item_list
          opts[:html]
        end
      end
    end
  end
end

::Middleman::Extensions.register(:navigation_component, Components::Navigation::NavigationComponent)
