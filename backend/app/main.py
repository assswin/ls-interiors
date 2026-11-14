
from fastapi import FastAPI

from app.api.routes import customers, projects, measurements


app = FastAPI(
    title="LS Interiors API",
    description="Window Measurement and Project Management System",
    version="1.0.0",
)

app.include_router(customers.router)
app.include_router(projects.router)
app.include_router(measurements.router)


@app.get("/")
def home():
    return {
        "message": "Welcome to LS Interiors API",
        "status": "running",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "application": "LS Interiors",
    }
