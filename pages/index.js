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
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              letterSpacing: '-0.025em',
              color: '#1e293b'
            }}>
              LiTRA
            </h1>
            <p style={{
              color: '#64748b',
              fontSize: '1.125rem',
              fontWeight: '500'
            }}>Literature Review Assistant</p>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Search Section */}
        <div className="mb-12">
          <div className="max-w-4xl mx-auto">
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
              padding: '2rem'
            }}>
              <div className="flex gap-4">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchPapers()}
                  placeholder="Search research papers..."
                  style={{
                    flex: 1,
                    padding: '1rem 1.5rem',
                    fontSize: '1.125rem',
                    fontWeight: '500',
                    color: '#1e293b',
                    backgroundColor: '#f8fafc',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
                <button
                  onClick={searchPapers}
                  disabled={loading}
                  style={{
                    padding: '1rem 2rem',
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: 'white',
                    backgroundColor: loading ? '#9ca3af' : '#3b82f6',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s',
                    opacity: loading ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#2563eb')}
                  onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#3b82f6')}
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
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '1.5rem 2rem',
                backgroundColor: '#f8fafc',
                borderBottom: '1px solid #e2e8f0'
              }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#1e293b'
                }}>Found {papers.length} papers</h2>
              </div>
              <div className="divide-y" style={{ borderColor: 'rgba(226, 232, 240, 0.3)' }}>
                {papers.map((paper, index) => (
                  <div key={index}>
                    {/* Paper Card */}
                    <div 
                      className="px-8 py-6 cursor-pointer transition-all duration-300 group"
                      style={{
                        background: 'rgba(255, 255, 255, 0.8)',
                        borderLeft: '4px solid transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.05) 100%)'
                        e.currentTarget.style.borderLeftColor = '#667eea'
                        e.currentTarget.style.transform = 'translateX(4px)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)'
                        e.currentTarget.style.borderLeftColor = 'transparent'
                        e.currentTarget.style.transform = 'translateX(0px)'
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
                        className="px-10 py-10" 
                        style={{ 
                          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.08) 100%)',
                          borderTop: '1px solid rgba(102, 126, 234, 0.2)'
                        }}
                      >
                        <div className="space-y-8">
                          {/* Full Abstract */}
                          <div>
                            <h4 className="text-2xl font-bold text-gray-900 mb-6">Abstract</h4>
                            <p className="text-gray-700 leading-relaxed text-lg">{paper.abstract}</p>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-4">
                            <button 
                              className="px-8 py-4 font-semibold transition-all shadow-lg"
                              style={{
                                background: 'rgba(255, 255, 255, 0.9)',
                                border: '2px solid rgba(102, 126, 234, 0.3)',
                                color: '#4b5563',
                                borderRadius: '16px'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.background = 'rgba(102, 126, 234, 0.1)'
                                e.target.style.transform = 'translateY(-2px)'
                                e.target.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.2)'
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.background = 'rgba(255, 255, 255, 0.9)'
                                e.target.style.transform = 'translateY(0px)'
                                e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'
                              }}
                            >
                              🔍 Extract Concepts
                            </button>
                            <button 
                              className="px-8 py-4 font-semibold transition-all shadow-lg"
                              style={{
                                background: 'rgba(255, 255, 255, 0.9)',
                                border: '2px solid rgba(102, 126, 234, 0.3)',
                                color: '#4b5563',
                                borderRadius: '16px'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.background = 'rgba(102, 126, 234, 0.1)'
                                e.target.style.transform = 'translateY(-2px)'
                                e.target.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.2)'
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.background = 'rgba(255, 255, 255, 0.9)'
                                e.target.style.transform = 'translateY(0px)'
                                e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'
                              }}
                            >
                              🔗 Find Related
                            </button>
                            <button 
                              className="px-8 py-4 font-semibold transition-all shadow-lg"
                              style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                border: 'none',
                                color: 'white',
                                borderRadius: '16px'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-2px)'
                                e.target.style.boxShadow = '0 15px 35px rgba(102, 126, 234, 0.4)'
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0px)'
                                e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'
                              }}
                            >
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
            <div className="bg-white border border-gray-200 shadow-md px-6 py-8 text-center">
              <p className="text-gray-600">No papers found for <span className="font-medium text-gray-900">"{query}"</span></p>
            </div>
          )}

        </div>
      </div>

    </div>
  )
}