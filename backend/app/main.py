import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth
from app.api import projects
from app.api import boards
from app.api import tasks

app = FastAPI(
    title="TaskFlow API",
    description="A simple and clean task management API",
    version="1.0.0",
)

# Default origins for local development.
# In production, set ALLOWED_ORIGINS as a comma-separated env var in Railway:
#   e.g. ALLOWED_ORIGINS=https://your-frontend.up.railway.app,https://yourapp.vercel.app
_default_origins = "http://localhost:3000,http://localhost:5173"
_origins_env = os.getenv("ALLOWED_ORIGINS", _default_origins)
allowed_origins = [o.strip() for o in _origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(projects.router, prefix="/projects", tags=["Projects"])
app.include_router(boards.router, prefix="/boards", tags=["Boards"])
app.include_router(tasks.router, prefix="/tasks", tags=["Tasks"])

@app.get("/")
def read_root():
    return {"message": "Welcome to TaskFlow API"}
