module Components
  module Button
    class ButtonComponent < Middleman::Extension
      def initialize(app, options_hash={}, &block)
        super
      end

      helpers do
        def button
          content_tag(:button, "hi")
        end
      end
    end
  end
end

::Middleman::Extensions.register(:button_component, Components::Button::ButtonComponent)
