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
    <div className="min-h-screen">
      {/* Header */}
      <header className="modern-header">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold tracking-tight gradient-text">
              LiTRA
            </h1>
            <p className="text-gray-600 text-lg font-medium">Literature Review Assistant</p>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Search Section */}
        <div className="mb-12">
          <div className="max-w-4xl mx-auto">
            <div className="modern-card p-8">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchPapers()}
                  placeholder="Search research papers..."
                  className="flex-1 p-4 text-lg font-medium text-gray-800 bg-gray-50 border-2 border-gray-200 rounded-lg outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
                <button
                  onClick={searchPapers}
                  disabled={loading}
                  className={`px-8 py-4 text-lg font-semibold text-white rounded-lg transition-all ${
                    loading 
                      ? 'bg-gray-400 cursor-not-allowed opacity-50' 
                      : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                  }`}
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-8">
          {papers.length > 0 && (
            <div className="modern-card overflow-hidden">
              <div className="px-8 py-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
                <h2 className="text-2xl font-bold gradient-text">Found {papers.length} papers</h2>
              </div>
              <div className="divide-y" style={{ borderColor: 'rgba(226, 232, 240, 0.3)' }}>
                {papers.map((paper, index) => (
                  <div key={index}>
                    {/* Paper Card */}
                    <div 
                      className="px-8 py-6 cursor-pointer transition-all duration-300 group bg-white bg-opacity-80 border-l-4 border-transparent hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:border-indigo-400 hover:transform hover:translate-x-1"
                      onClick={() => {
                        console.log('Paper clicked:', paper.title)
                        setExpandedPaper(expandedPaper?.title === paper.title ? null : paper)
                      }}
                    >
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors leading-tight mb-3">
                        {paper.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="font-medium">{paper.authors}</span>
                        <span className="text-gray-400">•</span>
                        <span>{new Date(paper.publishedDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedPaper?.title === paper.title && (
                      <div className="px-10 py-10 bg-gradient-to-r from-indigo-25 to-purple-25 border-t border-indigo-200">
                        <div className="space-y-8">
                          {/* Full Abstract */}
                          <div>
                            <h4 className="text-2xl font-bold gradient-text mb-6">Abstract</h4>
                            <p className="text-gray-700 leading-relaxed text-lg">{paper.abstract}</p>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-4">
                            <button className="px-8 py-4 font-semibold transition-all shadow-lg bg-white bg-opacity-90 border-2 border-indigo-200 text-gray-600 rounded-2xl hover:bg-indigo-50 hover:border-indigo-300 hover:transform hover:-translate-y-1 hover:shadow-xl">
                              🔍 Extract Concepts
                            </button>
                            <button className="px-8 py-4 font-semibold transition-all shadow-lg bg-white bg-opacity-90 border-2 border-indigo-200 text-gray-600 rounded-2xl hover:bg-indigo-50 hover:border-indigo-300 hover:transform hover:-translate-y-1 hover:shadow-xl">
                              🔗 Find Related
                            </button>
                            <button className="px-8 py-4 font-semibold transition-all shadow-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl hover:from-indigo-600 hover:to-purple-700 hover:transform hover:-translate-y-1 hover:shadow-xl">
                              ✨ Add to Graph
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
            <div className="modern-card px-6 py-8 text-center">
              <p className="text-gray-600">No papers found for <span className="font-medium gradient-text">"{query}"</span></p>
            </div>
          )}

        </div>
      </div>

    </div>
  )
}