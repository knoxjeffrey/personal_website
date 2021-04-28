module Components
  module Grid
    class GridComponent < Middleman::Extension
      helpers do
        def grid(&block)
          content_tag(:div, class: "image-grid", &block)
        end
      end
    end
  end
end

::Middleman::Extensions.register(:grid_component, Components::Grid::GridComponent)
