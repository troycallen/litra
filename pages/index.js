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
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b-2 border-indigo-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">LiTRA</h1>
            <p className="text-gray-600 font-medium">Literature Review Assistant</p>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Search Section */}
        <div className="mb-12">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchPapers()}
                placeholder="Search research papers..."
                className="flex-1 px-4 py-4 border-2 border-gray-200 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all shadow-sm"
              />
              <button
                onClick={searchPapers}
                disabled={loading}
                className="px-8 py-4 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                style={{
                  backgroundColor: loading ? '#9ca3af' : '#4f46e5',
                  color: 'white',
                }}
                onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#4338ca')}
                onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#4f46e5')}
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-8">
          {papers.length > 0 && (
            <div className="bg-white border border-gray-200 shadow-md">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-xl font-semibold text-gray-900">Found {papers.length} papers</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {papers.map((paper, index) => (
                  <div key={index}>
                    {/* Paper Card */}
                    <div 
                      className="px-6 py-5 cursor-pointer transition-all duration-200 group border-l-4 border-transparent"
                      style={{backgroundColor: 'white'}}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#eef2ff'
                        e.currentTarget.style.borderLeftColor = '#818cf8'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'white'
                        e.currentTarget.style.borderLeftColor = 'transparent'
                      }}
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
                      <div 
                        className="px-8 py-8 border-t" 
                        style={{ backgroundColor: '#f8fafc', borderTopColor: '#e2e8f0' }}
                      >
                        <div className="space-y-8">
                          {/* Full Abstract */}
                          <div>
                            <h4 className="text-xl font-semibold text-gray-900 mb-4">Abstract</h4>
                            <p className="text-gray-700 leading-relaxed text-lg">{paper.abstract}</p>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-4">
                            <button 
                              className="px-6 py-3 font-medium transition-all shadow-sm"
                              style={{
                                backgroundColor: 'white',
                                border: '2px solid #e5e7eb',
                                color: '#374151'
                              }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                            >
                              Extract Concepts
                            </button>
                            <button 
                              className="px-6 py-3 font-medium transition-all shadow-sm"
                              style={{
                                backgroundColor: 'white',
                                border: '2px solid #e5e7eb',
                                color: '#374151'
                              }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                            >
                              Find Related
                            </button>
                            <button 
                              className="px-6 py-3 font-medium transition-all shadow-sm"
                              style={{
                                backgroundColor: '#4f46e5',
                                border: '2px solid #4f46e5',
                                color: 'white'
                              }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#4338ca'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = '#4f46e5'}
                            >
                              Add to Graph
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
            <div className="bg-white border border-gray-200 shadow-md px-6 py-8 text-center">
              <p className="text-gray-600">No papers found for <span className="font-medium text-gray-900">"{query}"</span></p>
            </div>
          )}

          {!query && (
            <div className="bg-white border border-gray-200 shadow-md px-8 py-12 text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Enhanced Literature Review Assistant
              </h2>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Search for research papers and build interactive concept maps with AI assistance
              </p>
              <div className="grid md:grid-cols-3 gap-8 text-left max-w-4xl mx-auto">
                <div className="p-6 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors">
                  <h3 className="font-semibold text-blue-900 mb-2">AI-Powered Search</h3>
                  <p className="text-blue-700">Find relevant papers across multiple databases</p>
                </div>
                <div className="p-6 bg-green-50 border border-green-200 hover:bg-green-100 transition-colors">
                  <h3 className="font-semibold text-green-900 mb-2">Concept Mapping</h3>
                  <p className="text-green-700">Visualize relationships between ideas and papers</p>
                </div>
                <div className="p-6 bg-purple-50 border border-purple-200 hover:bg-purple-100 transition-colors">
                  <h3 className="font-semibold text-purple-900 mb-2">Smart Summaries</h3>
                  <p className="text-purple-700">Get AI-generated insights and key findings</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}