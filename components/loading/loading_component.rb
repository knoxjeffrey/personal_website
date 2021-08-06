module Components
  module Loading
    class LoadingComponent < Middleman::Extension
      helpers do
        def loading(opts={})
          tag(:span, class: "terminal-loading#{loading_additional_classes(opts)}")
        end

        private

        def loading_additional_classes(opts)
          contained = opts[:contained] ? " terminal-loading--contained" : ""
          opts[:class] ? " #{opts[:class]}#{contained}" : "#{contained}"
        end
      end
    end
  end
end

::Middleman::Extensions.register(:loading_component, Components::Loading::LoadingComponent)
