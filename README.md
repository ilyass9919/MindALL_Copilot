# MindAll Copilot

> **Your AI advisor for every business decision.**  
> A multi-agent AI system that gives entrepreneurs access to expert-level advice in Marketing, Finance, and Strategy - personalized, real-time, and available 24/7.

---

## Features

-  **3 Specialized AI Agents** : Marketing, Finance, and Strategy, each with domain-specific expertise
-  **Automatic Routing** : An AI orchestrator reads your question and selects the right agent instantly
-  **Multilingual** : Responds in the user's language automatically (French, English, Arabic...)
-  **Live Web Data** : Every response is grounded with real-time market data via Tavily Search
-  **Persistent Memory** : Conversation history stored as vector embeddings in Pinecone
-  **Secure Auth** : JWT authentication with bcrypt password hashing
-  **Multi-project** : Each user can manage multiple independent projects

---

## Architecture

```
User
 │
 ▼
React Frontend (Vercel)
 │  HTTPS
 ▼
FastAPI Backend (Render)
 ├── Auth (JWT)
 ├── Orchestrator ──► Marketing Agent
 │                ──► Finance Agent
 │                ──► Strategy Agent
 ├── Tavily Search API  (live web data)
 ├── Pinecone           (vector memory)
 └── PostgreSQL         (users, projects, messages)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite |
| Backend | FastAPI, Python 3.11 |
| LLM | GPT-4o-mini via Azure AI Inference |
| Orchestration | LangChain |
| Vector Memory | Pinecone (text-embedding-3-small) |
| Web Search | Tavily Search API |
| Database | SQLite (local) / PostgreSQL (production) |
| Auth | JWT, bcrypt |
| Deployment | Vercel (frontend) + Render (backend) |

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- API keys: OpenAI (Azure), Tavily, Pinecone

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp backend.env.example .env   # fill in your API keys
uvicorn app.main:app --reload
```

### Frontend

```bash
cd mindall-frontend
npm install

cp frontend.env.example .env.local   # set VITE_API_URL=http://127.0.0.1:8000
npm run dev
```

App runs at `http://localhost:5173`

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `OPENAI_API_KEY` | Azure AI Inference API key |
| `OPENAI_BASE_URL` | Azure endpoint URL |
| `TAVILY_API_KEY` | Tavily Search API key |
| `PINECONE_API_KEY` | Pinecone API key |
| `DATABASE_URL` | `sqlite:///./data/mindall.db` (local) |
| `JWT_SECRET` | Random secret string for signing tokens |
| `ALLOWED_ORIGINS` | Frontend URL (e.g. `http://localhost:5173`) |

### Frontend (`mindall-frontend/.env.local`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend URL (e.g. `http://127.0.0.1:8000`) |

---

## Project Structure

```
MindAll_Copilot/
├── backend/
│   ├── app/
│   │   ├── agents/          # Marketing, Finance, Strategy agents + orchestrator
│   │   ├── core/            # Config (pydantic-settings)
│   │   ├── memory/          # Pinecone vector store
│   │   ├── models/          # SQLAlchemy models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── services/        # Auth + AI services
│   │   ├── tools/           # Tavily search tool
│   │   ├── database.py      # SQLite / PostgreSQL auto-detection
│   │   └── main.py          # FastAPI app + all routes
│   ├── requirements.txt
│   └── .env                 # (not committed)
│
└── mindall-frontend/
    ├── src/
    │   ├── pages/           # Landing, Auth, Dashboard, Onboarding, Chat
    │   ├── components/      # AgentBadge
    │   ├── lib/             # API client, markdown renderer
    │   └── styles/
    └── .env.local           # (not committed)
```

---

## Security

- Passwords hashed with **bcrypt** — never stored in plain text
- **JWT tokens** with 48h expiration
- All data isolated by `user_id` — users can only access their own projects
- API keys stored exclusively in **environment variables** — never in source code
- **CORS** restricted to declared frontend origins
- Input validation on all endpoints via **Pydantic**

---

## Deployment

| Service | Platform | Notes |
|---|---|---|
| Frontend | Vercel | Auto-deploy from GitHub |
| Backend | Render | Free tier - 30s cold start |
| Database | Render PostgreSQL | Free tier - 1GB |
| Memory | Pinecone Serverless | Free tier - 100k vectors |

Set `DATABASE_URL` on Render to the **Internal** PostgreSQL URL.  
Set `ALLOWED_ORIGINS` on Render to your exact Vercel URL (no trailing slash).

---
