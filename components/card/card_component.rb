module Components
  module Card
    class CardComponent < Middleman::Extension
      helpers do
        def card(opts, &block)
          concat(
            content_tag(:div, class: "terminal-card") do
              content_tag(:header, opts[:title]) +
              content_tag(:div) do
                capture_html(&block)
              end
            end
          )
        end
      end
    end
  end
end

::Middleman::Extensions.register(:card_component, Components::Card::CardComponent)
