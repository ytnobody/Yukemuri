import { h } from "preact"
import { useState, useEffect } from "preact/hooks"
import { Yukemuri } from "../lib/yukemuri"

const yu = new Yukemuri()

export default function CurrentURLQRCode() {
  const [qrDataURL, setQrDataURL] = useState<string>("")
  const [currentURL, setCurrentURL] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const generateCurrentURLQR = async () => {
      if (typeof window === "undefined") return

      setIsLoading(true)
      setError("")

      try {
        const url = window.location.href
        setCurrentURL(url)

        console.log("♨️ Generating current URL QR with Yukemuri API")

        // Using the new yu.qr.getCurrentURL() API
        const dataURL = await yu.qr.getCurrentURL({
          size: 200,
          margin: 2,
          errorCorrectionLevel: "M",
        })

        setQrDataURL(dataURL)
        console.log("✅ Current URL QR code generated successfully")
      } catch (err) {
        setError("Failed to generate QR code for current URL")
        console.error("❌ Current URL QR generation error:", err)
      } finally {
        setIsLoading(false)
      }
    }

    generateCurrentURLQR()

    // Listen for URL changes
    const handleLocationChange = () => {
      setTimeout(generateCurrentURLQR, 100) // Small delay to ensure URL is updated
    }

    window.addEventListener("popstate", handleLocationChange)

    // Custom navigation event from router
    window.addEventListener("yukemuri:navigate", handleLocationChange)

    return () => {
      window.removeEventListener("popstate", handleLocationChange)
      window.removeEventListener("yukemuri:navigate", handleLocationChange)
    }
  }, [])

  const handleDownload = () => {
    if (qrDataURL) {
      console.log("♨️ Downloading current URL QR code with Yukemuri API")
      yu.qr.download(qrDataURL, `current-url-qr-${Date.now()}.png`)
    }
  }

  const handleShare = async () => {
    if (currentURL) {
      try {
        if (navigator.share) {
          await navigator.share({
            title: "Current Page",
            text: "Check out this page",
            url: currentURL,
          })
          console.log("✅ URL shared successfully")
        } else {
          // Fallback: copy to clipboard
          await navigator.clipboard.writeText(currentURL)
          console.log("✅ URL copied to clipboard")
          // You could show a toast notification here
        }
      } catch (err) {
        console.error("❌ Share failed:", err)
      }
    }
  }

  if (error) {
    return (
      <div className="mb-8 text-center">
        <div className="text-red-500">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-blue-500 hover:text-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (isLoading || !qrDataURL) {
    return (
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          Current Page QR Code
        </h3>
        <div className="text-center">
          <div
            className="animate-pulse bg-gray-200 rounded flex items-center justify-center"
            style={{ width: "200px", height: "200px", margin: "0 auto" }}
          >
            <span className="text-gray-500">Loading QR...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Current Page QR Code</h3>
      <div className="text-center">
        <div className="inline-block mb-4">
          <img
            src={qrDataURL}
            alt={`QR Code for ${currentURL}`}
            className="mx-auto rounded shadow-sm"
            style={{ width: "200px", height: "200px" }}
          />
          <div className="mt-2 flex justify-center space-x-2">
            <button
              onClick={handleDownload}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs transition-colors"
              title="Download QR Code"
            >
              📥 Download
            </button>
            <button
              onClick={handleShare}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs transition-colors"
              title="Share URL"
            >
              🔗 Share
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500 break-all px-4">{currentURL}</p>
      </div>
    </div>
  )
}
