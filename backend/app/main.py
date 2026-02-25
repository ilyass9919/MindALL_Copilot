from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from app.core.config import settings
from app.database import engine, Base, get_db
from app.models.project import Project as ProjectModel
from app.schemas.project import ProjectCreate, ProjectResponse
from app.services.ai_service import ai_service
from app.agents.orchestrator import orchestrator
from pydantic import BaseModel

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="MindAll Consulting - AI Entrepreneur Copilot Backend"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Schemas ────────────────────────────────────────────────────────────────

class AIAnalysisResponse(BaseModel):
    analysis: str

class ChatRequest(BaseModel):
    query: str

class ChatResponse(BaseModel):
    agent_used: str   # "marketing" | "finance" | "strategy"
    response: str


# ─── System ─────────────────────────────────────────────────────────────────

@app.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "online",
        "project": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT
    }


# ─── Projects ────────────────────────────────────────────────────────────────

@app.post("/projects", response_model=ProjectResponse, tags=["Projects"])
def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
    """Creates a new entrepreneurial project."""
    db_project = ProjectModel(
        title=project.title,
        industry=project.industry,
        description=project.description
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@app.get("/projects", response_model=List[ProjectResponse], tags=["Projects"])
def list_projects(db: Session = Depends(get_db)):
    """Returns all projects."""
    return db.query(ProjectModel).all()

@app.get("/projects/{project_id}", response_model=ProjectResponse, tags=["Projects"])
def get_project(project_id: int, db: Session = Depends(get_db)):
    """Retrieves a specific project by ID."""
    project = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


# ─── AI Copilot ──────────────────────────────────────────────────────────────

@app.post("/projects/{project_id}/analyze", response_model=AIAnalysisResponse, tags=["AI Copilot"])
def generate_project_analysis(project_id: int, db: Session = Depends(get_db)):
    """
    Legacy endpoint: full SWOT analysis of a project. Saves result to DB.
    """
    project = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    analysis_text = ai_service.analyze_project(
        title=project.title,
        industry=project.industry,
        description=project.description
    )

    project.ai_analysis = analysis_text
    db.commit()
    db.refresh(project)

    return {"analysis": analysis_text}


@app.post("/projects/{project_id}/chat", response_model=ChatResponse, tags=["AI Copilot"])
def chat_with_copilot(
    project_id: int,
    body: ChatRequest,
    db: Session = Depends(get_db)
):
    """
    🧠 Main multi-agent chat endpoint.

    The Orchestrator:
    1. Classifies the query (marketing / finance / strategy)
    2. Retrieves relevant past context from Pinecone memory
    3. Delegates to the right specialized agent
    4. Saves the interaction for future sessions
    5. Returns the agent's response + which agent was used
    """
    project = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    result = orchestrator.process(query=body.query, project=project)

    return ChatResponse(
        agent_used=result["agent_used"],
        response=result["response"]
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)











