import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Checkbox,
  IconButton,
  Chip,
  Box,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TextField,
  Button,
  Stack,
  Divider,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
} from '@mui/icons-material';
import { Task, TaskStatus, TaskPriority } from '../../types';
import { api } from '../../services/api';

interface TaskCardProps {
  task: Task;
  level: number;
  onUpdate: () => void;
  onDelete: (id: number) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, level, onUpdate, onDelete }) => {
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
        window.dispatchEvent(new Event('refreshCategories'));
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


  const paddingLeft = level * 1.5;

  return (
    <Box>
      <Card
        sx={{
          mb: 1,
          ml: `${paddingLeft}rem`,
          backgroundColor: task.is_completed ? 'action.hover' : 'background.paper',
          borderLeft: level > 0 ? '3px solid' : 'none',
          borderColor: level > 0 ? 'primary.main' : 'transparent',
        }}
      >
        <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            <Checkbox
              checked={task.is_completed}
              onChange={handleToggleComplete}
              icon={<RadioButtonUncheckedIcon />}
              checkedIcon={<CheckCircleIcon />}
              size="small"
              sx={{ mt: -0.5 }}
            />
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              {isEditing ? (
                <Stack spacing={1.5}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Название"
                    value={editData.title}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Категория"
                    value={editData.category}
                    onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                  />
                  <FormControl fullWidth size="small">
                    <InputLabel>Приоритет</InputLabel>
                    <Select
                      value={editData.priority}
                      label="Приоритет"
                      onChange={(e) => setEditData({ ...editData, priority: e.target.value as TaskPriority })}
                    >
                      <MenuItem value={TaskPriority.LOW}>Низкий</MenuItem>
                      <MenuItem value={TaskPriority.MEDIUM}>Средний</MenuItem>
                      <MenuItem value={TaskPriority.HIGH}>Высокий</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth size="small">
                    <InputLabel>Статус</InputLabel>
                    <Select
                      value={editData.status}
                      label="Статус"
                      onChange={(e) => setEditData({ ...editData, status: e.target.value as TaskStatus })}
                    >
                      <MenuItem value={TaskStatus.TODO}>К выполнению</MenuItem>
                      <MenuItem value={TaskStatus.IN_PROGRESS}>В работе</MenuItem>
                      <MenuItem value={TaskStatus.COMPLETED}>Завершено</MenuItem>
                    </Select>
                  </FormControl>
                  <Stack direction="row" spacing={1}>
                    <Button size="small" variant="contained" onClick={handleSave} fullWidth>
                      Сохранить
                    </Button>
                    <Button size="small" onClick={() => setIsEditing(false)} fullWidth>
                      Отмена
                    </Button>
                  </Stack>
                </Stack>
              ) : (
                <>
                  <Typography
                    variant="body1"
                    sx={{
                      textDecoration: task.is_completed ? 'line-through' : 'none',
                      fontWeight: level === 0 ? 600 : 400,
                      mb: 1,
                    }}
                  >
                    {task.title}
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1, mb: 1 }}>
                    {task.category && (
                      <Chip label={task.category} size="small" variant="outlined" />
                    )}
                    <Chip
                      label={editData.priority}
                      size="small"
                      color={getPriorityColor(editData.priority)}
                    />
                    <Chip
                      label={editData.status}
                      size="small"
                      variant="outlined"
                    />
                  </Stack>
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <IconButton size="small" onClick={() => setIsEditing(true)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={handleDelete}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
      {task.subtasks?.map((subtask) => (
        <TaskCard
          key={subtask.id}
          task={subtask}
          level={level + 1}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </Box>
  );
};

export default TaskCard;

