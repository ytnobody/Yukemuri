import { h } from 'preact'
import Router, { Route } from 'preact-router'

// Import page components
import Home from '../pages/home'
import About from '../pages/about'
import Users from '../pages/users'
import UserDetail from '../pages/user'
import Storage from '../pages/storage'

// Navigation component
function Navigation() {
  return (
    <nav className="bg-white shadow-sm border-b mb-8">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <a href="/" className="text-xl font-bold text-gray-900">
              ♨️ Yukemuri
            </a>
            <div className="flex space-x-4">
              <a href="/" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded">
                Home
              </a>
              <a href="/about" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded">
                About
              </a>
              <a href="/users" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded">
                Users
              </a>
              <a href="/storage" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded">
                Storage
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

// Layout wrapper
function Layout({ children }: { children: any }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main>
        {children}
      </main>
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="container text-center">
          <p>Built with Yukemuri ♨️ - A Hono + Preact PWA Framework</p>
        </div>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <Layout>
      <Router>
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/users" component={Users} />
        <Route path="/users/:id" component={UserDetail} />
        <Route path="/storage" component={Storage} />
      </Router>
    </Layout>
  )
}