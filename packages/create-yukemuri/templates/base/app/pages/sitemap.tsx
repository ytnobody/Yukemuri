import { h } from "preact"

export default function Sitemap() {
  const pages = [
    {
      path: "/",
      title: "Home",
      description: "Welcome to Yukemuri PWA framework with interactive demos",
    },
    {
      path: "/about",
      title: "About",
      description: "Learn about Yukemuri framework features and capabilities",
    },
    {
      path: "/docs",
      title: "API Documentation",
      description: "Complete API reference for all Yukemuri framework features",
    },
    {
      path: "/examples",
      title: "Code Examples",
      description: "Real-world component examples and implementation patterns",
    },
    {
      path: "/users",
      title: "Users Demo",
      description: "User management demo with API integration",
    },
    {
      path: "/storage",
      title: "Storage Demo",
      description: "Interactive storage management with local and persistent storage",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">♨️ Sitemap</h1>
        <p className="text-xl text-gray-600">
          All pages and resources available in this Yukemuri application
        </p>
      </div>

      <div className="space-y-4">
        {pages.map(page => (
          <a
            key={page.path}
            href={page.path}
            className="block bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-600 mb-2">{page.title}</h3>
                <p className="text-gray-600 text-sm mb-2">{page.description}</p>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                  {page.path}
                </code>
              </div>
              <div className="text-blue-500">→</div>
            </div>
          </a>
        ))}
      </div>

      <div className="mt-12 pt-8 border-t">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Resources</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Static Files</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>
                <code>/manifest.json</code> - PWA Web App Manifest
              </li>
              <li>
                <code>/sw.js</code> - Service Worker
              </li>
              <li>
                <code>/icons/*</code> - App Icons
              </li>
            </ul>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">API Endpoints</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>
                <code>/api/health</code> - Health check
              </li>
              <li>
                <code>/api/users</code> - Users CRUD operations
              </li>
              <li>
                <code>/api/index</code> - API documentation
              </li>
            </ul>
          </div>
        </div>
      </div>

      <footer className="mt-8 text-center text-gray-500">
        <a href="/" className="text-blue-600 hover:underline">
          ← Back to Home
        </a>
      </footer>
    </div>
  )
}
