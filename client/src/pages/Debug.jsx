import { useState, useEffect } from 'react'
import { getUserLinks, getLinkAnalytics } from '../utils/api'
import { useAuth } from '../contexts/AuthContext'

export default function Debug() {
  const [links, setLinks] = useState([])
  const [analytics, setAnalytics] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch all links
      const linksData = await getUserLinks()
      if (linksData.error) throw new Error(linksData.error)
      setLinks(linksData)

      // Fetch analytics for each link
      const analyticsData = {}
      for (const link of linksData) {
        try {
          const analyticsResult = await getLinkAnalytics(link.id)
          if (!analyticsResult.error) {
            analyticsData[link.id] = analyticsResult
          }
        } catch (err) {
          console.error(`Error fetching analytics for link ${link.id}:`, err)
        }
      }
      setAnalytics(analyticsData)
      
    } catch (error) {
      console.error('Error fetching data:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return <div className="flex justify-center items-center min-h-screen">Please log in to view debug data</div>
  }

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading debug data...</div>
  if (error) return <div className="text-red-600 text-center">{error}</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Database Debug View</h1>
      
      {/* User Info */}
      <div className="bg-blue-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Current User</h2>
        <pre className="bg-white p-4 rounded overflow-auto">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>

      {/* Links Data */}
      <div className="bg-green-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Links Table ({links.length} records)</h2>
        {links.length === 0 ? (
          <p className="text-gray-600">No links found</p>
        ) : (
          <div className="space-y-4">
            {links.map((link, index) => (
              <div key={link.id} className="bg-white p-4 rounded border">
                <h3 className="font-medium mb-2">Link {index + 1}: {link.title}</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                  {JSON.stringify(link, null, 2)}
                </pre>
                
                {/* Analytics for this link */}
                {analytics[link.id] && (
                  <div className="mt-3">
                    <h4 className="font-medium text-blue-600 mb-2">Analytics:</h4>
                    <pre className="bg-blue-100 p-3 rounded text-sm overflow-auto">
                      {JSON.stringify(analytics[link.id], null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Raw Data Export */}
      <div className="bg-yellow-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Raw Data Export</h2>
        <button
          onClick={() => {
            const data = { user, links, analytics }
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'database-debug-data.json'
            a.click()
            URL.revokeObjectURL(url)
          }}
          className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
        >
          Download All Data as JSON
        </button>
      </div>
    </div>
  )
}
