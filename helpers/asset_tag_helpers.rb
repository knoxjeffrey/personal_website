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
end
