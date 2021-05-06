require "./lib/netlify/netlify_headers.rb"

module Netlify
  # NetlifyHeadersBuilder joins all of the headers in NetlifyHeaders into a format for Netlify and copies
  # the content into a _headers file
  module NetlifyHeadersBuilder
    extend self
    include Netlify::NetlifyHeaders

    PRODUCTION_BUILD_CONTEXT = "production".freeze

    # Final output will look similar to the following
    # /*
    #   X-Frame-Options: DENY
    #   X-XSS-Protection: 1; mode=block
    def build(build_context)
      rules = header_rules(build_context).join("\n")
      File.write("source/netlify-headers", rules)
    end

    private

    def header_rules(build_context)
      path_headers.map do |path_header|
        content = [path_header[:path]] + mapped_headers(path_header, build_context)
        content.join("\n")
      end
    end

    # Header rules per path
    def path_headers
      [
        { path: "/*", headers: ALL_PAGES_HEADERS },
        { path: "/assets/*", headers: ALL_PAGES_HEADERS + HASHED_ASSETS_HEADERS },
        { path: "/game/response-headers/", headers: ALL_PAGES_HEADERS + GAME_RESPONSE_HEADERS + BASIC_AUTH_HEADERS }
      ]
    end

    def mapped_headers(path_header, build_context)
      headers = path_header[:headers] + non_production_headers(build_context)
      headers.map { |header| "  #{header}" }
    end

    # We want basic auth on all builds except for production
    def non_production_headers(build_context)
      return [] if build_context == PRODUCTION_BUILD_CONTEXT
      BASIC_AUTH_HEADERS
    end
  end
end
