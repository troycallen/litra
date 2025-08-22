import { useState } from 'react'

export default function Home() {
  const [query, setQuery] = useState('')
  const [papers, setPapers] = useState([])
  const [loading, setLoading] = useState(false)
  const [expandedPaper, setExpandedPaper] = useState(null)

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
                  <div key={index}>
                    {/* Paper Card */}
                    <div 
                      className="border-l-4 border-blue-500 pl-4 hover:bg-blue-50 cursor-pointer rounded-r-lg p-3 transition-colors border border-transparent hover:border-blue-200"
                      onClick={() => {
                        console.log('Paper clicked:', paper.title)
                        setExpandedPaper(expandedPaper?.title === paper.title ? null : paper)
                      }}
                    >
                      <h3 className="font-medium text-gray-900 hover:text-blue-600">{paper.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{paper.authors}</p>
                      <p className="text-sm text-gray-500 mt-1">Published: {new Date(paper.publishedDate).toLocaleDateString()}</p>
                      <div className="mt-2 flex items-center text-xs text-blue-600">
                        <span>{expandedPaper?.title === paper.title ? 'Hide details ↑' : 'Click to view details →'}</span>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedPaper?.title === paper.title && (
                      <div className="mt-4 ml-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="space-y-4">
                          {/* Full Abstract */}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Full Abstract</h4>
                            <p className="text-sm text-gray-700 leading-relaxed">{paper.abstract}</p>
                          </div>

                          {/* Paper Info */}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-600">Authors:</span>
                              <p className="text-gray-900">{paper.authors}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Published:</span>
                              <p className="text-gray-900">{new Date(paper.publishedDate).toLocaleDateString()}</p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 pt-2">
                            <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200">
                              📊 Extract Concepts
                            </button>
                            <button className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200">
                              🔗 Find Related
                            </button>
                            <button className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200">
                              ⭐ Add to Graph
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
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