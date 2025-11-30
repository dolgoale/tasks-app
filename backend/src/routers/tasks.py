"""
API endpoints для управления задачами
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from src.database import get_db
from src.models import Task, TaskStatus, TaskPriority
from src.schemas import TaskCreate, TaskUpdate, TaskResponse, TaskListResponse

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


def build_task_tree(tasks: List[Task], parent_id: Optional[int] = None, parent_category: Optional[str] = None) -> List[TaskResponse]:
    """Рекурсивно строит дерево задач"""
    result = []
    for task in tasks:
        if task.parent_id == parent_id:
            # Наследуем категорию от родителя, если у задачи нет своей
            task_category = task.category if task.category else parent_category
            subtasks = build_task_tree(tasks, task.id, task_category)
            task_dict = {
                "id": task.id,
                "title": task.title,
                "category": task_category,
                "priority": task.priority,
                "status": task.status,
                "is_completed": task.is_completed,
                "parent_id": task.parent_id,
                "created_at": task.created_at,
                "updated_at": task.updated_at,
                "subtasks": subtasks
            }
            result.append(TaskResponse.model_validate(task_dict))
    return result


def task_to_response(task: Task, all_tasks: List[Task]) -> TaskResponse:
    """Преобразует задачу в ответ с подзадачами"""
    # Получаем категорию родителя, если у задачи нет своей
    parent_category = None
    if task.parent_id:
        parent = next((t for t in all_tasks if t.id == task.parent_id), None)
        if parent:
            parent_category = parent.category
    
    task_category = task.category if task.category else parent_category
    task_dict = {
        "id": task.id,
        "title": task.title,
        "category": task_category,
        "priority": task.priority,
        "status": task.status,
        "is_completed": task.is_completed,
        "parent_id": task.parent_id,
        "created_at": task.created_at,
        "updated_at": task.updated_at,
        "subtasks": build_task_tree(all_tasks, task.id, task_category)
    }
    return TaskResponse.model_validate(task_dict)


def filter_task_tree(tasks: List[TaskResponse], filter_completed: Optional[str]) -> List[TaskResponse]:
    """Фильтрует дерево задач по статусу завершенности"""
    if filter_completed is None or filter_completed == "all":
        return tasks
    
    result = []
    for task in tasks:
        # Фильтруем подзадачи рекурсивно
        filtered_subtasks = filter_task_tree(task.subtasks, filter_completed) if task.subtasks else []
        
        # Проверяем, нужно ли включать задачу
        should_include = False
        if filter_completed == "completed":
            # Включаем задачу, если она завершена ИЛИ имеет завершенные подзадачи
            should_include = task.is_completed or len(filtered_subtasks) > 0
        elif filter_completed == "incomplete":
            # Включаем задачу, если она не завершена ИЛИ имеет незавершенные подзадачи
            should_include = not task.is_completed or len(filtered_subtasks) > 0
        
        if should_include:
            # Создаем копию задачи с отфильтрованными подзадачами
            task_dict = task.model_dump()
            task_dict["subtasks"] = filtered_subtasks
            result.append(TaskResponse.model_validate(task_dict))
    
    return result


def filter_by_category(tasks: List[TaskResponse], category: Optional[str]) -> List[TaskResponse]:
    """Фильтрует дерево задач по категории"""
    if not category:
        return tasks
    
    result = []
    for task in tasks:
        # Фильтруем подзадачи рекурсивно
        filtered_subtasks = filter_by_category(task.subtasks, category) if task.subtasks else []
        
        # Проверяем, нужно ли включать задачу
        # Включаем, если категория совпадает ИЛИ есть подзадачи с этой категорией
        task_category = task.category if task.category else None
        should_include = (task_category == category) or len(filtered_subtasks) > 0
        
        if should_include:
            # Создаем копию задачи с отфильтрованными подзадачами
            task_dict = task.model_dump()
            task_dict["subtasks"] = filtered_subtasks
            result.append(TaskResponse.model_validate(task_dict))
    
    return result


def filter_by_priority(tasks: List[TaskResponse], priority: Optional[TaskPriority]) -> List[TaskResponse]:
    """Фильтрует дерево задач по приоритету"""
    if not priority:
        return tasks
    
    result = []
    for task in tasks:
        # Фильтруем подзадачи рекурсивно
        filtered_subtasks = filter_by_priority(task.subtasks, priority) if task.subtasks else []
        
        # Проверяем, нужно ли включать задачу
        # Включаем, если приоритет совпадает ИЛИ есть подзадачи с этим приоритетом
        should_include = (task.priority == priority) or len(filtered_subtasks) > 0
        
        if should_include:
            # Создаем копию задачи с отфильтрованными подзадачами
            task_dict = task.model_dump()
            task_dict["subtasks"] = filtered_subtasks
            result.append(TaskResponse.model_validate(task_dict))
    
    return result


@router.get("/", response_model=TaskListResponse)
async def get_tasks(
    filter_completed: Optional[str] = Query(None, description="Фильтр: 'all', 'completed', 'incomplete'"),
    category: Optional[str] = Query(None, description="Фильтр по категории"),
    priority: Optional[str] = Query(None, description="Фильтр по приоритету: 'low', 'medium', 'high'"),
    db: Session = Depends(get_db)
):
    """
    Получить список всех задач с поддержкой фильтрации
    """
    # Получаем все задачи
    all_tasks = db.query(Task).order_by(Task.created_at.desc()).all()
    
    # Строим дерево задач
    task_tree = build_task_tree(all_tasks, None)
    
    # Применяем фильтр по категории
    if category:
        task_tree = filter_by_category(task_tree, category)
    
    # Применяем фильтр по приоритету
    if priority:
        try:
            priority_enum = TaskPriority(priority)
            task_tree = filter_by_priority(task_tree, priority_enum)
        except ValueError:
            # Если приоритет невалидный, игнорируем фильтр
            pass
    
    # Применяем фильтр по завершенности после фильтрации по категории и приоритету
    if filter_completed and filter_completed != "all":
        task_tree = filter_task_tree(task_tree, filter_completed)
    
    # Подсчитываем общее количество задач (включая подзадачи)
    def count_tasks(tasks: List[TaskResponse]) -> int:
        count = len(tasks)
        for task in tasks:
            if task.subtasks:
                count += count_tasks(task.subtasks)
        return count
    
    total = count_tasks(task_tree)
    
    return TaskListResponse(tasks=task_tree, total=total)


@router.get("/categories", response_model=List[str])
async def get_categories(db: Session = Depends(get_db)):
    """Получить список всех уникальных категорий"""
    categories = db.query(Task.category).distinct().filter(Task.category.isnot(None)).all()
    return [cat[0] for cat in categories if cat[0]]


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(task_id: int, db: Session = Depends(get_db)):
    """Получить задачу по ID"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Задача не найдена")
    
    # Получаем все задачи для построения дерева
    all_tasks = db.query(Task).all()
    return task_to_response(task, all_tasks)


@router.post("/", response_model=TaskResponse, status_code=201)
async def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    """Создать новую задачу или подзадачу"""
    # Определяем категорию задачи
    task_category = task.category
    
    # Проверяем, что родительская задача существует (если указана)
    if task.parent_id:
        parent = db.query(Task).filter(Task.id == task.parent_id).first()
        if not parent:
            raise HTTPException(status_code=404, detail="Родительская задача не найдена")
        # Наследуем категорию от родителя, если не указана
        if not task_category:
            task_category = parent.category
    
    db_task = Task(
        title=task.title,
        category=task_category,
        priority=task.priority,
        status=task.status,
        parent_id=task.parent_id,
        is_completed=False
    )
    
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    
    # Получаем все задачи для построения дерева
    all_tasks = db.query(Task).all()
    return task_to_response(db_task, all_tasks)


def get_all_subtasks_statuses(task_id: int, db: Session) -> List[TaskStatus]:
    """Рекурсивно получает все статусы подзадач"""
    statuses = []
    subtasks = db.query(Task).filter(Task.parent_id == task_id).all()
    
    for subtask in subtasks:
        statuses.append(subtask.status)
        # Рекурсивно получаем статусы вложенных подзадач
        statuses.extend(get_all_subtasks_statuses(subtask.id, db))
    
    return statuses


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(task_id: int, task_update: TaskUpdate, db: Session = Depends(get_db)):
    """Обновить задачу"""
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Задача не найдена")
    
    # Проверяем изменение статуса для родительской задачи
    if task_update.status is not None and task_update.status != db_task.status:
        # Разрешаем изменение статуса на "к выполнению" всегда (можно вернуть задачу в начальное состояние)
        if task_update.status != TaskStatus.TODO:
            # Получаем все статусы подзадач (рекурсивно)
            subtask_statuses = get_all_subtasks_statuses(task_id, db)
            # Проверяем, есть ли подзадачи с другим статусом
            if len(subtask_statuses) > 0 and not all(status == task_update.status for status in subtask_statuses):
                raise HTTPException(
                    status_code=400,
                    detail=f"Невозможно изменить статус родительской задачи. У неё есть подзадачи с другими статусами. Сначала измените статусы всех подзадач."
                )
    
    # Обновляем поля
    update_data = task_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_task, field, value)
    
    # Если задача помечена как завершенная, обновляем статус
    if task_update.is_completed is not None:
        if task_update.is_completed:
            db_task.status = TaskStatus.COMPLETED
        elif db_task.status == TaskStatus.COMPLETED:
            db_task.status = TaskStatus.TODO
    
    db.commit()
    db.refresh(db_task)
    
    # Получаем все задачи для построения дерева
    all_tasks = db.query(Task).all()
    return task_to_response(db_task, all_tasks)


@router.patch("/{task_id}/complete", response_model=TaskResponse)
async def toggle_task_completion(task_id: int, db: Session = Depends(get_db)):
    """Переключить статус завершения задачи"""
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Задача не найдена")
    
    new_status = TaskStatus.COMPLETED if not db_task.is_completed else TaskStatus.TODO
    
    # Проверяем изменение статуса для родительской задачи
    if new_status != db_task.status:
        # Разрешаем изменение статуса на "к выполнению" всегда (можно вернуть задачу в начальное состояние)
        if new_status != TaskStatus.TODO:
            # Получаем все статусы подзадач (рекурсивно)
            subtask_statuses = get_all_subtasks_statuses(task_id, db)
            # Проверяем, есть ли подзадачи с другим статусом
            if len(subtask_statuses) > 0 and not all(status == new_status for status in subtask_statuses):
                raise HTTPException(
                    status_code=400,
                    detail=f"Невозможно изменить статус родительской задачи. У неё есть подзадачи с другими статусами. Сначала измените статусы всех подзадач."
                )
    
    db_task.is_completed = not db_task.is_completed
    if db_task.is_completed:
        db_task.status = TaskStatus.COMPLETED
    else:
        db_task.status = TaskStatus.TODO
    
    db.commit()
    db.refresh(db_task)
    
    # Получаем все задачи для построения дерева
    all_tasks = db.query(Task).all()
    return task_to_response(db_task, all_tasks)


def delete_task_recursive(task_id: int, db: Session):
    """Рекурсивно удаляет задачу и все её подзадачи"""
    # Получаем все подзадачи
    subtasks = db.query(Task).filter(Task.parent_id == task_id).all()
    
    # Рекурсивно удаляем все подзадачи
    for subtask in subtasks:
        delete_task_recursive(subtask.id, db)
    
    # Удаляем саму задачу
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if db_task:
        db.delete(db_task)


@router.delete("/{task_id}", status_code=204)
async def delete_task(task_id: int, db: Session = Depends(get_db)):
    """Удалить задачу и все её подзадачи"""
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Задача не найдена")
    
    # Рекурсивно удаляем задачу и все подзадачи
    delete_task_recursive(task_id, db)
    db.commit()
    
    return None

