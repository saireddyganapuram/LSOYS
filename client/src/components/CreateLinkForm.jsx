import { useState } from 'react'
import { createLink } from '../utils/api'

export default function CreateLinkForm({ onSuccess }) {
  const [formType, setFormType] = useState('url') // 'url' or 'manual'
  const [url, setUrl] = useState('')
  const [artist, setArtist] = useState('')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const data = formType === 'url'
        ? await createLink(url)
        : await createLink(null, artist, title)

      if (data.error) throw new Error(data.error)
      
      // Reset form
      setUrl('')
      setArtist('')
      setTitle('')
      
      // Call success callback with created link
      onSuccess(data)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6">Create Smart Link</h2>
        
        <div className="mb-6">
          <div className="flex rounded-md shadow-sm">
            <button
              type="button"
              onClick={() => setFormType('url')}
              className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                formType === 'url'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:text-gray-500'
              }`}
            >
              Paste URL
            </button>
            <button
              type="button"
              onClick={() => setFormType('manual')}
              className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                formType === 'manual'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:text-gray-500'
              }`}
            >
              Enter Details
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {formType === 'url' ? (
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                Music URL
              </label>
              <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Spotify or YouTube URL"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>
          ) : (
            <>
              <div>
                <label htmlFor="artist" className="block text-sm font-medium text-gray-700">
                  Artist Name
                </label>
                <input
                  type="text"
                  id="artist"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Song Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
            </>
          )}

          {error && (
            <div className="text-red-600 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {loading ? 'Creating...' : 'Create Smart Link'}
          </button>
        </form>
      </div>
    </div>
  )
}
