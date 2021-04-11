xml.instruct!
xml.urlset 'xmlns' => "http://www.sitemaps.org/schemas/sitemap/0.9" do
  sitemap.resources.select { |page| page.destination_path =~ /\.html/ && page.data.noindex != true }.each do |page|
    xml.url do
      xml.loc URI.join("https://www.jeffreyknox.dev", page.url)
      xml.changefreq page.data.changefreq || "monthly"
      xml.priority page.data.priority || "0.7"
    end
  end
end
