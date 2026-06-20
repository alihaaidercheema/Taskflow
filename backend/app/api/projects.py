from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.models.project import Project
from app.models.user import User
from app.schemas.project import Project as ProjectSchema
from app.schemas.project import ProjectCreate, ProjectUpdate

router = APIRouter()

@router.get("/", response_model=List[ProjectSchema])
def read_projects(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve a list of projects owned by the currently authenticated user.
    Supports pagination via `skip` and `limit`.
    """
    projects = db.query(Project).filter(Project.owner_id == current_user.id).offset(skip).limit(limit).all()
    return projects

@router.post("/", response_model=ProjectSchema, status_code=status.HTTP_201_CREATED)
def create_project(
    *,
    db: Session = Depends(deps.get_db),
    project_in: ProjectCreate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Create a new project.
    The created project will be automatically assigned to the current user.
    """
    project = Project(
        name=project_in.name,
        description=project_in.description,
        owner_id=current_user.id,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

@router.get("/{id}", response_model=ProjectSchema)
def read_project(
    project: Project = Depends(deps.get_project),
) -> Any:
    """
    Get a specific project by its ID.
    Returns 404 if not found, and 403 if it does not belong to the user.
    """
    return project

@router.put("/{id}", response_model=ProjectSchema)
def update_project(
    *,
    db: Session = Depends(deps.get_db),
    project_in: ProjectUpdate,
    project: Project = Depends(deps.get_project),
) -> Any:
    """
    Update a project's details by ID.
    Only provided fields will be updated.
    """
    update_data = project_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)
        
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

@router.delete("/{id}", response_model=ProjectSchema)
def delete_project(
    *,
    db: Session = Depends(deps.get_db),
    project: Project = Depends(deps.get_project),
) -> Any:
    """
    Delete a project by ID.
    This will also cascade delete all associated boards and tasks.
    """
    db.delete(project)
    db.commit()
    return project
