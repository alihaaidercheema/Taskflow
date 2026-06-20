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
    Retrieve boards.
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
    Create new board.
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
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get board by ID.
    """
    board = db.query(Board).filter(Board.id == id).first()
    if not board:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Board not found")
    if board.project.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
    return board

@router.put("/{id}", response_model=BoardSchema)
def update_board(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    board_in: BoardUpdate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Update a board.
    """
    board = db.query(Board).filter(Board.id == id).first()
    if not board:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Board not found")
    if board.project.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
    
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
    id: int,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Delete a board.
    """
    board = db.query(Board).filter(Board.id == id).first()
    if not board:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Board not found")
    if board.project.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
    
    db.delete(board)
    db.commit()
    return board
