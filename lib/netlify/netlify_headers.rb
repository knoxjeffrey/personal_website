module Netlify
  # NetlifyHeaders contains all of the headers required for the Netlify build
  module NetlifyHeaders
    extend self

    CSP = [
      "default-src 'self';",
      "img-src data: blob: *;",
      "font-src 'self' data: cdn.commento.io;",
      "media-src 'self';",
      "style-src 'self' 'unsafe-inline' data: blob: *.commento.io;",
      "frame-src 'self' app.netlify.com;",
      "object-src 'self';",
      "connect-src 'self' data: wss: *.jeffreyknox.dev commento.io library.illuminatr.io;",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: *.jeffreyknox.dev *.commento.io netlify-cdp-loader.netlify.app library.illuminatr.io;"
    ]

    ALL_PAGES_HEADERS = [
      "Content-Security-Policy: #{CSP.join(" ")}",
      "X-Frame-Options: DENY",
      "X-Content-Type-Options: nosniff",
      "Permissions-Policy: accelerometer=(), camera=(),  encrypted-media=(),  geolocation=(),  gyroscope=(),  magnetometer=(),  microphone=(),  midi=(),  payment=(),  usb=()",
      "Referrer-Policy: no-referrer-when-downgrade",
      "X-XSS-Protection: 1; mode=block",
      "Link: <https://www.jeffreyknox.dev/vite/assets/main_css.css.50576505.css>; rel='preconnect'"
    ]

    BASIC_AUTH_HEADERS = [
      "Basic-Auth: preview:PreviewThis!"
    ]

    HASHED_ASSETS_HEADERS = [
      "Cache-Control: max-age=315360000, immutable"
    ]
  end
end
