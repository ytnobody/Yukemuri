import { h } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import QRCode from 'qrcode'

interface QRCodeComponentProps {
  value: string
  size?: number
  className?: string
}

export default function QRCodeComponent({ value, size = 200, className = '' }: QRCodeComponentProps) {
  const [qrDataURL, setQrDataURL] = useState<string>('')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const generateQR = async () => {
      try {
        const dataURL = await QRCode.toDataURL(value, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })
        setQrDataURL(dataURL)
        setError('')
      } catch (err) {
        setError('Failed to generate QR code')
        console.error('QR code generation error:', err)
      }
    }

    if (value) {
      generateQR()
    }
  }, [value, size])

  if (error) {
    return (
      <div className={`text-center text-red-500 ${className}`}>
        <p>{error}</p>
      </div>
    )
  }

  if (!qrDataURL) {
    return (
      <div className={`text-center ${className}`}>
        <div className="animate-pulse bg-gray-200 rounded" style={{ width: `${size}px`, height: `${size}px` }}>
          <span className="text-gray-500">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`text-center ${className}`}>
      <img 
        src={qrDataURL} 
        alt={`QR Code for ${value}`}
        className="mx-auto rounded shadow-sm"
        style={{ width: `${size}px`, height: `${size}px` }}
      />
      <p className="text-sm text-gray-600 mt-2 break-all">{value}</p>
    </div>
  )
}