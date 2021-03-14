module Components
  module Figure
    class FigureComponent < Middleman::Extension
      def initialize(app, options_hash={}, &block)
        super
      end

      helpers do
        def figure(opts)
          content_tag(:figure) do
            opts[:media] +
            content_tag(:figcaption, opts[:caption])
          end
        end
      end
    end
  end
end

::Middleman::Extensions.register(:figure_component, Components::Figure::FigureComponent)

