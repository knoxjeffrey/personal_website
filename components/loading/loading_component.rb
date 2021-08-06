module Components
  module Loading
    class LoadingComponent < Middleman::Extension
      helpers do
        def loading(opts={})
          tag(:span, build_loading_html(opts))
        end

        private

        def build_loading_html(opts)
          klass = opts[:contained] ? "terminal-loading terminal-loading--contained" : "terminal-loading"
          klass = opts.dig(:html, :class) ? "#{klass} #{opts[:html][:class]}" : "#{klass}"
          opts[:html] ||= {}
          opts[:html][:class] = klass
          opts[:html]
        end
      end
    end
  end
end

::Middleman::Extensions.register(:loading_component, Components::Loading::LoadingComponent)
