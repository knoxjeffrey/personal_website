# Helpers used to extend exiting methods and add new methods for site wide assets
module AssetTagHelpers
  def image_tag(url, options={})
    options.symbolize_keys!

    # adds an alt tag with empty string if none is given as this is better for accessibility/SEO
    options[:alt] ||= ""
    # lazy load all images by default
    options[:loading] ||= "lazy"

    super(url, options)
  end

  def link_to(*args, &block)
    url_arg_index = block_given? ? 0 : 1
    options_index = block_given? ? 1 : 2

    # external links to open in new tab and add noopener for security
    unless args[url_arg_index].start_with?("/", "#")
      args[options_index] ||= {}
      args[options_index][:target] ||= "_blank"
      args[options_index][:rel] ||= "noopener"
    end
    super(*args, &block)
  end

  def vite_asset_path(name, **options)
    asset_path :css, vite_manifest.path_for(name, **options)
  end

  def vite_preload_tag(*sources, crossorigin:)
    sources.map { |source|
      href = asset_path(:js, source)
      try(:request).try(:send_early_hints, 'Link' => %(<#{ href }>; rel=modulepreload; as=script; crossorigin=#{ crossorigin }))
      tag(:link, rel: 'modulepreload', href: href, as: 'script', crossorigin: crossorigin)
    }.join("\n").html_safe
  end
end
