// Mock API for concept generation - in real implementation, this would call OpenAI or similar
export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { nodeTitle, nodeType, context } = req.body

  // Simulate AI processing delay
  setTimeout(() => {
    let concepts = []
    
    switch (nodeType) {
      case 'question':
        concepts = [
          'Neural Networks',
          'Diagnostic Accuracy', 
          'Patient Privacy',
          'Predictive Modeling',
          'Clinical Decision Support'
        ]
        break
      case 'paper':
        concepts = [
          'Deep Learning',
          'Medical Imaging',
          'Feature Extraction',
          'Model Validation',
          'Ethical Considerations'
        ]
        break
      case 'concept':
        concepts = [
          'Algorithm Optimization',
          'Data Preprocessing',
          'Performance Metrics',
          'Real-world Applications'
        ]
        break
      default:
        concepts = ['Related Concept 1', 'Related Concept 2']
    }

    // Add some context-aware variations
    if (nodeTitle.toLowerCase().includes('machine learning')) {
      concepts.push('Training Data', 'Overfitting', 'Cross-validation')
    }
    if (nodeTitle.toLowerCase().includes('healthcare')) {
      concepts.push('Clinical Trials', 'Patient Outcomes', 'FDA Approval')
    }

    res.status(200).json({
      concepts: concepts.slice(0, 5), // Limit to 5 concepts
      summary: `Generated ${concepts.length} related concepts for "${nodeTitle}". These concepts represent key themes and methodologies commonly associated with this ${nodeType}.`,
      followUpQuestions: [
        `How does ${nodeTitle} impact clinical practice?`,
        `What are the limitations of current approaches in ${nodeTitle}?`,
        `What future research directions exist for ${nodeTitle}?`
      ]
    })
  }, 800) // Simulate processing time
}