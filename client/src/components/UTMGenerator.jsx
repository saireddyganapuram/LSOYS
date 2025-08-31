import { useState } from 'react'

export default function UTMGenerator({ baseUrl }) {
  const [utmParams, setUtmParams] = useState({
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
    utm_term: '',
    utm_content: ''
  })

  const [generatedUrl, setGeneratedUrl] = useState('')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setUtmParams(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const generateUrl = () => {
    const params = new URLSearchParams()
    Object.entries(utmParams).forEach(([key, value]) => {
      if (value.trim()) {
        params.append(key, value.trim())
      }
    })

    const url = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl
    setGeneratedUrl(url)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedUrl)
    alert('URL copied to clipboard!')
  }

  const clearForm = () => {
    setUtmParams({
      utm_source: '',
      utm_medium: '',
      utm_campaign: '',
      utm_term: '',
      utm_content: ''
    })
    setGeneratedUrl('')
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Generate UTM Tracking URL</h3>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="utm_source" className="block text-sm font-medium text-gray-700">
            UTM Source *
          </label>
          <input
            type="text"
            id="utm_source"
            name="utm_source"
            value={utmParams.utm_source}
            onChange={handleInputChange}
            placeholder="e.g., facebook, twitter, email"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="utm_medium" className="block text-sm font-medium text-gray-700">
            UTM Medium *
          </label>
          <input
            type="text"
            id="utm_medium"
            name="utm_medium"
            value={utmParams.utm_medium}
            onChange={handleInputChange}
            placeholder="e.g., social, email, cpc"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="utm_campaign" className="block text-sm font-medium text-gray-700">
            UTM Campaign *
          </label>
          <input
            type="text"
            id="utm_campaign"
            name="utm_campaign"
            value={utmParams.utm_campaign}
            onChange={handleInputChange}
            placeholder="e.g., summer2024, newrelease"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="utm_term" className="block text-sm font-medium text-gray-700">
            UTM Term
          </label>
          <input
            type="text"
            id="utm_term"
            name="utm_term"
            value={utmParams.utm_term}
            onChange={handleInputChange}
            placeholder="e.g., music, artist, song"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="utm_content" className="block text-sm font-medium text-gray-700">
            UTM Content
          </label>
          <input
            type="text"
            id="utm_content"
            name="utm_content"
            value={utmParams.utm_content}
            onChange={handleInputChange}
            placeholder="e.g., banner, textlink, image"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div className="flex space-x-3">
          <button
            onClick={generateUrl}
            disabled={!utmParams.utm_source || !utmParams.utm_medium || !utmParams.utm_campaign}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate URL
          </button>
          <button
            onClick={clearForm}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Clear
          </button>
        </div>

        {generatedUrl && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Generated URL:
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={generatedUrl}
                readOnly
                className="flex-1 rounded-md border-gray-300 shadow-sm bg-gray-50"
              />
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Copy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
