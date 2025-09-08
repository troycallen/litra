# LiTRA - AI Literature Review Assistant

A terminal-style web application for building and analyzing research paper collections with AI-powered insights.

## Features

- **Paper Search**: Search ArXiv for research papers
- **AI Analysis**: Extract concepts, generate summaries, and find related papers
- **Paper Library**: Build a curated collection of papers with evolving overviews
- **Meta-Analysis**: Get AI-powered insights across your entire paper collection

## Quick Start

1. **Frontend**: `npm run dev` (runs on http://localhost:3000)
2. **Backend**: `cd backend && pip install -r requirements.txt && python main.py` (runs on http://localhost:5000)

## Usage

1. Search for papers using the main interface
2. Add interesting papers to your library
3. Use AI analysis tools to extract concepts and find related work
4. Build up an evolving overview of your research domain

## Architecture

- **Frontend**: Next.js with terminal-style UI
- **Backend**: FastAPI with OpenAI integration and NLTK text processing
- **Storage**: Local browser storage for paper collections
- **AI**: GPT-3.5-turbo for intelligent paper analysis and meta-summaries

## API Documentation

When the FastAPI backend is running, visit http://localhost:5000/docs for interactive API documentation.