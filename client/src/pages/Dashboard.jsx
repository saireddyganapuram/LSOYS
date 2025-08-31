import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getUserLinks } from '../utils/api'
import { useAuth } from '../contexts/AuthContext'
import CreateLinkForm from '../components/CreateLinkForm'
import UTMGenerator from '../components/UTMGenerator'

export default function Dashboard() {
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      fetchLinks()
    }
  }, [user])

  const fetchLinks = async () => {
    try {
      setLoading(true)
      const data = await getUserLinks()
      if (data.error) {
        if (data.error === 'Unauthorized' || data.error.includes('token')) {
          // Token is invalid, logout and redirect to login
          await logout()
          navigate('/login')
          return
        }
        throw new Error(data.error)
      }
      setLinks(data)
    } catch (error) {
      console.error('Error fetching links:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLinkCreated = (newLink) => {
    setLinks([newLink, ...links])
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (!user) {
    return <div className="flex justify-center items-center min-h-screen">Redirecting to login...</div>
  }

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  if (error) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-red-600 text-center bg-red-50 p-4 rounded-md">
        {error}
        <button 
          onClick={fetchLinks} 
          className="ml-4 text-indigo-600 hover:text-indigo-500 underline"
        >
          Try Again
        </button>
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with user info and logout */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.email}</p>
        </div>
        <div className="flex space-x-3">
          <Link
            to="/debug"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Debug Data
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Create Link Form */}
      <div className="mb-12">
        <CreateLinkForm onSuccess={handleLinkCreated} />
      </div>

      {/* UTM Generator */}
      <div className="mb-12">
        <UTMGenerator baseUrl={window.location.origin} />
      </div>

      {/* Links List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Your Smart Links
          </h3>
          
          {links.length === 0 ? (
            <div className="mt-6 text-center text-gray-500">
              <p>No links created yet. Create your first smart link above!</p>
            </div>
          ) : (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {links.map((link) => (
                <div
                  key={link.id}
                  className="relative bg-white border rounded-lg shadow-sm overflow-hidden"
                >
                  {link.cover_art ? (
                    <img
                      src={link.cover_art}
                      alt=""
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        // Fallback to a simple colored div with text when image fails to load
                        e.target.style.display = 'none';
                        const fallback = document.createElement('div');
                        fallback.className = 'w-full h-48 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium text-lg';
                        fallback.textContent = `${link.artist} - ${link.title}`;
                        e.target.parentNode.insertBefore(fallback, e.target);
                      }}
                    />
                  ) : (
                    // Show text-based placeholder when no cover art is available
                    <div className="w-full h-48 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium text-lg text-center px-4">
                      <div>
                        <div className="text-xl font-bold mb-2">{link.artist}</div>
                        <div className="text-lg opacity-90">{link.title}</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="p-4">
                    <h4 className="text-lg font-medium text-gray-900 truncate">
                      {link.title}
                    </h4>
                    <p className="text-sm text-gray-500 truncate">{link.artist}</p>
                    
                    <div className="mt-4 flex justify-between items-center">
                      <Link
                        to={`/analytics/${link.id}`}
                        className="text-sm text-indigo-600 hover:text-indigo-500"
                      >
                        View Analytics
                      </Link>
                      
                      <Link
                        to={`/u/${link.slug}`}
                        className="text-sm text-gray-600 hover:text-gray-500"
                        target="_blank"
                      >
                        View Landing Page
                      </Link>
                    </div>

                    <div className="mt-4 flex space-x-2">
                      {link.platforms && Object.keys(link.platforms).map((platform) => (
                        <span
                          key={platform}
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            platform === 'spotify'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
