module Components
  module Tooltip
    class TooltipComponent < Middleman::Extension
      helpers do
        def tooltip(opts, &block)
          content_tag(:div, nil, build_tooltip_html(opts), &block)
        end

        private

        def build_tooltip_html(opts)
          opts[:html] ||= {}
          opts[:html][:class] = "terminal-tooltip"
          opts[:html]
        end
      end
    end
  end
end

::Middleman::Extensions.register(:tooltip_component, Components::Tooltip::TooltipComponent)
