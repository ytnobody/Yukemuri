# Static Files Directory

This directory contains static assets that are served directly by the Hono server.

## Directory Structure

```
app/static/
├── icons/                 # PWA and application icons
│   ├── icon.svg          # Main application icon
│   ├── icon-72x72.svg    # Various sizes for PWA manifest
│   ├── icon-96x96.svg
│   ├── icon-128x128.svg
│   ├── icon-144x144.svg
│   ├── icon-152x152.svg
│   ├── icon-192x192.svg
│   ├── icon-384x384.svg
│   └── icon-512x512.svg
└── [other static assets]  # CSS, JS, images, etc.
```

## URL Mapping

All files in this directory are accessible via `/static/*` URLs:

- `app/static/icons/icon.svg` → `http://example.com/static/icons/icon.svg`
- `app/static/css/style.css` → `http://example.com/static/css/style.css`
- etc.

## Legacy Support

For backward compatibility, `/icons/*` requests are automatically redirected to `/static/icons/*`.

## Content Types

The server automatically sets appropriate Content-Type headers based on file extensions:

- `.svg` → `image/svg+xml; charset=utf-8`
- `.png` → `image/png`
- `.jpg/.jpeg` → `image/jpeg`
- `.css` → `text/css; charset=utf-8`
- `.js` → `application/javascript; charset=utf-8`

## Caching

Static files are served with a long cache duration (`max-age=31536000`) for optimal performance.