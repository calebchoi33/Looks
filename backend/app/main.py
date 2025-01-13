from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine
from .models import Base
from .handlers import auth_handler, user_handler

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="LooksMaxx API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_handler.router)
app.include_router(user_handler.router)

@app.get("/")
async def root():
    return {"message": "Welcome to LooksMaxx API"}
