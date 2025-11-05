# SkillFlow AI - Basic Chatbot

A basic end-to-end AI chatbot project demonstrating how to build a production-ready AI application with Next.js and Python FastAPI. This project serves as a learning template for implementing AI features by customizing prompts and adding content.

## Project Purpose

This repository is part of a larger learning series focused on building AI applications. It demonstrates:

- **End-to-end AI implementation** with Next.js frontend and Python FastAPI backend
- **Streaming AI responses** using the Vercel AI SDK Data Stream Protocol
- **Production deployment** on Vercel with serverless Python functions
- **Customizable AI behavior** through prompt engineering and content management

**Parent Repository:** This project is based on the [Vercel AI SDK Python Streaming template](https://github.com/vercel-labs/ai-sdk-preview-python-streaming)

## Key Features

- ✅ Real-time streaming AI chat interface
- ✅ Python FastAPI backend for AI processing
- ✅ Next.js 13+ with App Router
- ✅ Vercel AI SDK 5.0 integration
- ✅ Production-ready deployment configuration
- ✅ Customizable system prompts and AI personality

## How to Customize

The main customization points are:

1. **System Prompt** (`api/index.py`): Modify the AI's personality and behavior
2. **UI Components** (`app/page.tsx`): Customize the chat interface
3. **Styling** (`app/globals.css`): Adjust the visual design
4. **AI Model** (`api/index.py`): Switch between different AI providers (OpenAI, Anthropic, etc.)

## Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd project_1_skillflow_basic_chatbot
   ```

2. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Add your AI provider API keys (e.g., OpenAI, Anthropic)

3. **Install dependencies**
   ```bash
   pnpm install
   ```

4. **Set up Python environment**
   ```bash
   virtualenv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

5. **Run the development server**
   ```bash
   pnpm dev
   ```

   This will start:
   - Next.js frontend on `http://localhost:3000`
   - FastAPI backend on `http://localhost:8000`

## Deployment

This project is configured for deployment on Vercel:

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

**Important:** The project uses `Connection: close` header for proper streaming on Vercel's serverless infrastructure.

## Tech Stack

- **Frontend:** Next.js 13, React, TypeScript, Tailwind CSS
- **Backend:** Python, FastAPI, Uvicorn
- **AI SDK:** Vercel AI SDK 5.0
- **Deployment:** Vercel (Serverless Functions)
- **AI Providers:** OpenAI, Anthropic (configurable)

## Learn More

- [AI SDK Documentation](https://sdk.vercel.ai/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [Parent Template Repository](https://github.com/vercel-labs/ai-sdk-preview-python-streaming)

## License

MIT
