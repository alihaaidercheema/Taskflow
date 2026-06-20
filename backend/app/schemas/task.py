from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.task import TaskPriority, TaskStatus

class TaskBase(BaseModel):
    title: str = Field(..., max_length=255)
    description: Optional[str] = None
    priority: Optional[TaskPriority] = TaskPriority.medium
    status: Optional[TaskStatus] = TaskStatus.todo

class TaskCreate(TaskBase):
    board_id: int

class TaskUpdate(TaskBase):
    title: Optional[str] = Field(None, max_length=255)

class TaskInDBBase(TaskBase):
    id: int
    board_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class Task(TaskInDBBase):
    pass
