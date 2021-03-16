module Components
  module Timeline
    class TimelineComponent < Middleman::Extension
      def initialize(app, options_hash={}, &block)
        super
      end

      helpers do
        def timeline(&block)
          content_tag(:div, nil, class: "terminal-timeline", &block)
        end
      end
    end
  end
end

::Middleman::Extensions.register(:timeline_component, Components::Timeline::TimelineComponent)
