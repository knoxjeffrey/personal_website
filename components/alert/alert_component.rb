module Components
  module Alert
    class AlertComponent < Middleman::Extension
      def initialize(app, options_hash={}, &block)
        super
      end

      helpers do
        def alert(opts)
          content_tag(:div, opts[:text], build_alert_html(opts))
        end
        
        private
        
        def build_alert_html(opts)
          additional_classes = opts.dig(:html, :class) ? " #{opts[:html][:class]}" : ""
          combined_classes = "#{alert_type(opts[:type])}#{additional_classes}"
          opts[:html] ||= {}
          opts[:html][:class] = combined_classes
          opts[:html]
        end
        
        def alert_type(type)
          case type
          when :default
            "terminal-alert"
          when :primary
            "terminal-alert terminal-alert-primary"
          when :error
            "terminal-alert terminal-alert-error"
          end
        end
      end
    end
  end
end

::Middleman::Extensions.register(:alert_component, Components::Alert::AlertComponent)
