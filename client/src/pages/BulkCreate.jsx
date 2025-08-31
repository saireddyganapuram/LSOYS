import { useState } from 'react';
import { createLink } from '../utils/api';

export default function BulkCreateForm() {
  const [urls, setUrls] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const [progress, setProgress] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setResults([]);
    setProgress(0);

    const urlList = urls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0);

    const total = urlList.length;
    const results = [];

    for (let i = 0; i < urlList.length; i++) {
      try {
        const url = urlList[i];
        const data = await createLink(url);
        results.push({ url, success: true, data });
      } catch (error) {
        results.push({ url: urlList[i], success: false, error: error.message });
      }
      setProgress(((i + 1) / total) * 100);
      setResults([...results]);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Bulk Create Smart Links
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="urls"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Paste URLs (one per line)
            </label>
            <textarea
              id="urls"
              rows={10}
              className="shadow-sm block w-full focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
              placeholder="https://open.spotify.com/track/..."
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
            />
          </div>

          {error && (
            <div className="mb-4 text-red-600 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {loading ? 'Creating Links...' : 'Create Links'}
          </button>
        </form>

        {loading && (
          <div className="mt-4">
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block text-indigo-600">
                    {Math.round(progress)}% Complete
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
                <div
                  style={{ width: `${progress}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Results</h3>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-md ${
                    result.success
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <p className="text-sm font-medium mb-1">
                    {result.url}
                  </p>
                  {result.success ? (
                    <p className="text-sm text-green-700">
                      Created successfully: {result.data.slug}
                    </p>
                  ) : (
                    <p className="text-sm text-red-700">
                      Failed: {result.error}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
