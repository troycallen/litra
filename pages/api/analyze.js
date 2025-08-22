// API route to communicate with Python backend
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { action, ...data } = req.body
    
    // Python backend URL
    const PYTHON_BACKEND = process.env.PYTHON_BACKEND_URL || 'http://localhost:5000'
    
    let endpoint
    switch (action) {
      case 'analyze-paper':
        endpoint = '/api/analyze-paper'
        break
      case 'extract-concepts':
        endpoint = '/api/extract-concepts'
        break
      case 'generate-summary':
        endpoint = '/api/generate-summary'
        break
      case 'find-related':
        endpoint = '/api/find-related'
        break
      default:
        return res.status(400).json({ error: 'Invalid action' })
    }
    
    const response = await fetch(`${PYTHON_BACKEND}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      throw new Error(`Python backend responded with status: ${response.status}`)
    }
    
    const result = await response.json()
    res.json(result)
    
  } catch (error) {
    console.error('Python backend error:', error)
    
    // Fallback responses when Python backend is not available
    const { action } = req.body
    
    if (action === 'extract-concepts') {
      return res.json({
        concepts: ['artificial intelligence', 'machine learning', 'data analysis', 'research', 'methodology'],
        text_length: req.body.text?.length || 0,
        extracted_at: new Date().toISOString(),
        fallback: true
      })
    }
    
    if (action === 'generate-summary') {
      return res.json({
        summary: 'This paper presents innovative research methodologies and significant findings in the specified domain.',
        methodology: 'The research employs quantitative and qualitative analysis techniques.',
        findings: 'Key contributions include novel approaches and empirical validation.',
        significance: 'This work advances the state of knowledge in the field.',
        fallback: true
      })
    }
    
    if (action === 'find-related') {
      return res.json({
        related_papers: [
          {
            title: 'Related Research in Similar Domain',
            authors: ['Research Team'],
            summary: 'This paper explores complementary methodologies and approaches...',
            link: '#',
            relevance_score: 0.8
          }
        ],
        search_concepts: req.body.concepts || [],
        total_found: 1,
        fallback: true
      })
    }
    
    return res.status(500).json({ 
      error: 'Python backend unavailable. Install and run: cd python_backend && python app.py',
      fallback_used: true
    })
  }
}