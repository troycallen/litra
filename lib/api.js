// API configuration for different environments
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export const apiCall = async (endpoint, options = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('API call error:', error)
    throw error
  }
}

// Specific API functions
export const analyzeAPI = {
  generateSummary: (data) => apiCall('/api/generate-summary', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  extractConcepts: (data) => apiCall('/api/extract-concepts', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  findRelated: (data) => apiCall('/api/find-related', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  analyzePaper: (data) => apiCall('/api/analyze-paper', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  generateMetaSummary: (data) => apiCall('/api/meta-summary', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

export const queryAPI = {
  searchPapers: (data) => apiCall('/api/query-papers', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  generateCitation: (data) => apiCall('/api/generate-citation', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}