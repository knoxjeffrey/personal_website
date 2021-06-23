class AssetHashImportFrom < ::Middleman::Extension

  def after_build
    Pathname.new("./build/assets").children.each do |entry|
      next if entry.directory?
      next unless entry.extname == ".js"
      # load the file as a string
      javascript_content = entry.read
      # fixes the issues where the asset hash strips the "./" from the start of the file
      filtered_javascript_content = javascript_content.gsub(/from"(.+?\.js)"/) { "from'./#{$1}'" }
      # write the changes
      entry.open("w") do |f|
        f.write(filtered_javascript_content)
      end
    end
  end
end

::Middleman::Extensions.register(:asset_hash_import_from, AssetHashImportFrom)
