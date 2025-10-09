import { h } from 'preact'
import { useState } from 'preact/hooks'

export default function App() {
  return (
    <div className="container">
      <div className="text-center mb-8">
        <div className="mb-6">
          <div className="text-8xl mb-4">♨️</div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Yukemari!
        </h1>
        <p className="text-xl text-gray-600">
          This is a Hono + Preact powered PWA framework.
        </p>
      </div>
      
      <Counter />
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Features</h2>
        <ul className="space-y-2">
          <li className="flex items-center">
            <span className="mr-3">⚡</span>
            <span>Edge-first with Cloudflare Workers</span>
          </li>
          <li className="flex items-center">
            <span className="mr-3">🔒</span>
            <span>Type-safe with TypeScript</span>
          </li>
          <li className="flex items-center">
            <span className="mr-3">🚀</span>
            <span>Fast development with Hono</span>
          </li>
          <li className="flex items-center">
            <span className="mr-3">⚛️</span>
            <span>Interactive UI with Preact</span>
          </li>
          <li className="flex items-center">
            <span className="mr-3">📦</span>
            <span>Plugin system for extensibility</span>
          </li>
        </ul>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">API Examples</h2>
        <div className="space-y-2">
          <p>
            <a 
              href="/api/users" 
              className="text-primary-600 hover:text-primary-800 underline"
            >
              GET /api/users
            </a>
            <span className="text-gray-600 ml-2">- Get users list</span>
          </p>
          <p>
            <a 
              href="/api/health" 
              className="text-primary-600 hover:text-primary-800 underline"
            >
              GET /api/health
            </a>
            <span className="text-gray-600 ml-2">- Health check</span>
          </p>
        </div>
      </div>
    </div>
  )
}

function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div className="card mb-8">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Interactive Counter</h3>
      <p className="text-lg mb-6">
        Current count: <strong className="text-primary-600">{count}</strong>
      </p>
      <div className="flex gap-3">
        <button 
          className="btn-primary"
          onClick={() => setCount(count + 1)}
        >
          Increment
        </button>
        <button 
          className="btn-danger"
          onClick={() => setCount(count - 1)}
        >
          Decrement
        </button>
        <button 
          className="btn-secondary"
          onClick={() => setCount(0)}
        >
          Reset
        </button>
      </div>
    </div>
  )
}