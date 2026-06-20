from fastapi import FastAPI

app = FastAPI(
    title="TaskFlow API",
    description="A simple and clean task management API",
    version="1.0.0",
)

@app.get("/")
def read_root():
    return {"message": "Welcome to TaskFlow API"}
