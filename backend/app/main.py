from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.config import settings
from app.database import engine, Base, get_db
from app.models.user import User as UserModel
from app.models.project import Project as ProjectModel
from app.models.chat_message import ChatMessage
from app.schemas.project import ProjectCreate, ProjectOnboarding, ProjectResponse
from app.schemas.auth import UserRegister, UserLogin, UserResponse, TokenResponse
from app.services.auth_service import (
    hash_password, verify_password, create_access_token, get_current_user
)
from app.services.ai_service import ai_service
from app.agents.orchestrator import orchestrator
from pydantic import BaseModel

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="MindAll Consulting - AI Entrepreneur Copilot Backend"
)

# CORS reads from .env instead of allowing everything 
allowed_origins = [o.strip() for o in settings.ALLOWED_ORIGINS.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Schemas 

class AIAnalysisResponse(BaseModel):
    analysis: str

class ChatRequest(BaseModel):
    query: str

class ChatResponse(BaseModel):
    agent_used: str
    response: str

class MessageResponse(BaseModel):
    id: int
    role: str
    content: str
    agent_type: Optional[str] = None
    created_at: str

    class Config:
        from_attributes = True


# System 

@app.get("/health", tags=["System"])
async def health_check():
    return {"status": "online", "project": settings.PROJECT_NAME}


# Auth 

@app.post("/auth/register", response_model=TokenResponse, tags=["Auth"])
def register(data: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(UserModel).filter(UserModel.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = UserModel(
        name=data.name,
        email=data.email,
        hashed_password=hash_password(data.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(user.id)
    return TokenResponse(
        access_token=token,
        user=UserResponse(id=user.id, name=user.name, email=user.email)
    )


@app.post("/auth/login", response_model=TokenResponse, tags=["Auth"])
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(UserModel).filter(UserModel.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user.id)
    return TokenResponse(
        access_token=token,
        user=UserResponse(id=user.id, name=user.name, email=user.email)
    )


@app.get("/auth/me", response_model=UserResponse, tags=["Auth"])
def get_me(current_user: UserModel = Depends(get_current_user)):
    return current_user


# Projects 

@app.post("/projects", response_model=ProjectResponse, tags=["Projects"])
def create_project(
    project: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    db_project = ProjectModel(
        user_id=current_user.id,
        title=project.title,
        industry=project.industry,
        description=project.description
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project


@app.patch("/projects/{project_id}/onboarding", response_model=ProjectResponse, tags=["Projects"])
def update_project_onboarding(
    project_id: int,
    data: ProjectOnboarding,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    project = db.query(ProjectModel).filter(
        ProjectModel.id == project_id,
        ProjectModel.user_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(project, field, value)
    db.commit()
    db.refresh(project)
    return project


@app.get("/projects", response_model=List[ProjectResponse], tags=["Projects"])
def list_projects(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    return db.query(ProjectModel).filter(ProjectModel.user_id == current_user.id).all()


@app.get("/projects/{project_id}", response_model=ProjectResponse, tags=["Projects"])
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    project = db.query(ProjectModel).filter(
        ProjectModel.id == project_id,
        ProjectModel.user_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


# AI Copilot 

@app.post("/projects/{project_id}/analyze", response_model=AIAnalysisResponse, tags=["AI Copilot"])
def generate_project_analysis(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    project = db.query(ProjectModel).filter(
        ProjectModel.id == project_id,
        ProjectModel.user_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    analysis_text = ai_service.analyze_project(
        title=project.title,
        industry=project.industry,
        description=project.description
    )
    project.ai_analysis = analysis_text
    db.commit()
    return {"analysis": analysis_text}


@app.post("/projects/{project_id}/chat", response_model=ChatResponse, tags=["AI Copilot"])
def chat_with_copilot(
    project_id: int,
    body: ChatRequest,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    project = db.query(ProjectModel).filter(
        ProjectModel.id == project_id,
        ProjectModel.user_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    result = orchestrator.process(query=body.query, project=project)

    db.add(ChatMessage(project_id=project_id, role="user", content=body.query))
    db.add(ChatMessage(
        project_id=project_id,
        role="assistant",
        content=result["response"],
        agent_type=result["agent_used"]
    ))
    db.commit()

    return ChatResponse(agent_used=result["agent_used"], response=result["response"])


@app.get("/projects/{project_id}/messages", response_model=List[MessageResponse], tags=["AI Copilot"])
def get_chat_history(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    project = db.query(ProjectModel).filter(
        ProjectModel.id == project_id,
        ProjectModel.user_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    messages = db.query(ChatMessage).filter(
        ChatMessage.project_id == project_id
    ).order_by(ChatMessage.created_at).all()

    return [MessageResponse(
        id=m.id,
        role=m.role,
        content=m.content,
        agent_type=m.agent_type,
        created_at=m.created_at.isoformat()
    ) for m in messages]


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=False)