source 'https://rubygems.org'

gem "builder"
gem "middleman", "~> 4.4"
gem "middleman-autoprefixer", "~> 2.7"
gem "middleman-blog"
gem "middleman-minify-html"
# Required for blog summaries
gem "nokogiri"
gem "rake"
# Locked to v2.1.0 because of long install times for this gem with later versions
# Thread here - https://github.com/sass/sassc-ruby/issues/189
# This gem is a requirement of Middleman but the lock can be removed when this issue is resolved.
gem "sassc", "2.1.0"
gem "tzinfo-data", platforms: [:mswin, :mingw, :jruby, :x64_mingw]
gem "vite_padrino"
gem "vite_ruby"
gem "wdm", "~> 0.1", platforms: [:mswin, :mingw, :x64_mingw]

group :development do
  gem "dotenv"
  gem "pry-byebug"
  gem "rubocop", "~> 0.92.0", require: false
  gem "rubocop-performance", require: false
  gem "rubocop-rspec", require: false
end
