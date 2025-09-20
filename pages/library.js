import { useState, useEffect } from 'react'

export default function Library() {
  const [papers, setPapers] = useState([])
  const [metaSummary, setMetaSummary] = useState('')
  const [isUpdatingMeta, setIsUpdatingMeta] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showCitation, setShowCitation] = useState({})
  const [citationStyle, setCitationStyle] = useState('apa')

  // Load saved papers from localStorage
  useEffect(() => {
    const savedPapers = localStorage.getItem('savedPapers')
    if (savedPapers) {
      try {
        const parsedPapers = JSON.parse(savedPapers)
        setPapers(parsedPapers)
        if (parsedPapers.length > 0) {
          updateMetaSummary(parsedPapers)
        }
      } catch (e) {
        console.error('Failed to load saved papers:', e)
      }
    }

    // Check for newly added paper
    const pendingPaper = localStorage.getItem('pendingLibraryPaper')
    if (pendingPaper) {
      try {
        const paper = JSON.parse(pendingPaper)
        addPaperToLibrary(paper)
        localStorage.removeItem('pendingLibraryPaper')
      } catch (e) {
        console.error('Failed to parse pending paper:', e)
      }
    }
  }, [])

  const addPaperToLibrary = async (paper) => {
    // Generate summary for this paper
    const summary = await generatePaperSummary(paper)
    const paperWithSummary = { ...paper, summary, id: Date.now() }
    
    // Get current papers from localStorage to ensure we have the latest state
    const currentSavedPapers = localStorage.getItem('savedPapers')
    const existingPapers = currentSavedPapers ? JSON.parse(currentSavedPapers) : []
    
    // Check if paper already exists (by title) to avoid duplicates
    const isDuplicate = existingPapers.some(existingPaper => 
      existingPaper.title === paper.title
    )
    
    if (isDuplicate) {
      console.log('Paper already exists in library:', paper.title)
      return
    }
    
    const newPapers = [...existingPapers, paperWithSummary]
    setPapers(newPapers)
    
    // Save to localStorage
    localStorage.setItem('savedPapers', JSON.stringify(newPapers))
    
    // Update meta-summary
    updateMetaSummary(newPapers)
  }

  const generatePaperSummary = async (paper) => {
    try {
      // Try to use Python backend for AI analysis
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const response = await fetch(`${API_BASE_URL}/api/generate-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: paper.title,
          abstract: paper.abstract
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        return `${data.summary} Methodology: ${data.methodology}. Findings: ${data.findings}. Significance: ${data.significance}`
      }
    } catch (error) {
      console.log('Using fallback summary generation')
    }
    
    // Fallback to mock AI summary generation
    const keyPoints = [
      `Studies ${extractMainTopic(paper.title)} using ${extractMethod(paper.abstract)}`,
      `Key findings: ${extractFindings(paper.abstract)}`,
      `Methodology: ${extractMethodology(paper.abstract)}`,
      `Limitations: ${extractLimitations(paper.abstract)}`
    ]
    
    return keyPoints.filter(point => !point.includes('undefined')).join('. ')
  }

  const extractMainTopic = (title) => {
    const topics = ['machine learning', 'neural networks', 'deep learning', 'AI', 'healthcare', 'computer vision']
    const titleLower = title.toLowerCase()
    return topics.find(topic => titleLower.includes(topic)) || 'the research topic'
  }

  const extractMethod = (abstract) => {
    if (!abstract) return 'various methods'
    const methods = ['CNN', 'RNN', 'transformer', 'regression', 'classification', 'clustering']
    const abstractLower = abstract.toLowerCase()
    return methods.find(method => abstractLower.includes(method)) || 'computational methods'
  }

  const extractFindings = (abstract) => {
    if (!abstract) return 'significant improvements were observed'
    if (abstract.toLowerCase().includes('improve')) return 'performance improvements were achieved'
    if (abstract.toLowerCase().includes('accuracy')) return 'high accuracy was demonstrated'
    return 'positive results were obtained'
  }

  const extractMethodology = (abstract) => {
    if (!abstract) return 'experimental approach'
    if (abstract.toLowerCase().includes('dataset')) return 'data-driven analysis'
    if (abstract.toLowerCase().includes('model')) return 'model-based approach'
    return 'systematic methodology'
  }

  const extractLimitations = (abstract) => {
    if (!abstract) return 'scope limitations noted'
    if (abstract.toLowerCase().includes('limited')) return 'dataset size limitations'
    return 'further research needed'
  }

  const updateMetaSummary = async (paperList) => {
    setIsUpdatingMeta(true)
    
    try {
      // Try to generate AI-powered meta-summary using all abstracts
      const allAbstracts = paperList.map(p => p.abstract).join(' ')
      
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const response = await fetch(`${API_BASE_URL}/api/meta-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          papers: paperList.map(p => ({
            title: p.title,
            abstract: p.abstract,
            authors: p.authors
          }))
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        const aiSummary = data.meta_summary
        
        // Generate meta-summary based on all papers
        const topics = paperList.map(p => extractMainTopic(p.title))
        const methods = paperList.map(p => extractMethod(p.abstract))
        const uniqueTopics = [...new Set(topics)]
        const uniqueMethods = [...new Set(methods)]
        
        const metaSummaryText = `
Research Overview (${paperList.length} papers):

AI Analysis: ${aiSummary}

Main Topics: ${uniqueTopics.join(', ')}
Common Methods: ${uniqueMethods.join(', ')}

Key Patterns:
• ${paperList.length > 3 ? 'Strong focus on ' + uniqueTopics[0] : 'Emerging research area'}
• ${uniqueMethods.length > 2 ? 'Diverse methodological approaches' : 'Consistent methodology'}
• ${paperList.length > 5 ? 'Well-established field' : 'Growing research domain'}

Research Gaps:
• Cross-method comparison needed
• Longitudinal studies lacking
• Real-world validation required
        `.trim()
        
        setMetaSummary(metaSummaryText)
        setIsUpdatingMeta(false)
        return
      }
    } catch (error) {
      console.log('Using fallback meta-summary generation')
    }
    
    // Fallback to original meta-summary generation
    const topics = paperList.map(p => extractMainTopic(p.title))
    const methods = paperList.map(p => extractMethod(p.abstract))
    const uniqueTopics = [...new Set(topics)]
    const uniqueMethods = [...new Set(methods)]
    
    const metaSummaryText = `
Research Overview (${paperList.length} papers):

Main Topics: ${uniqueTopics.join(', ')}
Common Methods: ${uniqueMethods.join(', ')}

Key Patterns:
• ${paperList.length > 3 ? 'Strong focus on ' + uniqueTopics[0] : 'Emerging research area'}
• ${uniqueMethods.length > 2 ? 'Diverse methodological approaches' : 'Consistent methodology'}
• ${paperList.length > 5 ? 'Well-established field' : 'Growing research domain'}

Research Gaps:
• Cross-method comparison needed
• Longitudinal studies lacking
• Real-world validation required
    `.trim()
    
    setTimeout(() => {
      setMetaSummary(metaSummaryText)
      setIsUpdatingMeta(false)
    }, 800)
  }

  const analyzePaper = async (paper, analysisType) => {
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
          p.id === paper.id 
            ? { ...p, analysis: { ...p.analysis, ...result } }
            : p
        )
        
        setPapers(updatedPapers)
        localStorage.setItem('savedPapers', JSON.stringify(updatedPapers))
      }
    } catch (error) {
      console.error('Analysis failed:', error)
    }
  }

  const removePaper = (paperId) => {
    const newPapers = papers.filter(p => p.id !== paperId)
    setPapers(newPapers)
    localStorage.setItem('savedPapers', JSON.stringify(newPapers))
    if (newPapers.length > 0) {
      updateMetaSummary(newPapers)
    } else {
      setMetaSummary('')
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim() || papers.length === 0) {
      return
    }

    setIsSearching(true)
    setSearchResults([])

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const response = await fetch(`${API_BASE_URL}/api/query-papers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          papers: papers.map(p => ({
            title: p.title,
            abstract: p.abstract,
            authors: p.authors,
            published_date: p.publishedDate
          }))
        })
      })

      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.results || [])
      } else {
        console.error('Search failed')
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
  }

  const generateCitation = async (paper, style = 'apa') => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const response = await fetch(`${API_BASE_URL}/api/generate-citation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paper: {
            title: paper.title,
            abstract: paper.abstract,
            authors: paper.authors,
            published_date: paper.publishedDate
          },
          style: style
        })
      })

      if (response.ok) {
        const data = await response.json()
        return data.citation
      }
    } catch (error) {
      console.error('Citation generation failed:', error)
    }
    return 'Citation generation failed'
  }

  const toggleCitation = async (paperId) => {
    const paper = papers.find(p => p.id === paperId)
    if (!paper) return

    if (showCitation[paperId]) {
      setShowCitation(prev => ({ ...prev, [paperId]: null }))
    } else {
      const citation = await generateCitation(paper, citationStyle)
      setShowCitation(prev => ({ ...prev, [paperId]: citation }))
    }
  }

  const copyCitation = (citation) => {
    navigator.clipboard.writeText(citation)
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="terminal-header">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="text-xl text-green-400 font-semibold tracking-wide hover:text-green-300 transition-colors">
              LiTRA Library
            </a>
            <div className="flex items-center gap-4">
              <a href="/" className="text-gray-400 text-sm hover:text-green-400 transition-colors">
                ← Back to Search
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-3 gap-6">

          {/* Left Column: Meta Summary + Search */}
          <div className="col-span-1 space-y-6">
            {/* Search Interface */}
            <div className="terminal-card">
              <div className="px-4 py-3 border-b border-gray-700">
                <h3 className="text-sm font-semibold text-green-400">Search Library</h3>
              </div>
              <div className="p-4">
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="search papers..."
                    className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-green-400"
                    disabled={papers.length === 0}
                  />
                  <button
                    onClick={handleSearch}
                    disabled={!searchQuery.trim() || papers.length === 0 || isSearching}
                    className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
                  >
                    {isSearching ? '...' : 'search'}
                  </button>
                </div>

                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="text-xs text-gray-400 hover:text-gray-300"
                  >
                    clear search
                  </button>
                )}

                {searchResults.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-600">
                    <div className="text-xs text-yellow-400 mb-2 font-medium">
                      Found {searchResults.length} results for "{searchQuery}"
                    </div>
                    <div className="space-y-2">
                      {searchResults.slice(0, 3).map((result, idx) => (
                        <div key={idx} className="text-xs">
                          <div className="text-gray-300">
                            {idx + 1}. {result.paper.title.substring(0, 60)}...
                          </div>
                          <div className="text-gray-500 ml-4">
                            score: {result.score.toFixed(1)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Meta Summary */}
            <div className="terminal-card h-fit">
              <div className="px-4 py-3 border-b border-gray-700">
                <h3 className="text-sm font-semibold text-yellow-400">Research Overview</h3>
              </div>
              <div className="p-4">
                {isUpdatingMeta ? (
                  <div className="text-xs text-gray-500">
                    Generating overview...
                  </div>
                ) : metaSummary ? (
                  <div className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">
                    {metaSummary}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500">
                    Add papers to see research overview
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Paper List */}
          <div className="col-span-2">
            <div className="terminal-card">
              <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-yellow-400">Saved Papers</h3>
                <div className="flex items-center gap-4">
                  <select
                    value={citationStyle}
                    onChange={(e) => setCitationStyle(e.target.value)}
                    className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-gray-300"
                  >
                    <option value="apa">APA</option>
                    <option value="mla">MLA</option>
                    <option value="bibtex">BibTeX</option>
                  </select>
                  <div className="text-xs text-gray-500">{papers.length} papers</div>
                </div>
              </div>
              
              {papers.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500 text-sm">
                    No papers saved yet<br />
                    <span className="text-gray-600">Add papers from search results</span>
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-700">
                  {papers.map((paper, index) => (
                    <div key={paper.id} className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <span className="text-green-400 text-sm mt-1 font-medium">{index + 1}.</span>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm text-gray-100 leading-tight mb-1 font-medium">
                            {paper.title}
                          </h4>
                          <div className="text-xs text-gray-400 mb-2">
                            {paper.authors} • {new Date(paper.publishedDate).toLocaleDateString()}
                          </div>
                        </div>
                        <button
                          onClick={() => removePaper(paper.id)}
                          className="text-red-400 hover:text-red-300 text-xs"
                        >
                          remove
                        </button>
                      </div>
                      
                      <div className="ml-6 pl-4 border-l-2 border-gray-600">
                        <div className="text-xs text-yellow-400 mb-1 font-medium">Summary:</div>
                        <p className="text-xs text-gray-300 leading-relaxed mb-3">
                          {paper.summary}
                        </p>
                        
                        {/* Analysis Actions */}
                        <div className="flex gap-2 flex-wrap mb-3">
                          <button
                            onClick={() => analyzePaper(paper, 'concepts')}
                            className="px-2 py-1 text-xs border border-blue-400 text-blue-400 hover:bg-blue-400 hover:bg-opacity-20 transition-colors rounded"
                          >
                            Extract Concepts
                          </button>
                          <button
                            onClick={() => analyzePaper(paper, 'related')}
                            className="px-2 py-1 text-xs border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:bg-opacity-20 transition-colors rounded"
                          >
                            Find Related
                          </button>
                          <button
                            onClick={() => analyzePaper(paper, 'full')}
                            className="px-2 py-1 text-xs border border-green-400 text-green-400 hover:bg-green-400 hover:bg-opacity-20 transition-colors rounded"
                          >
                            Full Analysis
                          </button>
                          <button
                            onClick={() => toggleCitation(paper.id)}
                            className="px-2 py-1 text-xs border border-purple-400 text-purple-400 hover:bg-purple-400 hover:bg-opacity-20 transition-colors rounded"
                          >
                            Generate Citation
                          </button>
                        </div>

                        {/* Citation Display */}
                        {showCitation[paper.id] && (
                          <div className="mt-3 pt-3 border-t border-gray-600">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-purple-400 font-medium">Citation ({citationStyle}):</span>
                              <button
                                onClick={() => copyCitation(showCitation[paper.id])}
                                className="text-xs text-gray-400 hover:text-gray-300"
                              >
                                copy
                              </button>
                            </div>
                            <div className="bg-gray-800 p-3 rounded border border-gray-600">
                              <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                                {showCitation[paper.id]}
                              </pre>
                            </div>
                          </div>
                        )}
                        
                        {/* Analysis Results */}
                        {paper.analysis && (
                          <div className="mt-3 pt-3 border-t border-gray-600">
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
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}