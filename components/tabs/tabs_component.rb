module Components
  module Tabs
    class TabsComponent < Middleman::Extension
      helpers do
        def tabs(&block)
          concat(
            content_tag(:div, class: "terminal-tabs") do 
              content_tag(:ul) do
                capture_html(&block)
              end
            end
          )
        end

        def tab_list_item(opts)
          content_tag(:li, opts[:text], build_list_html(opts))
        end

        private

        def build_list_html(opts)
          active = opts[:active] == true ? " active" : ""
          classes = opts.dig(:html, :class) ? "#{active} #{opts[:html][:class]}" : "#{active}"
          opts[:html] ||= {}
          opts[:html][:class] = classes
          opts[:html]
        end
      end
    end
  end
end

::Middleman::Extensions.register(:tabs_component, Components::Tabs::TabsComponent)
