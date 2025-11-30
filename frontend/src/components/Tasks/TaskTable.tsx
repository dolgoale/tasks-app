import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  IconButton,
  Chip,
  Box,
  Typography,
  Tooltip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  useMediaQuery,
  useTheme,
  Autocomplete,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
} from '@mui/icons-material';
import { Task, TaskStatus, TaskPriority, TaskFilter } from '../../types';
import { api } from '../../services/api';
import TaskCard from './TaskCard';

interface TaskRowProps {
  task: Task;
  level: number;
  onUpdate: () => void;
  onDelete: (id: number) => void;
}

const TaskRow: React.FC<TaskRowProps> = ({ task, level, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: task.title,
    category: task.category || '',
    priority: task.priority,
    status: task.status,
  });

  const handleToggleComplete = async () => {
    try {
      await api.toggleTaskCompletion(task.id);
      onUpdate();
    } catch (error: any) {
      console.error('Ошибка при обновлении задачи:', error);
      const errorMessage = error.response?.data?.detail || 'Ошибка при обновлении задачи';
      alert(errorMessage);
    }
  };

  const handleSave = async () => {
    try {
      await api.updateTask(task.id, editData);
      setIsEditing(false);
      onUpdate();
      // Обновляем список категорий, если изменилась категория
      window.dispatchEvent(new Event('refreshCategories'));
    } catch (error: any) {
      console.error('Ошибка при сохранении задачи:', error);
      const errorMessage = error.response?.data?.detail || 'Ошибка при сохранении задачи';
      alert(errorMessage);
    }
  };

  const handleDelete = async () => {
    const hasSubtasks = task.subtasks && task.subtasks.length > 0;
    const confirmMessage = hasSubtasks
      ? 'Вы уверены, что хотите удалить эту задачу? Все подзадачи также будут удалены.'
      : 'Вы уверены, что хотите удалить эту задачу?';
    
    if (window.confirm(confirmMessage)) {
      try {
        await api.deleteTask(task.id);
        onDelete(task.id);
      } catch (error: any) {
        alert(error.response?.data?.detail || 'Ошибка при удалении задачи');
      }
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH:
        return 'error';
      case TaskPriority.MEDIUM:
        return 'warning';
      case TaskPriority.LOW:
        return 'info';
      default:
        return 'default';
    }
  };


  const paddingLeft = level * 4;

  return (
    <>
      <TableRow
        sx={{
          backgroundColor: task.is_completed ? 'action.hover' : 'background.paper',
          '&:hover': { backgroundColor: 'action.selected' },
          height: '48px',
        }}
      >
        <TableCell 
          padding="checkbox" 
          sx={{ 
            pl: level > 0 ? `${paddingLeft}rem` : undefined,
            py: 0.5,
          }}
        >
          <Checkbox
            checked={task.is_completed}
            onChange={handleToggleComplete}
            icon={<RadioButtonUncheckedIcon />}
            checkedIcon={<CheckCircleIcon />}
            size="small"
          />
        </TableCell>
        <TableCell sx={{ py: 0.5 }}>
          {isEditing ? (
            <TextField
              fullWidth
              size="small"
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
            />
          ) : (
            <Typography
              variant="body2"
              sx={{
                textDecoration: task.is_completed ? 'line-through' : 'none',
                fontWeight: level === 0 ? 'medium' : 'normal',
                fontSize: '0.875rem',
                lineHeight: 1.5,
              }}
            >
              {task.title}
            </Typography>
          )}
        </TableCell>
        <TableCell sx={{ py: 0.5 }}>
          {isEditing ? (
            <TextField
              fullWidth
              size="small"
              value={editData.category}
              onChange={(e) => setEditData({ ...editData, category: e.target.value })}
            />
          ) : (
            <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>{task.category || '-'}</Typography>
          )}
        </TableCell>
        <TableCell sx={{ py: 0.5 }}>
          {isEditing ? (
            <FormControl fullWidth size="small">
              <Select
                value={editData.priority}
                onChange={(e) => setEditData({ ...editData, priority: e.target.value as TaskPriority })}
              >
                <MenuItem value={TaskPriority.LOW}>Низкий</MenuItem>
                <MenuItem value={TaskPriority.MEDIUM}>Средний</MenuItem>
                <MenuItem value={TaskPriority.HIGH}>Высокий</MenuItem>
              </Select>
            </FormControl>
          ) : (
            <Chip
              label={editData.priority}
              size="small"
              color={getPriorityColor(editData.priority)}
            />
          )}
        </TableCell>
        <TableCell sx={{ py: 0.5 }}>
          {isEditing ? (
            <FormControl fullWidth size="small">
              <Select
                value={editData.status}
                onChange={(e) => setEditData({ ...editData, status: e.target.value as TaskStatus })}
              >
                <MenuItem value={TaskStatus.TODO}>К выполнению</MenuItem>
                <MenuItem value={TaskStatus.IN_PROGRESS}>В работе</MenuItem>
                <MenuItem value={TaskStatus.COMPLETED}>Завершено</MenuItem>
              </Select>
            </FormControl>
          ) : (
            <Chip
              label={editData.status}
              size="small"
              variant="outlined"
            />
          )}
        </TableCell>
        <TableCell sx={{ py: 0.5 }}>
          {isEditing ? (
            <Stack direction="row" spacing={1}>
              <Button size="small" variant="contained" onClick={handleSave}>
                Сохранить
              </Button>
              <Button size="small" onClick={() => setIsEditing(false)}>
                Отмена
              </Button>
            </Stack>
          ) : (
            <Stack direction="row" spacing={1}>
              <Tooltip title="Редактировать">
                <IconButton size="small" onClick={() => setIsEditing(true)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Удалить">
                <IconButton size="small" color="error" onClick={handleDelete}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          )}
        </TableCell>
      </TableRow>
      {task.subtasks?.map((subtask) => (
        <TaskRow
          key={subtask.id}
          task={subtask}
          level={level + 1}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </>
  );
};

interface TaskTableProps {
  filter: TaskFilter;
  category?: string;
  priority?: TaskPriority;
}

const TaskTable: React.FC<TaskTableProps> = ({ filter, category, priority }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    category: '',
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.TODO,
    parent_id: undefined as number | undefined,
  });

  const loadCategories = useCallback(async () => {
    try {
      const cats = await api.getCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Ошибка при загрузке категорий:', error);
    }
  }, []);

  useEffect(() => {
    loadCategories();
    // Обновляем категории при открытии диалога
    const handleCategoryRefresh = () => {
      loadCategories();
    };
    window.addEventListener('refreshCategories', handleCategoryRefresh);
    return () => {
      window.removeEventListener('refreshCategories', handleCategoryRefresh);
    };
  }, [loadCategories]);

  // Загружаем категории при открытии диалога
  useEffect(() => {
    if (openDialog) {
      loadCategories();
    }
  }, [openDialog, loadCategories]);

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.getTasks(filter, category, priority);
      setTasks(response.tasks);
    } catch (error) {
      console.error('Ошибка при загрузке задач:', error);
    } finally {
      setLoading(false);
    }
  }, [filter, category, priority]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleCreateTask = async () => {
    try {
      // Убираем пустую категорию
      const taskToCreate = {
        ...newTask,
        category: newTask.category?.trim() || undefined,
      };
      await api.createTask(taskToCreate);
      setOpenDialog(false);
      setNewTask({
        title: '',
        category: '',
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.TODO,
        parent_id: undefined,
      });
      loadTasks();
      // Обновляем список категорий
      loadCategories();
      window.dispatchEvent(new Event('refreshCategories'));
    } catch (error: any) {
      console.error('Ошибка при создании задачи:', error);
      if (error.response?.data?.detail) {
        alert(`Ошибка: ${JSON.stringify(error.response.data.detail)}`);
      } else {
        alert('Ошибка при создании задачи. Проверьте консоль для деталей.');
      }
    }
  };

  const handleDelete = (id: number) => {
    loadTasks();
    // Обновляем список категорий после удаления
    window.dispatchEvent(new Event('refreshCategories'));
  };

  const flattenTasks = (taskList: Task[]): Task[] => {
    const result: Task[] = [];
    const processTask = (task: Task) => {
      result.push(task);
      if (task.subtasks) {
        task.subtasks.forEach(processTask);
      }
    };
    taskList.forEach(processTask);
    return result;
  };

  const countAllTasks = (taskList: Task[]): number => {
    let count = 0;
    const processTask = (task: Task) => {
      // Считаем только незавершенные задачи
      if (!task.is_completed) {
        count++;
      }
      if (task.subtasks) {
        task.subtasks.forEach(processTask);
      }
    };
    taskList.forEach(processTask);
    return count;
  };

  const allTasks = flattenTasks(tasks);
  const totalTasksCount = countAllTasks(tasks);

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 2,
          gap: 1,
        }}
      >
        <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
          Задачи ({totalTasksCount})
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          size={isMobile ? 'small' : 'medium'}
          fullWidth={isMobile}
        >
          Создать задачу
        </Button>
      </Box>

      {isMobile ? (
        <Box>
          {loading ? (
            <Typography align="center" sx={{ py: 3 }}>
              Загрузка...
            </Typography>
          ) : tasks.length === 0 ? (
            <Typography align="center" color="text.secondary" sx={{ py: 3 }}>
              Нет задач
            </Typography>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                level={0}
                onUpdate={loadTasks}
                onDelete={handleDelete}
              />
            ))
          )}
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ height: '40px' }}>
                <TableCell padding="checkbox" sx={{ py: 0.5 }}>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                    Выполнено
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 0.5 }}>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                    Название
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 0.5 }}>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                    Категория
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 0.5 }}>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                    Приоритет
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 0.5 }}>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                    Статус
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 0.5 }}>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                    Действия
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography>Загрузка...</Typography>
                  </TableCell>
                </TableRow>
              ) : tasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="text.secondary">Нет задач</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                tasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    level={0}
                    onUpdate={loadTasks}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>Создать новую задачу</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Название"
              fullWidth
              required
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            />
            <Autocomplete
              freeSolo
              options={categories}
              value={newTask.category || null}
              onChange={(_, newValue) => {
                setNewTask({ ...newTask, category: newValue || '' });
              }}
              onInputChange={(_, newValue) => {
                setNewTask({ ...newTask, category: newValue });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Категория"
                  fullWidth
                  placeholder="Выберите или введите категорию"
                />
              )}
            />
            <FormControl fullWidth>
              <InputLabel>Приоритет</InputLabel>
              <Select
                value={newTask.priority}
                label="Приоритет"
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as TaskPriority })}
              >
                <MenuItem value={TaskPriority.LOW}>Низкий</MenuItem>
                <MenuItem value={TaskPriority.MEDIUM}>Средний</MenuItem>
                <MenuItem value={TaskPriority.HIGH}>Высокий</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Статус</InputLabel>
              <Select
                value={newTask.status}
                label="Статус"
                onChange={(e) => setNewTask({ ...newTask, status: e.target.value as TaskStatus })}
              >
                <MenuItem value={TaskStatus.TODO}>К выполнению</MenuItem>
                <MenuItem value={TaskStatus.IN_PROGRESS}>В работе</MenuItem>
                <MenuItem value={TaskStatus.COMPLETED}>Завершено</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Родительская задача (опционально)</InputLabel>
              <Select
                value={newTask.parent_id || ''}
                label="Родительская задача (опционально)"
                onChange={(e) =>
                  setNewTask({
                    ...newTask,
                    parent_id: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              >
                <MenuItem value="">Нет (основная задача)</MenuItem>
                {allTasks
                  .filter((t) => !t.parent_id)
                  .map((task) => (
                    <MenuItem key={task.id} value={task.id}>
                      {task.title}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
          <Button
            variant="contained"
            onClick={handleCreateTask}
            disabled={!newTask.title.trim()}
          >
            Создать
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskTable;

