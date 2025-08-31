import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getLinkBySlug, trackClick } from '../utils/api'
import { QRCodeSVG } from 'qrcode.react'

export default function LandingPage() {
  const { slug } = useParams()
  const [link, setLink] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showQR, setShowQR] = useState(false)

  useEffect(() => {
    fetchLink()
  }, [slug])

  const fetchLink = async () => {
    try {
      const data = await getLinkBySlug(slug)
      if (data.error) throw new Error(data.error)
      setLink(data)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePlatformClick = async (platform) => {
    try {
      await trackClick(link.id, platform, document.referrer)
      window.open(link.platforms[platform], '_blank')
    } catch (error) {
      console.error('Error tracking click:', error)
    }
  }

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  if (error) return <div className="text-red-600 text-center min-h-screen flex items-center justify-center">{error}</div>
  if (!link) return null

  const currentUrl = window.location.href

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white py-12 px-4">
      <div className="max-w-lg mx-auto text-center">
        {/* Cover Art */}
        {link.cover_art ? (
          <div className="mb-8">
            <img
              src={link.cover_art}
              alt={`${link.title} by ${link.artist}`}
              className="w-64 h-64 mx-auto rounded-lg shadow-2xl"
              onError={(e) => {
                // Fallback to a simple colored div with text when image fails to load
                e.target.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.className = 'w-64 h-64 mx-auto rounded-lg shadow-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium text-center px-4';
                fallback.innerHTML = `
                  <div>
                    <div class="text-2xl font-bold mb-2">${link.artist}</div>
                    <div class="text-xl opacity-90">${link.title}</div>
                  </div>
                `;
                e.target.parentNode.appendChild(fallback);
              }}
            />
          </div>
        ) : (
          // Show text-based placeholder when no cover art is available
          <div className="mb-8">
            <div className="w-64 h-64 mx-auto rounded-lg shadow-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium text-center px-4">
              <div>
                <div className="text-2xl font-bold mb-2">{link.artist}</div>
                <div className="text-xl opacity-90">{link.title}</div>
              </div>
            </div>
          </div>
        )}

        {/* Song Info */}
        <h1 className="text-4xl font-bold mb-2">{link.title}</h1>
        <h2 className="text-2xl text-gray-300 mb-8">{link.artist}</h2>

        {/* Platform Links */}
        <div className="space-y-4">
          {link.platforms.spotify && (
            <button
              onClick={() => handlePlatformClick('spotify')}
              className="w-full py-3 px-4 bg-[#1DB954] hover:bg-opacity-90 rounded-lg font-medium flex items-center justify-center space-x-2"
            >
              <span>Listen on Spotify</span>
            </button>
          )}

          {link.platforms.youtube && (
            <button
              onClick={() => handlePlatformClick('youtube')}
              className="w-full py-3 px-4 bg-[#FF0000] hover:bg-opacity-90 rounded-lg font-medium flex items-center justify-center space-x-2"
            >
              <span>Watch on YouTube</span>
            </button>
          )}
        </div>

        {/* QR Code */}
        <div className="mt-12">
          <button
            onClick={() => setShowQR(!showQR)}
            className="text-sm text-gray-400 hover:text-white"
          >
            {showQR ? 'Hide QR Code' : 'Show QR Code'}
          </button>
          
          {showQR && (
            <div className="mt-4 bg-white p-4 rounded-lg inline-block">
              <QRCodeSVG value={currentUrl} size={200} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
