export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { q: query } = req.query

  if (!query) {
    return res.status(400).json({ error: 'Query parameter required' })
  }

  try {
    // Basic ArXiv API search
    const arxivUrl = `http://export.arxiv.org/api/query?search_query=${encodeURIComponent(query)}&start=0&max_results=10`
    
    const response = await fetch(arxivUrl)
    const xmlData = await response.text()
    
    // Simple XML parsing to extract papers
    const papers = parseArxivXML(xmlData)
    
    res.json({ 
      query,
      count: papers.length,
      papers 
    })
  } catch (error) {
    console.error('Search error:', error)
    res.status(500).json({ error: 'Search failed' })
  }
}

function parseArxivXML(xmlData) {
  const papers = []
  
  // Split by entry tags
  const entries = xmlData.split('<entry>').slice(1)
  
  entries.forEach(entry => {
    try {
      const title = extractValue(entry, 'title')
      const summary = extractValue(entry, 'summary')
      const authors = extractAuthors(entry)
      const published = extractValue(entry, 'published')
      
      if (title && summary) {
        papers.push({
          title: title.replace(/\s+/g, ' ').trim(),
          abstract: summary.replace(/\s+/g, ' ').trim(),
          authors: authors,
          publishedDate: published,
          source: 'arxiv'
        })
      }
    } catch (error) {
      console.error('Error parsing entry:', error)
    }
  })
  
  return papers
}

function extractValue(xml, tag) {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i')
  const match = xml.match(regex)
  return match ? match[1].trim() : ''
}

function extractAuthors(entry) {
  const authorMatches = entry.match(/<author>[\s\S]*?<\/author>/g) || []
  const authors = []
  
  authorMatches.forEach(authorXml => {
    const name = extractValue(authorXml, 'name')
    if (name) {
      authors.push(name.trim())
    }
  })
  
  return authors.join(', ')
}