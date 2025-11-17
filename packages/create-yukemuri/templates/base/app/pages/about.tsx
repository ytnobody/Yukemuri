import { h } from "preact"

export default function About() {
  return (
    <div className="container">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About Yukemuri</h1>
        <p className="text-xl text-gray-600">Learn more about this PWA framework</p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">♨️ What is Yukemuri?</h2>
          <p className="text-gray-700 mb-4">
            Yukemuri (湯けむり) means "steam from hot springs" in Japanese. Just like the gentle,
            warming steam from natural hot springs, this framework provides a comfortable and
            soothing development experience.
          </p>
          <p className="text-gray-700">
            Built on modern web standards with Hono, Preact, and TypeScript, Yukemuri enables rapid
            development of progressive web applications that work seamlessly across all devices.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">🚀 Performance</h3>
            <ul className="text-gray-700 space-y-2">
              <li>• Edge-first architecture</li>
              <li>• Minimal bundle size</li>
              <li>• Server-side rendering</li>
              <li>• Efficient caching</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">🛠️ Developer Experience</h3>
            <ul className="text-gray-700 space-y-2">
              <li>• File-based routing</li>
              <li>• TypeScript support</li>
              <li>• Hot module reloading</li>
              <li>• Built-in PWA features</li>
            </ul>
          </div>
        </div>

        <div className="text-center">
          <a
            href="/"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}
