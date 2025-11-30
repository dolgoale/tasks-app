// Типы для приложения Tasks

export enum TaskStatus {
  TODO = "к выполнению",
  IN_PROGRESS = "в работе",
  COMPLETED = "завершено"
}

export enum TaskPriority {
  LOW = "низкий",
  MEDIUM = "средний",
  HIGH = "высокий"
}

export interface Task {
  id: number;
  title: string;
  category?: string;
  priority: TaskPriority;
  status: TaskStatus;
  is_completed: boolean;
  parent_id?: number;
  created_at: string;
  updated_at: string;
  subtasks?: Task[];
}

export interface CreateTaskDto {
  title: string;
  category?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  parent_id?: number;
}

export interface UpdateTaskDto {
  title?: string;
  category?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  is_completed?: boolean;
  parent_id?: number;
}

export interface TaskListResponse {
  tasks: Task[];
  total: number;
}

export type TaskFilter = "all" | "completed" | "incomplete";

