"""
Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from src.models import TaskStatus, TaskPriority


class TaskBase(BaseModel):
    """Базовая схема задачи"""
    title: str = Field(..., min_length=1, max_length=200)
    category: Optional[str] = Field(None, max_length=100)
    priority: TaskPriority = TaskPriority.MEDIUM
    status: TaskStatus = TaskStatus.TODO


class TaskCreate(TaskBase):
    """Схема для создания задачи"""
    parent_id: Optional[int] = None


class TaskUpdate(BaseModel):
    """Схема для обновления задачи"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    category: Optional[str] = Field(None, max_length=100)
    priority: Optional[TaskPriority] = None
    status: Optional[TaskStatus] = None
    is_completed: Optional[bool] = None
    parent_id: Optional[int] = None


class TaskResponse(TaskBase):
    """Схема ответа с задачей"""
    id: int
    is_completed: bool
    parent_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    subtasks: List['TaskResponse'] = []

    class Config:
        from_attributes = True
        use_enum_values = True


# Обновляем forward reference
TaskResponse.model_rebuild()


class TaskListResponse(BaseModel):
    """Схема ответа со списком задач"""
    tasks: List[TaskResponse]
    total: int

