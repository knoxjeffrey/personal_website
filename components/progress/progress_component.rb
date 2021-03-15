module Components
  module Progress
    class ProgressComponent < Middleman::Extension
      def initialize(app, options_hash={}, &block)
        super
      end

      helpers do
        def progress_arrow(opts)
          content_tag(:div, class: "progress-bar") do
            content_tag(:div, nil, class: "progress-bar-filled", style: "width: #{opts[:filled]}%")
          end
        end
      
        def progress_percent(opts)
          content_tag(:div, class: "progress-bar progress-bar-show-percent") do
            content_tag(:div, nil, class: "progress-bar-filled", style: "width: #{opts[:filled]}%", "data-filled": "#{opts[:text]}")
          end
        end
      
        def progress_no_arrow(opts)
          content_tag(:div, class: "progress-bar progress-bar-no-arrow") do
            content_tag(:div, nil, class: "progress-bar-filled", style: "width: #{opts[:filled]}%")
          end
        end
      end
    end
  end
end

::Middleman::Extensions.register(:progress_component, Components::Progress::ProgressComponent)
