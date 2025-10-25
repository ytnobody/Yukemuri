import type { QRCodeManager, QRCodeOptions } from '../types.js'

export class QRCodeManagerImpl implements QRCodeManager {
  
  async generate(value: string, options?: QRCodeOptions): Promise<string> {
    if (typeof window === 'undefined') return ''

    // Dynamically import QR code generation library
    try {
      // Try external qrcode library first
      const QRCode = await this.loadQRCodeLibrary()
      
      const dataURL = await QRCode.toDataURL(value, {
        width: options?.size || 200,
        margin: options?.margin || 2,
        color: {
          dark: options?.color?.dark || '#000000',
          light: options?.color?.light || '#FFFFFF'
        },
        errorCorrectionLevel: options?.errorCorrectionLevel || 'M',
        type: options?.type || 'image/png',
        quality: options?.quality || 0.92
      })
      
      return dataURL
    } catch (error) {
      console.error('❌ QR code generation failed:', error)
      
      // Fallback: Generate a simple QR code-like placeholder
      return this.generateFallbackQR(value, options)
    }
  }

  async getCurrentURL(options?: QRCodeOptions): Promise<string> {
    if (typeof window === 'undefined') return ''
    
    return this.generate(window.location.href, options)
  }

  download(qrDataURL: string, filename: string = 'qrcode.png'): void {
    if (typeof window === 'undefined' || !qrDataURL) return

    try {
      // Create download link
      const link = document.createElement('a')
      link.download = filename
      link.href = qrDataURL
      
      // Trigger download
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      console.log('📥 QR code downloaded:', filename)
    } catch (error) {
      console.error('❌ QR code download failed:', error)
    }
  }

  async generateSVG(value: string, options?: QRCodeOptions): Promise<string> {
    if (typeof window === 'undefined') return ''

    try {
      const QRCode = await this.loadQRCodeLibrary()
      
      const svgString = await QRCode.toString(value, {
        type: 'svg',
        width: options?.size || 200,
        margin: options?.margin || 2,
        color: {
          dark: options?.color?.dark || '#000000',
          light: options?.color?.light || '#FFFFFF'
        },
        errorCorrectionLevel: options?.errorCorrectionLevel || 'M'
      })
      
      return svgString
    } catch (error) {
      console.error('❌ QR code SVG generation failed:', error)
      return this.generateFallbackSVG(value, options)
    }
  }

  private async loadQRCodeLibrary(): Promise<any> {
    try {
      // Load qrcode library via dynamic import
      return await import('qrcode' as any)
    } catch (error) {
      // Throw error if qrcode library is not available
      throw new Error('QRCode library not available. Please install: npm install qrcode @types/qrcode')
    }
  }

  private generateFallbackQR(value: string, options?: QRCodeOptions): string {
    // Simple QR code-like placeholder using Canvas
    const canvas = document.createElement('canvas')
    const size = options?.size || 200
    canvas.width = size
    canvas.height = size
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''

    // Background color
    ctx.fillStyle = options?.color?.light || '#FFFFFF'
    ctx.fillRect(0, 0, size, size)

    // Border
    ctx.strokeStyle = options?.color?.dark || '#000000'
    ctx.lineWidth = 2
    ctx.strokeRect(1, 1, size - 2, size - 2)

    // Display text in center
    ctx.fillStyle = options?.color?.dark || '#000000'
    ctx.font = '12px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    // Split text into multiple lines
    const words = value.split(/[\s\/\?&=]/)
    const lines = []
    let currentLine = ''
    
    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word
      if (testLine.length > 20) {
        if (currentLine) lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    }
    if (currentLine) lines.push(currentLine)

    const lineHeight = 16
    const startY = size / 2 - (lines.length - 1) * lineHeight / 2

    lines.slice(0, 8).forEach((line, index) => {
      ctx.fillText(line, size / 2, startY + index * lineHeight)
    })

    return canvas.toDataURL('image/png')
  }

  private generateFallbackSVG(value: string, options?: QRCodeOptions): string {
    const size = options?.size || 200
    const dark = options?.color?.dark || '#000000'
    const light = options?.color?.light || '#FFFFFF'
    
    return `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="${light}" stroke="${dark}" stroke-width="2"/>
        <text x="${size/2}" y="${size/2}" font-family="monospace" font-size="12" 
              text-anchor="middle" dominant-baseline="central" fill="${dark}">
          QR: ${value.substring(0, 20)}${value.length > 20 ? '...' : ''}
        </text>
      </svg>
    `.trim()
  }
}