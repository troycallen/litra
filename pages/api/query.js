export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { query, papers, action = 'search', style = 'apa' } = req.body

  if (!query && action === 'search') {
    return res.status(400).json({ error: 'Query is required for search' })
  }

  if (!papers) {
    return res.status(400).json({ error: 'Papers array is required' })
  }

  try {
    if (action === 'search') {
      // Search through papers
      const response = await fetch('http://localhost:5000/api/query-papers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          papers: papers.map(p => ({
            title: p.title,
            abstract: p.abstract,
            authors: p.authors,
            published_date: p.publishedDate
          })),
          max_results: 10
        })
      })

      if (response.ok) {
        const data = await response.json()
        return res.json(data)
      } else {
        throw new Error('Backend search failed')
      }
    } else if (action === 'citation') {
      // Generate citation for a paper
      const paper = req.body.paper
      if (!paper) {
        return res.status(400).json({ error: 'Paper is required for citation' })
      }

      const response = await fetch('http://localhost:5000/api/generate-citation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paper: {
            title: paper.title,
            abstract: paper.abstract,
            authors: paper.authors,
            published_date: paper.publishedDate
          },
          style
        })
      })

      if (response.ok) {
        const data = await response.json()
        return res.json(data)
      } else {
        throw new Error('Backend citation failed')
      }
    }

  } catch (error) {
    console.error('Query API error:', error)

    // Fallback search if backend is unavailable
    if (action === 'search') {
      const queryLower = query.toLowerCase()
      const results = papers
        .map((paper, index) => {
          let score = 0
          if (paper.title.toLowerCase().includes(queryLower)) score += 3
          if (paper.abstract.toLowerCase().includes(queryLower)) score += 2
          if (paper.authors && paper.authors.toLowerCase().includes(queryLower)) score += 1

          return score > 0 ? {
            paper,
            score,
            index,
            matched_concepts: []
          } : null
        })
        .filter(result => result !== null)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)

      return res.json({
        query,
        results,
        total_found: results.length,
        searched_papers: papers.length,
        fallback: true
      })
    } else if (action === 'citation') {
      // Fallback citation generation
      const paper = req.body.paper
      const authors = paper.authors || 'Unknown Author'
      const year = paper.publishedDate ? new Date(paper.publishedDate).getFullYear() : 'n.d.'

      let citation = ''
      if (style === 'apa') {
        citation = `${authors} (${year}). ${paper.title}. arXiv preprint.`
      } else if (style === 'mla') {
        citation = `${authors.split(',')[0]}. "${paper.title}." arXiv preprint, ${year}.`
      } else if (style === 'bibtex') {
        const key = `${authors.split(',')[0].replace(' ', '').toLowerCase()}${year}`
        citation = `@article{${key},
    title={${paper.title}},
    author={${authors}},
    year={${year}},
    journal={arXiv preprint}
}`
      }

      return res.json({
        citation,
        style,
        paper_title: paper.title,
        fallback: true
      })
    }

    res.status(500).json({ error: 'Query failed', details: error.message })
  }
}