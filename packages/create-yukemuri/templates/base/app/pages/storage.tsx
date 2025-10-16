import { h } from 'preact'
import { yu } from '../lib/yukemuri'
import { useState, useEffect } from 'preact/hooks'

export default function StoragePage() {
  const [localValue, setLocalValue] = useState('')
  const [sessionValue, setSessionValue] = useState('')
  const [persistentValue, setPersistentValue] = useState('')
  const [userSettings, setUserSettings] = useState({ theme: 'light', language: 'ja' })
  const [counters, setCounters] = useState({ local: 0, session: 0, persistent: 0 })
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSynced, setLastSynced] = useState<Date | null>(null)

  // Storage controllers
  const localController = yu.storage.local('demo-local', '')
  const sessionController = yu.storage.session('demo-session', '')
  const persistentController = yu.storage.persistent('demo-persistent', '')
  const settingsController = yu.storage.local('user-settings', { theme: 'light', language: 'ja' }, {
    syncAcrossTabs: true
  })
  const counterController = yu.storage.local('counters', { local: 0, session: 0, persistent: 0 })

  useEffect(() => {
    // Initialize values
    setLocalValue(localController.get())
    setSessionValue(sessionController.get())
    setPersistentValue(persistentController.get())
    setUserSettings(settingsController.get())
    setCounters(counterController.get())

    // Subscribe to changes
    const unsubscribeLocal = localController.subscribe(setLocalValue)
    const unsubscribeSession = sessionController.subscribe(setSessionValue)
    const unsubscribePersistent = persistentController.subscribe(setPersistentValue)
    const unsubscribeSettings = settingsController.subscribe(setUserSettings)
    const unsubscribeCounters = counterController.subscribe(setCounters)

    // Monitor persistent storage sync status
    const syncInterval = setInterval(() => {
      setIsSyncing(persistentController.isSyncing())
      setLastSynced(persistentController.lastSynced())
    }, 1000)

    return () => {
      unsubscribeLocal()
      unsubscribeSession()
      unsubscribePersistent()
      unsubscribeSettings()
      unsubscribeCounters()
      clearInterval(syncInterval)
    }
  }, [])

  const updateLocalValue = (value: string) => {
    localController.set(value)
    // Counter will be updated via subscription
    counterController.set(prev => ({ ...prev, local: prev.local + 1 }))
  }

  const updateSessionValue = (value: string) => {
    sessionController.set(value)
    counterController.set(prev => ({ ...prev, session: prev.session + 1 }))
  }

  const updatePersistentValue = async (value: string) => {
    persistentController.set(value)
    counterController.set(prev => ({ ...prev, persistent: prev.persistent + 1 }))
  }

  const updateTheme = (theme: string) => {
    settingsController.set(prev => ({ ...prev, theme }))
  }

  const updateLanguage = (language: string) => {
    settingsController.set(prev => ({ ...prev, language }))
  }

  const clearAllStorage = () => {
    localController.clear()
    sessionController.clear()
    persistentController.clear()
    settingsController.clear()
    counterController.clear()
  }

  const manualSync = () => {
    persistentController.sync()
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">♨️ Yukemuri Storage Demo</h1>
        <p className="text-gray-600 mb-4">
          Test local, session, and persistent storage with reactive updates
        </p>
      </div>

      {/* Local Storage */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-800 mb-3">
          📱 Local Storage (Count: {counters.local})
        </h2>
        <p className="text-blue-600 mb-3">
          Persists across browser sessions. Syncs across tabs when enabled.
        </p>
        <div className="space-y-3">
          <input
            type="text"
            value={localValue}
            onChange={(e) => updateLocalValue((e.target as HTMLInputElement).value)}
            placeholder="Enter local storage value..."
            className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="text-sm text-blue-700">
            Current value: <code className="bg-blue-100 px-2 py-1 rounded">{localValue || '(empty)'}</code>
          </div>
        </div>
      </div>

      {/* Session Storage */}
      <div className="bg-green-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-green-800 mb-3">
          🔄 Session Storage (Count: {counters.session})
        </h2>
        <p className="text-green-600 mb-3">
          Only persists during the browser session. Cleared when tab closes.
        </p>
        <div className="space-y-3">
          <input
            type="text"
            value={sessionValue}
            onChange={(e) => updateSessionValue((e.target as HTMLInputElement).value)}
            placeholder="Enter session storage value..."
            className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <div className="text-sm text-green-700">
            Current value: <code className="bg-green-100 px-2 py-1 rounded">{sessionValue || '(empty)'}</code>
          </div>
        </div>
      </div>

      {/* Persistent Storage (IndexedDB) */}
      <div className="bg-purple-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-purple-800 mb-3">
          💾 Persistent Storage (Count: {counters.persistent})
        </h2>
        <p className="text-purple-600 mb-3">
          Uses IndexedDB for reliable persistence. Supports large data and offline access.
        </p>
        <div className="space-y-3">
          <input
            type="text"
            value={persistentValue}
            onChange={(e) => updatePersistentValue((e.target as HTMLInputElement).value)}
            placeholder="Enter persistent storage value..."
            className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <div className="flex items-center justify-between">
            <div className="text-sm text-purple-700">
              Current value: <code className="bg-purple-100 px-2 py-1 rounded">{persistentValue || '(empty)'}</code>
            </div>
            <button
              onClick={manualSync}
              disabled={isSyncing}
              className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              {isSyncing ? 'Syncing...' : 'Manual Sync'}
            </button>
          </div>
          <div className="text-xs text-purple-600">
            {lastSynced ? `Last synced: ${lastSynced.toLocaleTimeString()}` : 'Not synced yet'}
          </div>
        </div>
      </div>

      {/* User Settings with Tab Sync */}
      <div className="bg-yellow-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-yellow-800 mb-3">
          ⚙️ User Settings (Cross-Tab Sync)
        </h2>
        <p className="text-yellow-600 mb-3">
          Settings that sync across browser tabs in real-time.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-yellow-700 mb-1">Theme</label>
            <select
              value={userSettings.theme}
              onChange={(e) => updateTheme((e.target as HTMLSelectElement).value)}
              className="w-full px-3 py-2 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-yellow-700 mb-1">Language</label>
            <select
              value={userSettings.language}
              onChange={(e) => updateLanguage((e.target as HTMLSelectElement).value)}
              className="w-full px-3 py-2 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="ja">日本語</option>
              <option value="en">English</option>
              <option value="ko">한국어</option>
            </select>
          </div>
        </div>
        <div className="mt-3 text-sm text-yellow-700">
          Current settings: <code className="bg-yellow-100 px-2 py-1 rounded">
            {JSON.stringify(userSettings)}
          </code>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-red-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-red-800 mb-3">🗑️ Clear Storage</h2>
        <p className="text-red-600 mb-3">
          Clear all storage data for testing purposes.
        </p>
        <button
          onClick={clearAllStorage}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Clear All Storage
        </button>
      </div>

      {/* Test Instructions */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">🧪 Test Instructions</h2>
        <ul className="space-y-2 text-gray-700">
          <li>• <strong>Local Storage:</strong> Values persist after page refresh</li>
          <li>• <strong>Session Storage:</strong> Values cleared when tab is closed</li>
          <li>• <strong>Persistent Storage:</strong> Uses IndexedDB, check DevTools → Application → IndexedDB</li>
          <li>• <strong>Cross-Tab Sync:</strong> Open this page in multiple tabs to see real-time syncing</li>
          <li>• <strong>Counters:</strong> Track how many times each storage type has been updated</li>
        </ul>
      </div>
    </div>
  )
}