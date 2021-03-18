module Components
  module Figure
    class FigureComponent < Middleman::Extension
      def initialize(app, options_hash={}, &block)
        super
      end

      helpers do
        def figure(opts)
          content_tag(:figure, class: additional_classes(opts)) do
            opts[:media]
          end
        end

        def figure_with_caption(opts)
          content_tag(:figure, class: additional_classes(opts)) do
            opts[:media] +
            content_tag(:figcaption, opts[:caption])
          end
        end

        private

        def additional_classes(opts)
          opts.dig(:html, :class) ? " #{opts[:html][:class]}" : ""
        end
      end
    end
  end
end

::Middleman::Extensions.register(:figure_component, Components::Figure::FigureComponent)

