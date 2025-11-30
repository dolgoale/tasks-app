import React, { useState, useEffect, useCallback } from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Divider,
  Box,
  Chip,
} from '@mui/material';
import { Label as LabelIcon } from '@mui/icons-material';
import { api } from '../../services/api';
import { useCategory } from '../../contexts/CategoryContext';

const CategoriesSidebar: React.FC = () => {
  const { selectedCategory, setSelectedCategory } = useCategory();
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const cats = await api.getCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Ошибка при загрузке категорий:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Слушаем события обновления категорий
  useEffect(() => {
    const handleCategoryRefresh = () => {
      loadCategories();
    };

    // Создаем кастомное событие для обновления категорий
    window.addEventListener('refreshCategories', handleCategoryRefresh);
    
    // Также обновляем периодически для надежности
    const interval = setInterval(loadCategories, 5000);

    return () => {
      window.removeEventListener('refreshCategories', handleCategoryRefresh);
      clearInterval(interval);
    };
  }, [loadCategories]);


  return (
    <Box>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LabelIcon fontSize="small" />
          Категории
        </Typography>
      </Box>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton
            selected={selectedCategory === null}
            onClick={() => setSelectedCategory(null)}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'rgba(144, 202, 249, 0.16)',
                '&:hover': {
                  backgroundColor: 'rgba(144, 202, 249, 0.24)',
                },
              },
            }}
          >
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography>Все задачи</Typography>
                </Box>
              }
            />
          </ListItemButton>
        </ListItem>
        {loading ? (
          <ListItem>
            <ListItemText primary="Загрузка..." />
          </ListItem>
        ) : categories.length === 0 ? (
          <ListItem>
            <ListItemText
              primary="Нет категорий"
              secondary="Создайте задачи с категориями"
            />
          </ListItem>
        ) : (
          categories.map((category) => (
            <ListItem key={category} disablePadding>
              <ListItemButton
                selected={selectedCategory === category}
                onClick={() => setSelectedCategory(category)}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(144, 202, 249, 0.16)',
                    '&:hover': {
                      backgroundColor: 'rgba(144, 202, 249, 0.24)',
                    },
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={category}
                        size="small"
                        variant={selectedCategory === category ? 'filled' : 'outlined'}
                        color={selectedCategory === category ? 'primary' : 'default'}
                      />
                    </Box>
                  }
                />
              </ListItemButton>
            </ListItem>
          ))
        )}
      </List>
    </Box>
  );
};

export default CategoriesSidebar;

