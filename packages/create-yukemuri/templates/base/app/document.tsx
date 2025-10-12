import { h } from 'preact'
import { render } from 'preact-render-to-string'
import App from './routes/index'
import 'virtual:uno.css'

interface DocumentProps {
  children?: any
  title?: string
  description?: string
}

function Document({ children, title = "Yukemuri App ♨️", description = "A PWA built with Yukemuri framework" }: DocumentProps) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        
        {/* PWA Meta Tags */}
        <meta name="description" content={description} />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Yukemuri" />
        
        {/* Web App Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Icons */}
        <link rel="icon" type="image/png" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body class="bg-gray-50 min-h-screen">
        <div id="app">{children}</div>
        {process.env.NODE_ENV !== 'production' && (
          <script type="module" src="/@vite/client"></script>
        )}
        <script type="module" src="/app/client.ts"></script>
      </body>
    </html>
  )
}

export function renderPage(component?: any) {
  const app = component ? render(component) : render(<App />)
  const html = render(
    <Document>
      <div dangerouslySetInnerHTML={{ __html: app }} />
    </Document>
  )
  return `<!DOCTYPE html>${html}`
}

export default Document