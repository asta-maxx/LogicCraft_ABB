LogicCraft - ABB Code Assistant
Overview

ABB Code Assistant is a full-stack, production-grade platform for conversational code generation and validation, powered by advanced Large Language Models (LLMs).
It enables users to interact naturally with an AI to generate, refine, and validate code, with session-based memory for multi-turn conversations.
Architecture
1. Backend (backend/)

    Framework: Django REST Framework

    Features:

        Session-based conversational memory (multi-turn, context-aware code generation)

        Code validation and generation

        PostgreSQL for persistent storage

        Caching for repeated prompts

    Key Modules:

        core/models.py → Defines session & history models

        core/views.py → API endpoints for code generation, validation, and retrieval

        core/rag_service.py → Handles RAG-based code generation with LLMs

        backend/settings.py → Configures DB and environment variables

2. Frontend (frontend/)

    Framework: Next.js + React + Tailwind CSS

    Features:

        Natural language input for prompts

        Display generated code and validation results

        Session management for multi-turn conversations

        Responsive, modern UI

Unique Features

    Session-Based Memory: Multi-turn code refinement with context retention.

    Pluggable LLM Backend: Swap models (Phi-2, LLaMA, etc.) without frontend/backend rewrite.

    Full-Stack Integration: Seamless communication between frontend, backend, and LLM service.

    Production Ready: PostgreSQL, caching, and extensible API design.

Installation & Setup
Backend (Django)

# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate   # Linux/Mac
venv\Scripts\activate      # Windows

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations core
python manage.py migrate

# Start server
python manage.py runserver

The backend runs at: http://127.0.0.1:8000/
Frontend (Next.js + React)

# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

The frontend runs at: http://localhost:3000/
How to Use

    Start both backend and frontend servers.

    Open the frontend in your browser.

    Enter prompts into the input box.

    Backend generates responses via the LLM service.

    Validate, refine, and iterate with session-based memory.

Extending the Project

    Add authentication and user accounts

    Plug in more LLMs (CodeLlama, GPT, etc.)

    Improve frontend with features like code diffs and history navigation

    Add analytics and monitoring

Project Structure

LogicCraft/
│── backend/               # Django backend
│   ├── core/              # Core app with models, views, rag_service
│   ├── manage.py
│   └── requirements.txt
│
│── frontend/              # Next.js frontend
│   ├── pages/
│   ├── components/
│   └── package.json
│
└── README.md
