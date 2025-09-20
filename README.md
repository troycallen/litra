# LiTRA - Literature Review Assistant

AI-powered research assistant for literature review with local LLM processing.

## Features

- 🔍 ArXiv paper search
- 🤖 Local AI analysis with Ollama (Llama 3.1)
- 📚 Personal research library
- 🔗 Related paper discovery
- 📝 Citation generation (APA, MLA, BibTeX)
- 📊 Meta-analysis across papers

## Deployment

### Railway (Backend)

1. Create new Railway project from GitHub repo
2. Set environment variables in Railway dashboard:
   ```
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_MODEL=llama3.1:8b
   ```
3. Deploy - Railway will auto-install Ollama and download the model

### Vercel (Frontend)

1. Import project to Vercel from GitHub
2. Set environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   ```
3. Deploy

## Local Development

1. Install dependencies:
   ```bash
   npm install
   pip install -r requirements.txt
   ```

2. Install and start Ollama:
   ```bash
   # Install Ollama
   curl -fsSL https://ollama.com/install.sh | sh

   # Download model
   ollama pull llama3.1:8b

   # Start Ollama
   ollama serve
   ```

3. Start backend:
   ```bash
   cd backend
   uvicorn main:app --reload --port 5000
   ```

4. Start frontend:
   ```bash
   npm run dev
   ```

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: FastAPI, Python
- **LLM**: Ollama (Llama 3.1 8B)
- **Deployment**: Vercel + Railway