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
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Yukemari App</title>
      <style>
        body {
          font-family: system-ui, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          line-height: 1.6;
        }
        .counter {
          padding: 20px;
          border: 1px solid #ccc;
          border-radius: 8px;
          margin: 10px 0;
        }
        button {
          padding: 8px 16px;
          margin-right: 8px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .increment { background-color: #007acc; color: white; }
        .decrement { background-color: #cc0700; color: white; }
        .reset { background-color: #666; color: white; margin-left: 8px; }
      </style>
    </head>
    <body>
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