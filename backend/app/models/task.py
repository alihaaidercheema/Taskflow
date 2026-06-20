import enum
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import String, ForeignKey, DateTime, func, Text, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base

if TYPE_CHECKING:
    from app.models.board import Board

class TaskPriority(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"

class TaskStatus(str, enum.Enum):
    todo = "todo"
    in_progress = "in_progress"
    completed = "completed"

class Task(Base):
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    priority: Mapped[TaskPriority] = mapped_column(Enum(TaskPriority), default=TaskPriority.medium, nullable=False)
    status: Mapped[TaskStatus] = mapped_column(Enum(TaskStatus), default=TaskStatus.todo, nullable=False)
    board_id: Mapped[int] = mapped_column(ForeignKey("board.id", ondelete="CASCADE"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    board: Mapped["Board"] = relationship("Board", back_populates="tasks")
