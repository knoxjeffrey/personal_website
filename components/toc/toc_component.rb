module Components
  module Toc
    class TocComponent < Middleman::Extension
      def initialize(app, options_hash={}, &block)
        super
      end

      helpers do
        def toc(&block)
          content_tag(:ol, class: "terminal-toc", &block)
        end
      end
    end
  end
end

::Middleman::Extensions.register(:toc_component, Components::Toc::TocComponent)
