#!/bin/bash

# Скрипт для развертывания проекта на удаленном сервере

SERVER_IP="194.87.46.14"
SERVER_USER="root"
PROJECT_DIR="/opt/tasks-app"
REPO_URL="https://github.com/dolgoale/tasks-app.git"
SSH_KEY="$HOME/.ssh/id_ed25519_eth_spread_server"

echo "🚀 Начало развертывания проекта Tasks на сервере $SERVER_IP..."

# Проверка SSH подключения
echo "📡 Проверка SSH подключения..."
ssh -i "$SSH_KEY" -o ConnectTimeout=10 $SERVER_USER@$SERVER_IP "echo 'SSH connection successful'" || {
    echo "❌ Ошибка подключения к серверу. Убедитесь, что:"
    echo "   1. SSH ключ добавлен на сервер"
    echo "   2. Сервер доступен"
    exit 1
}

# Создание директории проекта
echo "📁 Создание директории проекта..."
ssh -i "$SSH_KEY" $SERVER_USER@$SERVER_IP "mkdir -p $PROJECT_DIR && cd $PROJECT_DIR"

# Клонирование или обновление репозитория
echo "📥 Клонирование репозитория..."
ssh -i "$SSH_KEY" $SERVER_USER@$SERVER_IP "
    if [ -d '$PROJECT_DIR/.git' ]; then
        echo 'Обновление существующего репозитория...'
        cd $PROJECT_DIR
        git pull origin main
    else
        echo 'Клонирование нового репозитория...'
        rm -rf $PROJECT_DIR/*
        git clone $REPO_URL $PROJECT_DIR
    fi
"

# Проверка Docker
echo "🐳 Проверка Docker..."
ssh -i "$SSH_KEY" $SERVER_USER@$SERVER_IP "docker --version && (docker compose version || docker-compose --version)" || {
    echo "❌ Docker не установлен на сервере"
    exit 1
}

# Создание необходимых директорий
echo "📂 Создание директорий..."
ssh -i "$SSH_KEY" $SERVER_USER@$SERVER_IP "
    cd $PROJECT_DIR
    mkdir -p backend/data logs
"

# Определение команды docker compose
echo "🔨 Сборка и запуск Docker контейнеров..."
ssh -i "$SSH_KEY" $SERVER_USER@$SERVER_IP "
    cd $PROJECT_DIR
    # Используем docker compose (новая версия) или docker-compose (старая)
    if docker compose version &>/dev/null; then
        DOCKER_COMPOSE='docker compose'
    else
        DOCKER_COMPOSE='docker-compose'
    fi
    \$DOCKER_COMPOSE -f docker-compose.yml down
    \$DOCKER_COMPOSE -f docker-compose.yml build --no-cache
    \$DOCKER_COMPOSE -f docker-compose.yml up -d
"

# Проверка статуса контейнеров
echo "✅ Проверка статуса контейнеров..."
ssh -i "$SSH_KEY" $SERVER_USER@$SERVER_IP "
    cd $PROJECT_DIR
    if docker compose version &>/dev/null; then
        docker compose -f docker-compose.yml ps
    else
        docker-compose -f docker-compose.yml ps
    fi
"

echo ""
echo "🎉 Развертывание завершено!"
echo "📊 Приложение доступно по адресам:"
echo "   - Frontend: http://$SERVER_IP:3001"
echo "   - Backend API: http://$SERVER_IP:8001/api"
echo "   - API документация: http://$SERVER_IP:8001/docs"
echo ""
echo "📝 Для проверки статуса контейнеров:"
echo "   ssh $SERVER_USER@$SERVER_IP 'cd $PROJECT_DIR && docker compose -f docker-compose.yml ps'"
echo ""
echo "📋 Для просмотра логов:"
echo "   ssh $SERVER_USER@$SERVER_IP 'docker logs tasks-backend'"
echo "   ssh $SERVER_USER@$SERVER_IP 'docker logs tasks-frontend'"

