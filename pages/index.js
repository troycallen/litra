import { useState, useEffect } from 'react'

export default function Home() {
  const [query, setQuery] = useState('')
  const [papers, setPapers] = useState([])
  const [loading, setLoading] = useState(false)
  const [expandedPaper, setExpandedPaper] = useState(null)
  const [analyzingPaper, setAnalyzingPaper] = useState(null)

  // Load saved search results from localStorage on component mount
  useEffect(() => {
    const savedSearchResults = localStorage.getItem('searchResults')
    if (savedSearchResults) {
      try {
        const parsedResults = JSON.parse(savedSearchResults)
        setPapers(parsedResults)
      } catch (e) {
        console.error('Failed to load saved search results:', e)
      }
    }
  }, [])

  const searchPapers = async () => {
    if (!query.trim()) return
    
    setLoading(true)
    try {
      // Basic ArXiv search implementation
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      const searchResults = data.papers || []
      
      // Save search results to localStorage
      setPapers(searchResults)
      localStorage.setItem('searchResults', JSON.stringify(searchResults))
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const analyzePaper = async (paper, analysisType) => {
    setAnalyzingPaper(paper.title)
    
    try {
      let action, data
      
      switch (analysisType) {
        case 'concepts':
          action = 'extract-concepts'
          data = { text: paper.abstract }
          break
        case 'related':
          action = 'find-related'
          data = { concepts: paper.concepts || [], title: paper.title }
          break
        case 'full':
          action = 'analyze-paper'
          data = { title: paper.title, abstract: paper.abstract }
          break
        default:
          return
      }
      
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      let endpoint
      switch (action) {
        case 'extract-concepts':
          endpoint = '/api/extract-concepts'
          break
        case 'find-related':
          endpoint = '/api/find-related'
          break
        case 'analyze-paper':
          endpoint = '/api/analyze-paper'
          break
        default:
          return
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (response.ok) {
        const result = await response.json()
        
        // Update paper with analysis results
        const updatedPapers = papers.map(p => 
          p.title === paper.title 
            ? { ...p, analysis: { ...p.analysis, ...result } }
            : p
        )
        
        setPapers(updatedPapers)
        localStorage.setItem('searchResults', JSON.stringify(updatedPapers))
      }
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setAnalyzingPaper(null)
    }
  }


  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="terminal-header">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="text-xl text-green-400 font-semibold tracking-wide hover:text-green-300 transition-colors">
              LiTRA Research
            </a>
            <div className="flex items-center gap-4">
              <a href="/library" className="text-gray-400 text-sm hover:text-green-400 transition-colors">
                Library →
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Search Section */}
        <div className="mb-8">
          <div className="max-w-4xl mx-auto">
            <div className="terminal-card p-4">
              <div className="mb-3">
                <span className="text-green-400 text-sm font-medium">Search Papers</span>
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchPapers()}
                  placeholder="Enter research topic or keywords..."
                  className="flex-1 bg-transparent border-none outline-none text-gray-100 placeholder-gray-500"
                />
                <button
                  onClick={searchPapers}
                  disabled={loading}
                  className={`px-4 py-1 text-sm border rounded transition-colors ${
                    loading 
                      ? 'border-gray-600 text-gray-500 cursor-not-allowed' 
                      : 'border-green-400 text-green-400 hover:bg-green-400 hover:bg-opacity-20'
                  }`}
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {papers.length > 0 && (
            <div className="terminal-card overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-yellow-400">Found {papers.length} Results</h2>
                <button
                  onClick={() => {
                    setPapers([])
                    localStorage.removeItem('searchResults')
                  }}
                  className="text-xs text-gray-400 hover:text-red-400 transition-colors px-2 py-1 hover:bg-red-400 hover:bg-opacity-10 rounded"
                >
                  Clear
                </button>
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
                        <span className="text-green-400 text-sm mt-1 font-medium">{index + 1}.</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm text-gray-100 hover:text-green-400 transition-colors leading-tight mb-2 font-medium">
                            {paper.title}
                          </h3>
                          <div className="flex items-center gap-4 text-xs text-gray-400">
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
                            <div className="text-xs text-yellow-400 mb-2 font-medium">Abstract:</div>
                            <p className="text-sm text-gray-300 leading-relaxed pl-4 border-l-2 border-gray-600">{paper.abstract}</p>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-3 flex-wrap pt-2">
                            <button 
                              onClick={() => analyzePaper(paper, 'concepts')}
                              disabled={analyzingPaper === paper.title}
                              className={`px-3 py-1 text-xs border border-blue-400 text-blue-400 hover:bg-blue-400 hover:bg-opacity-20 transition-colors rounded ${
                                analyzingPaper === paper.title ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            >
                              {analyzingPaper === paper.title ? 'Analyzing...' : 'Extract Concepts'}
                            </button>
                            <button 
                              onClick={() => analyzePaper(paper, 'related')}
                              disabled={analyzingPaper === paper.title}
                              className={`px-3 py-1 text-xs border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:bg-opacity-20 transition-colors rounded ${
                                analyzingPaper === paper.title ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            >
                              {analyzingPaper === paper.title ? 'Analyzing...' : 'Find Related'}
                            </button>
                            <button 
                              className="px-3 py-1 text-xs border border-green-400 text-green-400 hover:bg-green-400 hover:bg-opacity-20 transition-colors rounded"
                              onClick={() => {
                                // Store paper data for library and redirect
                                localStorage.setItem('pendingLibraryPaper', JSON.stringify(paper))
                                window.location.href = '/library'
                              }}
                            >
                              Add to Library
                            </button>
                          </div>

                          {/* Analysis Results */}
                          {paper.analysis && (
                            <div className="mt-4 pt-3 border-t border-gray-600">
                              <div className="text-xs text-yellow-400 mb-2 font-medium">Analysis Results:</div>
                              {paper.analysis.concepts && (
                                <div className="mb-2">
                                  <span className="text-xs text-blue-400 font-medium">Concepts:</span>
                                  <div className="text-xs text-gray-400 ml-2">
                                    {paper.analysis.concepts.join(', ')}
                                  </div>
                                </div>
                              )}
                              {paper.analysis.related_papers && (
                                <div>
                                  <span className="text-xs text-yellow-400 font-medium">Related Papers:</span>
                                  <div className="text-xs text-gray-400 ml-2">
                                    {paper.analysis.related_papers.length} papers found
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
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
              <p className="text-gray-400 text-sm">No results found for <span className="text-red-400">"{query}"</span></p>
            </div>
          )}

        </div>
      </div>

    </div>
  )
}