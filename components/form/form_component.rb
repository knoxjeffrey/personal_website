module Components
  module Form
    class FormComponent < Middleman::Extension
      def initialize(app, options_hash={}, &block)
        super
      end

      helpers do
        def form_fieldset(opts, &block)
          concat(
            content_tag(:fieldset) do
              content_tag(:legend, opts[:legend]) +
              capture_html(&block)
            end
          )
        end

        def form_group(&block)
          content_tag(:div, class: "form-group", &block)
        end
      end
    end
  end
end

::Middleman::Extensions.register(:form_component, Components::Form::FormComponent)

