import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getLinkAnalytics } from '../utils/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function Analytics() {
  const { linkId } = useParams()
  const [analytics, setAnalytics] = useState(null)
  const [fullAnalyticsData, setFullAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [timeRange, setTimeRange] = useState('7d') // '7d', '30d', 'all'

  useEffect(() => {
    fetchAnalytics()
  }, [linkId, timeRange])

  const fetchAnalytics = async () => {
    try {
      const data = await getLinkAnalytics(linkId)
      if (data.error) throw new Error(data.error)
      
      // Store the full analytics data
      setFullAnalyticsData(data)
      
      // Process analytics data for the chart
      const processedData = processAnalyticsData(data, timeRange)
      setAnalytics(processedData)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const processAnalyticsData = (data, range) => {
    // The server now returns a structured analytics object with clicksByPlatform
    // We need to convert this to the chart format expected by the component
    
    if (!data.clicksByPlatform || Object.keys(data.clicksByPlatform).length === 0) {
      // No clicks data available
      return [{
        platform: 'No clicks yet',
        clicks: 0
      }];
    }

    // Convert platform data to chart format
    return Object.entries(data.clicksByPlatform).map(([platform, count]) => ({
      platform,
      clicks: count
    }));
  }

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  if (error) return <div className="text-red-600 text-center">{error}</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Link Analytics</h2>
            {fullAnalyticsData && fullAnalyticsData.link && (
              <p className="text-gray-600 mt-1">
                {fullAnalyticsData.link.artist} - {fullAnalyticsData.link.title}
              </p>
            )}
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-3 py-1 rounded ${
                timeRange === '7d'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-3 py-1 rounded ${
                timeRange === '30d'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setTimeRange('all')}
              className={`px-3 py-1 rounded ${
                timeRange === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Time
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        {fullAnalyticsData && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900">Total Clicks</h3>
              <p className="mt-2 text-3xl font-bold text-indigo-600">
                {fullAnalyticsData.totalClicks || 0}
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900">Most Popular Platform</h3>
              <p className="mt-2 text-3xl font-bold text-indigo-600">
                {fullAnalyticsData.clicksByPlatform && Object.keys(fullAnalyticsData.clicksByPlatform).length > 0
                  ? Object.entries(fullAnalyticsData.clicksByPlatform).reduce((max, [platform, clicks]) => 
                      clicks > (max?.clicks || 0) ? { platform, clicks } : max
                    , null)?.platform || 'N/A'
                  : 'N/A'
                }
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900">Platforms</h3>
              <p className="mt-2 text-3xl font-bold text-indigo-600">
                {fullAnalyticsData.clicksByPlatform ? Object.keys(fullAnalyticsData.clicksByPlatform).length : 0}
              </p>
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="platform" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="clicks" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </div>


      </div>
    </div>
  )
}
