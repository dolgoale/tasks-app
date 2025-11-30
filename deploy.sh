#!/bin/bash

# Скрипт для развертывания проекта на удаленном сервере

SERVER_IP="194.87.46.14"
SERVER_USER="root"
PROJECT_DIR="/opt/tasks-app"
REPO_URL="https://github.com/dolgoale/tasks-app.git"

echo "🚀 Начало развертывания проекта Tasks на сервере $SERVER_IP..."

# Проверка SSH подключения
echo "📡 Проверка SSH подключения..."
ssh -o ConnectTimeout=10 $SERVER_USER@$SERVER_IP "echo 'SSH connection successful'" || {
    echo "❌ Ошибка подключения к серверу. Убедитесь, что:"
    echo "   1. SSH ключ добавлен на сервер"
    echo "   2. Сервер доступен"
    exit 1
}

# Создание директории проекта
echo "📁 Создание директории проекта..."
ssh $SERVER_USER@$SERVER_IP "mkdir -p $PROJECT_DIR && cd $PROJECT_DIR"

# Клонирование или обновление репозитория
echo "📥 Клонирование репозитория..."
ssh $SERVER_USER@$SERVER_IP "
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
ssh $SERVER_USER@$SERVER_IP "docker --version && docker-compose --version" || {
    echo "❌ Docker не установлен на сервере"
    exit 1
}

# Создание необходимых директорий
echo "📂 Создание директорий..."
ssh $SERVER_USER@$SERVER_IP "
    cd $PROJECT_DIR
    mkdir -p backend/data logs
"

# Сборка и запуск контейнеров
echo "🔨 Сборка и запуск Docker контейнеров..."
ssh $SERVER_USER@$SERVER_IP "
    cd $PROJECT_DIR
    docker-compose -f docker-compose.yml down
    docker-compose -f docker-compose.yml build --no-cache
    docker-compose -f docker-compose.yml up -d
"

# Проверка статуса контейнеров
echo "✅ Проверка статуса контейнеров..."
ssh $SERVER_USER@$SERVER_IP "
    cd $PROJECT_DIR
    docker-compose -f docker-compose.yml ps
"

echo ""
echo "🎉 Развертывание завершено!"
echo "📊 Приложение доступно по адресам:"
echo "   - Frontend: http://$SERVER_IP:3001"
echo "   - Backend API: http://$SERVER_IP:8001"
echo "   - API документация: http://$SERVER_IP:8001/docs"

