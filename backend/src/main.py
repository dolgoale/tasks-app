"""
Main FastAPI application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from src.routers import tasks
from src.database import init_db

app = FastAPI(
    title="Tasks API",
    description="API для управления задачами",
    version="1.0.0"
)

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://localhost:3000", "http://localhost:80"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем роутеры
app.include_router(tasks.router)

# Инициализация базы данных при старте
@app.on_event("startup")
async def startup_event():
    init_db()


@app.get("/")
async def root():
    """Корневой endpoint"""
    return {"message": "Tasks API", "version": "1.0.0"}


@app.get("/api/health")
async def health_check():
    """Проверка здоровья API"""
    return JSONResponse(
        status_code=200,
        content={"status": "healthy", "service": "tasks-api"}
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

