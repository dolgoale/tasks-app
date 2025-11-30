import React, { useState } from 'react';
import {
  Box,
  Typography,
  Container,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import TaskTable from '../components/Tasks/TaskTable';
import { TaskFilter, TaskPriority } from '../types';
import { useCategory } from '../contexts/CategoryContext';

const Dashboard: React.FC = () => {
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority | undefined>(undefined);
  const { selectedCategory } = useCategory();

  const handleFilterChange = (
    _event: React.MouseEvent<HTMLElement>,
    newFilter: TaskFilter | null
  ) => {
    if (newFilter !== null) {
      setFilter(newFilter);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2 } }}>
      <Box sx={{ py: { xs: 1, sm: 3 } }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            mb: { xs: 2, sm: 3 },
            gap: 2,
          }}
        >
          <Typography variant="h4" component="h1" sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
            Панель управления задачами
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' } }}>
            <ToggleButtonGroup
              value={filter}
              exclusive
              onChange={handleFilterChange}
              aria-label="фильтр задач"
              size="small"
            >
              <ToggleButton value="all" aria-label="все задачи" sx={{ flex: { xs: 1, sm: 'none' } }}>
                Все
              </ToggleButton>
              <ToggleButton value="incomplete" aria-label="не завершенные" sx={{ flex: { xs: 1, sm: 'none' } }}>
                Не завершенные
              </ToggleButton>
              <ToggleButton value="completed" aria-label="завершенные" sx={{ flex: { xs: 1, sm: 'none' } }}>
                Завершенные
              </ToggleButton>
            </ToggleButtonGroup>
            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 150 } }}>
              <InputLabel>Приоритет</InputLabel>
              <Select
                value={selectedPriority || ''}
                label="Приоритет"
                onChange={(e) => setSelectedPriority(e.target.value ? (e.target.value as TaskPriority) : undefined)}
              >
                <MenuItem value="">Все</MenuItem>
                <MenuItem value={TaskPriority.LOW}>Низкий</MenuItem>
                <MenuItem value={TaskPriority.MEDIUM}>Средний</MenuItem>
                <MenuItem value={TaskPriority.HIGH}>Высокий</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
        <Paper sx={{ p: { xs: 1, sm: 3 } }}>
          <TaskTable filter={filter} category={selectedCategory || undefined} priority={selectedPriority} />
        </Paper>
      </Box>
    </Container>
  );
};

export default Dashboard;

