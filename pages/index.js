import { useState } from 'react'

export default function Home() {
  const [query, setQuery] = useState('')
  const [papers, setPapers] = useState([])
  const [loading, setLoading] = useState(false)

  const searchPapers = async () => {
    if (!query.trim()) return
    
    setLoading(true)
    try {
      // Basic ArXiv search implementation
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      setPapers(data.papers || [])
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-blue-600">LiTRA</h1>
            <p className="text-gray-600">Literature Review Assistant</p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Section */}
        <div className="mb-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchPapers()}
                placeholder="Search for research papers..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={searchPapers}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="grid gap-6">
          {papers.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Found {papers.length} papers</h2>
              <div className="space-y-4">
                {papers.map((paper, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-medium text-gray-900">{paper.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{paper.authors}</p>
                    <p className="text-sm text-gray-700 mt-2">{paper.abstract}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {papers.length === 0 && query && !loading && (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              No papers found for "{query}"
            </div>
          )}

          {!query && (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Enhanced Literature Review Assistant
              </h2>
              <p className="text-gray-600 mb-6">
                Search for research papers and build interactive concept maps with AI assistance
              </p>
              <div className="grid md:grid-cols-3 gap-6 text-left">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">AI-Powered Search</h3>
                  <p className="text-sm text-blue-700">Find relevant papers across multiple databases</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-medium text-green-900 mb-2">Concept Mapping</h3>
                  <p className="text-sm text-green-700">Visualize relationships between ideas and papers</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-medium text-purple-900 mb-2">Smart Summaries</h3>
                  <p className="text-sm text-purple-700">Get AI-generated insights and key findings</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}