# Tasks - Приложение для управления задачами

Веб-приложение для управления задачами с разделением на frontend и backend.

**Домен:** tasks.aadolgov.com (в разработке)

## Структура проекта

```
Tasks/
├── backend/          # Backend на FastAPI
│   ├── src/          # Исходный код
│   │   ├── main.py   # Главный файл приложения
│   │   ├── models.py # Модели базы данных
│   │   ├── schemas.py # Pydantic схемы
│   │   ├── database.py # Конфигурация БД
│   │   └── routers/  # API роутеры
│   ├── Dockerfile    # Docker образ для backend
│   ├── requirements.txt
│   └── tasks.db      # SQLite база данных (создается автоматически)
├── frontend/         # Frontend на React + TypeScript
│   ├── src/          # Исходный код
│   │   ├── components/ # React компоненты
│   │   │   └── Tasks/   # Компоненты задач
│   │   ├── pages/      # Страницы
│   │   ├── services/   # API сервисы
│   │   └── types/      # TypeScript типы
│   ├── public/       # Статические файлы
│   ├── Dockerfile    # Docker образ для frontend
│   └── package.json
├── logs/             # Логи приложения
└── docker-compose.dev.yml  # Docker Compose для разработки
```

## Технологии

### Backend
- FastAPI - современный веб-фреймворк для Python
- SQLAlchemy - ORM для работы с базой данных
- SQLite - база данных (для разработки)
- Uvicorn - ASGI сервер
- Pydantic - валидация данных

### Frontend
- React 19 - библиотека для создания пользовательских интерфейсов
- TypeScript - типизированный JavaScript
- Material-UI (MUI) - компоненты интерфейса
- Axios - HTTP клиент

## Функционал

### Управление задачами
- ✅ Создание задач и подзадач
- ✅ Редактирование задач (название, описание, категория, приоритет, статус)
- ✅ Удаление задач
- ✅ Отметка задач как завершенных
- ✅ Фильтрация задач (все / не завершенные / завершенные)
- ✅ Визуальное отображение подзадач (вложенная структура)

### Поля задач
- **Название** (обязательное)
- **Описание** (опциональное)
- **Категория** (опциональное)
- **Приоритет**: низкий, средний, высокий
- **Статус**: сделано, в работе, завершено
- **Завершенность**: да/нет

## Разработка

### Требования
- Docker и Docker Compose
- Git

### Запуск в режиме разработки

#### Вариант 1: Использование скрипта (рекомендуется)

```bash
cd ~/Yandex.Disk.localized/Личное/Git\ Projects/Tasks
chmod +x start_dev.sh
./start_dev.sh
```

#### Вариант 2: Ручной запуск

1. Перейдите в директорию проекта:
   ```bash
   cd ~/Yandex.Disk.localized/Личное/Git\ Projects/Tasks
   ```

2. Запустите контейнеры:
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

3. Откройте в браузере:
   - **Frontend**: http://localhost:3001
   - **Backend API**: http://localhost:8001
   - **API документация (Swagger)**: http://localhost:8001/docs
   - **API документация (ReDoc)**: http://localhost:8001/redoc

### Остановка

```bash
docker-compose -f docker-compose.dev.yml down
```

### Пересборка контейнеров

```bash
docker-compose -f docker-compose.dev.yml up --build
```

### Очистка базы данных

Для сброса базы данных удалите файл `backend/data/tasks.db`:

```bash
rm backend/data/tasks.db
```

База данных будет автоматически создана при следующем запуске.

## API Endpoints

### Основные
- `GET /` - Корневой endpoint
- `GET /api/health` - Проверка здоровья API

### Задачи
- `GET /api/tasks` - Получить список задач (с фильтрацией)
  - Параметры: `filter_completed` (all/completed/incomplete)
- `GET /api/tasks/{id}` - Получить задачу по ID
- `POST /api/tasks` - Создать задачу/подзадачу
- `PUT /api/tasks/{id}` - Обновить задачу
- `PATCH /api/tasks/{id}/complete` - Переключить статус завершения
- `DELETE /api/tasks/{id}` - Удалить задачу

Подробная документация доступна по адресу: http://localhost:8000/docs

## Разработка

### Backend

Backend запускается с hot-reload, изменения в коде автоматически применяются.

**Структура:**
- `src/main.py` - главный файл приложения
- `src/models.py` - модели базы данных
- `src/schemas.py` - Pydantic схемы для валидации
- `src/database.py` - конфигурация базы данных
- `src/routers/tasks.py` - API endpoints для задач

### Frontend

Frontend запускается с hot-reload, изменения в коде автоматически применяются.

**Структура:**
- `src/components/Tasks/TaskTable.tsx` - основной компонент таблицы задач
- `src/pages/Dashboard.tsx` - страница с задачами
- `src/services/api.ts` - API клиент
- `src/types/index.ts` - TypeScript типы

## Логи

Логи сохраняются в директории `logs/` и доступны через Docker:

```bash
# Логи backend
docker-compose -f docker-compose.dev.yml logs -f backend

# Логи frontend
docker-compose -f docker-compose.dev.yml logs -f frontend

# Все логи
docker-compose -f docker-compose.dev.yml logs -f
```

## База данных

База данных SQLite сохраняется в файле `backend/data/tasks.db` и монтируется в контейнер для сохранения данных между перезапусками. Директория `backend/data/` создается автоматически при запуске скрипта `start_dev.sh`.

## Тестирование

После запуска проекта:

1. Откройте http://localhost:3000
2. Создайте несколько задач
3. Создайте подзадачи для основных задач
4. Протестируйте фильтрацию (все / не завершенные / завершенные)
5. Протестируйте редактирование задач
6. Протестируйте отметку задач как завершенных

## Развертывание

Для развертывания на tasks.aadolgov.com потребуется:
- Настройка production docker-compose
- Настройка nginx для frontend
- Настройка домена и SSL сертификатов
- Настройка production базы данных (PostgreSQL)

## Лицензия

MIT

