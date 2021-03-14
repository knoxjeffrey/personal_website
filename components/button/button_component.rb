module Components
  module Button
    class ButtonComponent < Middleman::Extension
      def initialize(app, options_hash={}, &block)
        super
      end

      helpers do
        def button(opts)
          content_tag(:button, opts[:text], class: build_button_class(opts))
        end
      
        def button_group(&block)
          content_tag(:div, class: "btn-group", &block)
        end
      
        private
      
        def build_button_class(opts)
          additional_classes = opts.has_key?(:class) ? " #{opts[:class]}" : ""
          "#{button_type(opts[:type])}#{ghost?(opts[:ghost])}#{block?(opts[:block])}#{additional_classes}"
        end
      
        def button_type(type)
          case type
          when :default
            "btn btn-default"
          when :primary
            "btn btn-primary"
          when :error
            "btn btn-error"
          end
        end
      
        def ghost?(btn_ghost)
          btn_ghost == true ? " btn-ghost" : ""
        end
      
        def block?(btn_block)
          btn_block == true ? " btn-block" : ""
        end
      end
    end
  end
end

::Middleman::Extensions.register(:button_component, Components::Button::ButtonComponent)
