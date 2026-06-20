from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.api import deps
from app.models.task import Task, TaskPriority, TaskStatus
from app.models.board import Board
from app.models.project import Project
from app.models.user import User
from app.schemas.task import Task as TaskSchema
from app.schemas.task import TaskCreate, TaskUpdate

router = APIRouter()

@router.get("/", response_model=List[TaskSchema])
def read_tasks(
    db: Session = Depends(deps.get_db),
    limit: int = Query(100, ge=1, le=100),
    offset: int = Query(0, ge=0),
    status: Optional[TaskStatus] = None,
    priority: Optional[TaskPriority] = None,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve tasks.
    """
    query = (
        db.query(Task)
        .join(Board, Task.board_id == Board.id)
        .join(Project, Board.project_id == Project.id)
        .filter(Project.owner_id == current_user.id)
    )
    
    if status:
        query = query.filter(Task.status == status)
    if priority:
        query = query.filter(Task.priority == priority)
        
    tasks = query.offset(offset).limit(limit).all()
    return tasks

@router.post("/", response_model=TaskSchema, status_code=status.HTTP_201_CREATED)
def create_task(
    *,
    db: Session = Depends(deps.get_db),
    task_in: TaskCreate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Create new task.
    """
    board = (
        db.query(Board)
        .join(Project, Board.project_id == Project.id)
        .filter(Board.id == task_in.board_id, Project.owner_id == current_user.id)
        .first()
    )
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
        
    task = Task(
        title=task_in.title,
        description=task_in.description,
        priority=task_in.priority,
        status=task_in.status,
        board_id=task_in.board_id,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

@router.get("/{id}", response_model=TaskSchema)
def read_task(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get task by ID.
    """
    task = (
        db.query(Task)
        .join(Board, Task.board_id == Board.id)
        .join(Project, Board.project_id == Project.id)
        .filter(Task.id == id, Project.owner_id == current_user.id)
        .first()
    )
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.put("/{id}", response_model=TaskSchema)
def update_task(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    task_in: TaskUpdate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Update a task.
    """
    task = (
        db.query(Task)
        .join(Board, Task.board_id == Board.id)
        .join(Project, Board.project_id == Project.id)
        .filter(Task.id == id, Project.owner_id == current_user.id)
        .first()
    )
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    update_data = task_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)
        
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

@router.delete("/{id}", response_model=TaskSchema)
def delete_task(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Delete a task.
    """
    task = (
        db.query(Task)
        .join(Board, Task.board_id == Board.id)
        .join(Project, Board.project_id == Project.id)
        .filter(Task.id == id, Project.owner_id == current_user.id)
        .first()
    )
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db.delete(task)
    db.commit()
    return task
