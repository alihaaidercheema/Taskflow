from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

class BoardBase(BaseModel):
    name: str = Field(..., max_length=255)

class BoardCreate(BoardBase):
    project_id: int

class BoardUpdate(BoardBase):
    pass

class BoardInDBBase(BoardBase):
    id: int
    project_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class Board(BoardInDBBase):
    pass
