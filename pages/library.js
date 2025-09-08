import { useState, useEffect } from 'react'

export default function Library() {
  const [papers, setPapers] = useState([])
  const [metaSummary, setMetaSummary] = useState('')
  const [isUpdatingMeta, setIsUpdatingMeta] = useState(false)

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
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-summary',
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
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-summary',
          title: `Research Collection Analysis (${paperList.length} papers)`,
          abstract: allAbstracts
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        const aiSummary = data.summary
        
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
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...data })
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

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="terminal-header">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="text-xl terminal-title tracking-wide hover:text-green-300 transition-colors">
              ~/litra/library $
            </a>
            <div className="flex items-center gap-4">
              <a href="/" className="text-gray-400 text-sm font-mono hover:text-green-400 transition-colors">
                ← search
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-3 gap-6">
          
          {/* Meta Summary */}
          <div className="col-span-1">
            <div className="terminal-card h-fit">
              <div className="px-4 py-3 border-b border-gray-700">
                <h3 className="text-sm font-mono text-yellow-400">// research overview</h3>
              </div>
              <div className="p-4">
                {isUpdatingMeta ? (
                  <div className="text-xs font-mono text-gray-500">
                    [generating meta-summary...]
                  </div>
                ) : metaSummary ? (
                  <div className="text-xs font-mono text-gray-300 leading-relaxed whitespace-pre-line">
                    {metaSummary}
                  </div>
                ) : (
                  <div className="text-xs font-mono text-gray-500">
                    // add papers to see research overview
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Paper List */}
          <div className="col-span-2">
            <div className="terminal-card">
              <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
                <h3 className="text-sm font-mono text-yellow-400">// saved papers</h3>
                <div className="text-xs font-mono text-gray-500">{papers.length} papers</div>
              </div>
              
              {papers.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500 font-mono text-sm">
                    // no papers saved yet<br />
                    <span className="text-gray-600">use --add-to-library from search results</span>
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-700">
                  {papers.map((paper, index) => (
                    <div key={paper.id} className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <span className="text-green-400 font-mono text-sm mt-1">[{index + 1}]</span>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-mono text-gray-100 leading-tight mb-1">
                            {paper.title}
                          </h4>
                          <div className="text-xs text-gray-400 font-mono mb-2">
                            {paper.authors} • {new Date(paper.publishedDate).toLocaleDateString()}
                          </div>
                        </div>
                        <button
                          onClick={() => removePaper(paper.id)}
                          className="text-red-400 hover:text-red-300 text-xs font-mono"
                        >
                          [remove]
                        </button>
                      </div>
                      
                      <div className="ml-6 pl-4 border-l-2 border-gray-600">
                        <div className="text-xs font-mono text-yellow-400 mb-1">// summary:</div>
                        <p className="text-xs font-mono text-gray-300 leading-relaxed mb-3">
                          {paper.summary}
                        </p>
                        
                        {/* Analysis Actions */}
                        <div className="flex gap-2 flex-wrap">
                          <button 
                            onClick={() => analyzePaper(paper, 'concepts')}
                            className="px-2 py-1 text-xs font-mono border border-blue-400 text-blue-400 hover:bg-blue-400 hover:bg-opacity-20 transition-colors"
                          >
                            --extract-concepts
                          </button>
                          <button 
                            onClick={() => analyzePaper(paper, 'related')}
                            className="px-2 py-1 text-xs font-mono border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:bg-opacity-20 transition-colors"
                          >
                            --find-related
                          </button>
                          <button 
                            onClick={() => analyzePaper(paper, 'full')}
                            className="px-2 py-1 text-xs font-mono border border-green-400 text-green-400 hover:bg-green-400 hover:bg-opacity-20 transition-colors"
                          >
                            --full-analysis
                          </button>
                        </div>
                        
                        {/* Analysis Results */}
                        {paper.analysis && (
                          <div className="mt-3 pt-3 border-t border-gray-600">
                            <div className="text-xs font-mono text-yellow-400 mb-2">// analysis results:</div>
                            {paper.analysis.concepts && (
                              <div className="mb-2">
                                <span className="text-xs font-mono text-blue-400">concepts:</span>
                                <div className="text-xs font-mono text-gray-400 ml-2">
                                  {paper.analysis.concepts.join(', ')}
                                </div>
                              </div>
                            )}
                            {paper.analysis.related_papers && (
                              <div>
                                <span className="text-xs font-mono text-yellow-400">related papers:</span>
                                <div className="text-xs font-mono text-gray-400 ml-2">
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