module Netlify
  # NetlifyHeaders contains all of the headers required for the Netlify build
  module NetlifyHeaders
    extend self

    CSP = [
      "default-src 'self';",
      "img-src data: blob: *;",
      "font-src 'self';",
      "media-src 'self';",
      "style-src 'self' 'unsafe-inline';",
      "object-src 'self';",
      "connect-src 'self' data: wss: *.jeffreyknox.dev;",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: *.jeffreyknox.dev *.commento.io;"
    ]

    ALL_PAGES_HEADERS = [
      "Content-Security-Policy: #{CSP.join(" ")}",
      "X-Frame-Options: DENY",
      "X-Content-Type-Options: nosniff",
      "Permissions-Policy: accelerometer=(), ambient-light-sensor=(), camera=(),  encrypted-media=(),  geolocation=(),  gyroscope=(),  magnetometer=(),  microphone=(),  midi=(),  payment=(),  usb=(),  vr=()",
      "Referrer-Policy: no-referrer-when-downgrade",
      "X-XSS-Protection: 1; mode=block"
    ]

    BASIC_AUTH_HEADERS = [
      "Basic-Auth: integration:IntegrateThis!"
    ]

    HASHED_ASSETS_HEADERS = [
      "Cache-Control: max-age=315360000, immutable"
    ]
  end
end
