import { h } from 'preact'
import { useState } from 'preact/hooks'

export default function App() {
  return (
    <div>
      <h1>Welcome to Yukemari! 🚀</h1>
      <p>This is a Hono + Preact powered PWA framework.</p>
      
      <Counter />
      
      <div>
        <h2>Features</h2>
        <ul>
          <li>⚡ Edge-first with Cloudflare Workers</li>
          <li>🔒 Type-safe with TypeScript</li>
          <li>🚀 Fast development with Hono</li>
          <li>⚛️ Interactive UI with Preact</li>
          <li>📦 Plugin system for extensibility</li>
        </ul>
      </div>
      <div>
        <h2>API Examples</h2>
        <p>
          <a href="/api/users">GET /api/users</a> - Get users list
        </p>
        <p>
          <a href="/api/health">GET /api/health</a> - Health check
        </p>
      </div>
    </div>
  )
}

function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div className="counter">
      <h3>Interactive Counter</h3>
      <p>Current count: <strong>{count}</strong></p>
      <button 
        className="increment"
        onClick={() => setCount(count + 1)}
      >
        Increment
      </button>
      <button 
        className="decrement"
        onClick={() => setCount(count - 1)}
      >
        Decrement
      </button>
      <button 
        className="reset"
        onClick={() => setCount(0)}
      >
        Reset
      </button>
    </div>
  )
}