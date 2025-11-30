#!/bin/bash

# Скрипт для запуска проекта в режиме разработки

echo "🚀 Запуск проекта Tasks в режиме разработки..."

# Переход в директорию проекта
cd "$(dirname "$0")"

# Проверка наличия Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен. Пожалуйста, установите Docker."
    exit 1
fi

# Проверка наличия Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose не установлен. Пожалуйста, установите Docker Compose."
    exit 1
fi

# Создание директорий, если их нет
mkdir -p logs
mkdir -p backend/data

# Запуск контейнеров
echo "📦 Запуск Docker контейнеров..."
if command -v docker-compose &> /dev/null; then
    docker-compose -f docker-compose.dev.yml up --build
else
    docker compose -f docker-compose.dev.yml up --build
fi

