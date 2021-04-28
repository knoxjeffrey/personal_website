module Components
  module Table
    class TableComponent < Middleman::Extension
      helpers do
        def table(opts, &block)
          concat(
            content_tag(:table, class: "terminal-table") do
              content_tag(:caption, opts[:caption]) +
              capture_html(&block)
            end
          )
        end
      
        def table_head(&block)
          content_tag(:thead, &block)
        end
      
        def table_foot(opts)
          content_tag(:tfoot) do
            content_tag(:tr) do
              content_tag(:th, opts[:text], colspan: opts[:colspan])
            end
          end
        end
      
        def table_body(&block)
          content_tag(:tbody, &block)
        end
      end
    end
  end
end

::Middleman::Extensions.register(:table_component, Components::Table::TableComponent)
