"""
Database models
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from src.database import Base


class TaskStatus(str, enum.Enum):
    """Статусы задач"""
    TODO = "к выполнению"
    IN_PROGRESS = "в работе"
    COMPLETED = "завершено"


class TaskPriority(str, enum.Enum):
    """Приоритеты задач"""
    LOW = "низкий"
    MEDIUM = "средний"
    HIGH = "высокий"


class Task(Base):
    """Модель задачи"""
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    category = Column(String, nullable=True)
    priority = Column(SQLEnum(TaskPriority), default=TaskPriority.MEDIUM)
    status = Column(SQLEnum(TaskStatus), default=TaskStatus.TODO)
    is_completed = Column(Boolean, default=False)
    parent_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Связь для подзадач
    parent = relationship("Task", remote_side=[id], backref="subtasks")

    def __repr__(self):
        return f"<Task(id={self.id}, title='{self.title}', status='{self.status}')>"

