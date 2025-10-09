import { Hono } from 'hono'
import { render } from 'preact-render-to-string'
import App from './routes/index'
import type { Context } from 'hono'

const app = new Hono()

// Main page with SSR
app.get('/', (c: Context) => {
  const html = render(App())
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Yukemari App ♨️</title>
    </head>
    <body class="bg-gray-50 min-h-screen">
      <div id="app">${html}</div>
      <script type="module" src="/app/client.ts"></script>
    </body>
    </html>
  `)
})

// API route
app.get('/api/users', (c: Context) => {
  return c.json({
    users: [
      { id: 1, name: 'Alice', email: 'alice@example.com' },
      { id: 2, name: 'Bob', email: 'bob@example.com' }
    ]
  })
})

app.get('/api/health', (c: Context) => {
  return c.json({ status: 'OK', timestamp: new Date().toISOString() })
})

console.log('Yukemari app initialized')

export default app