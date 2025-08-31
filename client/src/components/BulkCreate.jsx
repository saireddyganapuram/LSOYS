import { useState } from 'react'
import { createLink } from '../utils/api'

export default function BulkCreate({ onSuccess }) {
  const [urls, setUrls] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResults([])

    try {
      const urlList = urls.split('\n').map(url => url.trim()).filter(url => url)
      
      if (urlList.length === 0) {
        throw new Error('Please enter at least one URL')
      }

      if (urlList.length > 10) {
        throw new Error('Maximum 10 URLs allowed per bulk operation')
      }

      const results = []
      
      for (const url of urlList) {
        try {
          const result = await createLink({ url })
          if (result.error) {
            results.push({ url, success: false, error: result.error })
          } else {
            results.push({ url, success: true, link: result })
          }
        } catch (err) {
          results.push({ url, success: false, error: err.message })
        }
      }

      setResults(results)
      
      // Count successful creations
      const successCount = results.filter(r => r.success).length
      if (successCount > 0) {
        onSuccess(results.filter(r => r.success).map(r => r.link))
      }

    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const clearForm = () => {
    setUrls('')
    setResults([])
    setError(null)
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Bulk Create Links</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="urls" className="block text-sm font-medium text-gray-700">
            URLs (one per line, max 10)
          </label>
          <textarea
            id="urls"
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
            rows={6}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="https://open.spotify.com/track/...&#10;https://www.youtube.com/watch?v=...&#10;https://music.apple.com/album/..."
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Enter Spotify, YouTube, or Apple Music URLs. One URL per line.
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={loading || !urls.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Links'}
          </button>
          <button
            type="button"
            onClick={clearForm}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Clear
          </button>
        </div>
      </form>

      {/* Results */}
      {results.length > 0 && (
        <div className="mt-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">Results</h4>
          <div className="space-y-2">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-md ${
                  result.success
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 truncate">{result.url}</p>
                    {result.success ? (
                      <p className="text-sm text-green-700 mt-1">
                        ✓ Created: {result.link.title} by {result.link.artist}
                      </p>
                    ) : (
                      <p className="text-sm text-red-700 mt-1">
                        ✗ Error: {result.error}
                      </p>
                    )}
                  </div>
                  {result.success && (
                    <a
                      href={`/u/${result.link.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-600 hover:text-indigo-500 ml-2"
                    >
                      View
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-700">
              <span className="font-medium">
                {results.filter(r => r.success).length} of {results.length}
              </span> links created successfully
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
