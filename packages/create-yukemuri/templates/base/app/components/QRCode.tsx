import { h } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { Yukemuri } from '../lib/yukemuri'

interface QRCodeComponentProps {
  value: string
  size?: number
  className?: string
}

const yu = new Yukemuri()

export default function QRCodeComponent({ value, size = 200, className = '' }: QRCodeComponentProps) {
  const [qrDataURL, setQrDataURL] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const generateQR = async () => {
      if (!value) return
      
      setIsLoading(true)
      setError('')
      
      try {
        console.log('♨️ Generating QR code with Yukemuri API:', value)
        
        const dataURL = await yu.qr.generate(value, {
          size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          errorCorrectionLevel: 'M'
        })
        
        setQrDataURL(dataURL)
        console.log('✅ QR code generated successfully')
      } catch (err) {
        setError('Failed to generate QR code')
        console.error('❌ QR code generation error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    generateQR()
  }, [value, size])

  const handleDownload = () => {
    if (qrDataURL) {
      console.log('♨️ Downloading QR code with Yukemuri API')
      yu.qr.download(qrDataURL, `qr-${Date.now()}.png`)
    }
  }

  if (error) {
    return (
      <div className={`text-center text-red-500 ${className}`}>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 text-sm text-blue-500 hover:text-blue-700"
        >
          Retry
        </button>
      </div>
    )
  }

  if (isLoading || !qrDataURL) {
    return (
      <div className={`text-center ${className}`}>
        <div className="animate-pulse bg-gray-200 rounded flex items-center justify-center" style={{ width: `${size}px`, height: `${size}px`, margin: '0 auto' }}>
          <span className="text-gray-500 text-sm">Loading QR...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`text-center ${className}`}>
      <div className="inline-block">
        <img 
          src={qrDataURL} 
          alt={`QR Code for ${value}`}
          className="mx-auto rounded shadow-sm"
          style={{ width: `${size}px`, height: `${size}px` }}
        />
        <div className="mt-2">
          <button
            onClick={handleDownload}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs transition-colors"
            title="Download QR Code"
          >
            📥 ダウンロード
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-600 mt-2 break-all">{value}</p>
    </div>
  )
}