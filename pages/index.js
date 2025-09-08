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
      <header className="terminal-header">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl terminal-title tracking-wide">
              ~/litra $
            </h1>
            <p className="text-gray-400 text-sm font-mono">literature review assistant</p>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Search Section */}
        <div className="mb-8">
          <div className="max-w-4xl mx-auto">
            <div className="terminal-card p-4">
              <div className="mb-3">
                <span className="text-green-400 font-mono text-sm">search@papers:</span>
              </div>
              <div className="flex gap-3">
                <span className="text-gray-400 font-mono">$</span>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchPapers()}
                  placeholder="query --arxiv"
                  className="flex-1 bg-transparent border-none outline-none text-gray-100 font-mono placeholder-gray-500"
                />
                <button
                  onClick={searchPapers}
                  disabled={loading}
                  className={`px-4 py-1 text-sm font-mono border rounded transition-colors ${
                    loading 
                      ? 'border-gray-600 text-gray-500 cursor-not-allowed' 
                      : 'border-green-400 text-green-400 hover:bg-green-400 hover:bg-opacity-20'
                  }`}
                >
                  {loading ? '[searching...]' : '[execute]'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {papers.length > 0 && (
            <div className="terminal-card overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-700">
                <h2 className="text-sm font-mono text-yellow-400">// found {papers.length} results</h2>
              </div>
              <div className="divide-y divide-gray-700">
                {papers.map((paper, index) => (
                  <div key={index}>
                    {/* Paper Card */}
                    <div 
                      className="px-4 py-4 cursor-pointer transition-colors hover:bg-gray-800 border-l-2 border-transparent hover:border-green-400"
                      onClick={() => {
                        console.log('Paper clicked:', paper.title)
                        setExpandedPaper(expandedPaper?.title === paper.title ? null : paper)
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-green-400 font-mono text-sm mt-1">[{index + 1}]</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-mono text-gray-100 hover:text-green-400 transition-colors leading-tight mb-2">
                            {paper.title}
                          </h3>
                          <div className="flex items-center gap-4 text-xs text-gray-400 font-mono">
                            <span>by: {paper.authors}</span>
                            <span>|</span>
                            <span>{new Date(paper.publishedDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedPaper?.title === paper.title && (
                      <div className="px-4 py-4 bg-gray-900 border-t border-gray-700">
                        <div className="space-y-4">
                          {/* Full Abstract */}
                          <div>
                            <div className="text-xs font-mono text-yellow-400 mb-2">// abstract:</div>
                            <p className="text-sm text-gray-300 leading-relaxed font-mono pl-4 border-l-2 border-gray-600">{paper.abstract}</p>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-3 flex-wrap pt-2">
                            <button className="px-3 py-1 text-xs font-mono border border-blue-400 text-blue-400 hover:bg-blue-400 hover:bg-opacity-20 transition-colors">
                              --extract-concepts
                            </button>
                            <button className="px-3 py-1 text-xs font-mono border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:bg-opacity-20 transition-colors">
                              --find-related
                            </button>
                            <button className="px-3 py-1 text-xs font-mono border border-green-400 text-green-400 hover:bg-green-400 hover:bg-opacity-20 transition-colors">
                              --add-to-graph
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
            <div className="terminal-card px-4 py-6 text-center">
              <p className="text-gray-400 font-mono text-sm">// no results found for <span className="text-red-400">"{query}"</span></p>
            </div>
          )}

        </div>
      </div>

    </div>
  )
}