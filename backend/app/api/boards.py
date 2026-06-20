from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.models.board import Board
from app.models.project import Project
from app.models.user import User
from app.schemas.board import Board as BoardSchema
from app.schemas.board import BoardCreate, BoardUpdate

router = APIRouter()

@router.get("/", response_model=List[BoardSchema])
def read_boards(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve a list of boards.
    Only returns boards for projects owned by the currently authenticated user.
    """
    boards = (
        db.query(Board)
        .join(Project, Board.project_id == Project.id)
        .filter(Project.owner_id == current_user.id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return boards

@router.post("/", response_model=BoardSchema, status_code=status.HTTP_201_CREATED)
def create_board(
    *,
    db: Session = Depends(deps.get_db),
    board_in: BoardCreate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Create a new board in a project.
    Validates that the target project belongs to the current user.
    """
    project = db.query(Project).filter(Project.id == board_in.project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    if project.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
        
    board = Board(
        name=board_in.name,
        project_id=board_in.project_id,
    )
    db.add(board)
    db.commit()
    db.refresh(board)
    return board

@router.get("/{id}", response_model=BoardSchema)
def read_board(
    board: Board = Depends(deps.get_board),
) -> Any:
    """
    Get a specific board by its ID.
    Returns 404 if not found, and 403 if it belongs to a project not owned by the user.
    """
    return board

@router.put("/{id}", response_model=BoardSchema)
def update_board(
    *,
    db: Session = Depends(deps.get_db),
    board_in: BoardUpdate,
    board: Board = Depends(deps.get_board),
) -> Any:
    """
    Update a board's details by ID.
    Only provided fields will be updated.
    """
    update_data = board_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(board, field, value)
        
    db.add(board)
    db.commit()
    db.refresh(board)
    return board

@router.delete("/{id}", response_model=BoardSchema)
def delete_board(
    *,
    db: Session = Depends(deps.get_db),
    board: Board = Depends(deps.get_board),
) -> Any:
    """
    Delete a board by ID.
    This will also cascade delete all associated tasks.
    """
    db.delete(board)
    db.commit()
    return board
