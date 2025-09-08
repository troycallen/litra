#!/usr/bin/env python3
"""
LiTRA FastAPI Backend Startup Script
"""
import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

if __name__ == "__main__":
    # Check if OpenAI API key is set
    if not os.getenv('OPENAI_API_KEY'):
        print("⚠️  Warning: OPENAI_API_KEY not found in environment variables")
        print("   The backend will work with fallback responses")
        print("   To enable AI features, set your OpenAI API key:")
        print("   export OPENAI_API_KEY='your-api-key-here'")
        print()
    
    print("🚀 Starting LiTRA FastAPI Backend...")
    print("📚 API Documentation: http://localhost:5000/docs")
    print("🔍 Health Check: http://localhost:5000/api/health")
    print()
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=5000,
        reload=True,
        log_level="info"
    )
