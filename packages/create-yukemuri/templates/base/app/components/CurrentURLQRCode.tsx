import { h } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import QRCodeComponent from './QRCode'

export default function CurrentURLQRCode() {
  const [currentURL, setCurrentURL] = useState<string>('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentURL(window.location.href)
    }
  }, [])

  if (!currentURL) {
    return (
      <div className="text-center">
        <div className="animate-pulse bg-gray-200 rounded" style={{ width: '200px', height: '200px', margin: '0 auto' }}>
          <span className="text-gray-500">Loading URL...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Current Page QR Code</h3>
      <QRCodeComponent 
        value={currentURL} 
        size={200}
        className="mb-4"
      />
    </div>
  )
}