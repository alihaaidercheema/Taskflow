# TaskFlow Backend

## Goal

Build a simple and clean task management API.

Use incremental development and keep the code easy to understand.

Avoid unnecessary abstractions and overengineering.

---

## Stack

- Python 3
- FastAPI
- PostgreSQL
- SQLAlchemy
- Alembic
- Pydantic
- JWT Authentication
- Passlib
- Uvicorn

---

## Folder Structure

```
app/
    api/
    models/
    schemas/
    core/
    db/

main.py
```

---

## Database Models

### User

Fields:

- id
- username
- email
- hashed_password
- created_at

Relationships:

- One user has many projects

---

### Project

Fields:

- id
- name
- description
- owner_id
- created_at

Relationships:

- Belongs to a user
- Has many boards

---

### Board

Fields:

- id
- name
- project_id
- created_at

Relationships:

- Belongs to a project
- Has many tasks

---

### Task

Fields:

- id
- title
- description
- priority
- status
- board_id
- created_at

Relationships:

- Belongs to a board

Priority values:

- low
- medium
- high

Status values:

- todo
- in_progress
- completed

---

## Authentication

Use JWT authentication.

Implement:

- Password hashing
- Token generation
- Token verification
- Current user dependency

Endpoints:

### POST /auth/register

Register a user.

### POST /auth/login

Return JWT access token.

Users should only access their own resources.

---

## Projects Module

Implement full CRUD.

Endpoints:

- GET /projects
- POST /projects
- GET /projects/{id}
- PUT /projects/{id}
- DELETE /projects/{id}

Users should only access their own projects.

---

## Boards Module

Implement full CRUD.

Endpoints:

- GET /boards
- POST /boards
- GET /boards/{id}
- PUT /boards/{id}
- DELETE /boards/{id}

---

## Tasks Module

Implement full CRUD.

Endpoints:

- GET /tasks
- POST /tasks
- GET /tasks/{id}
- PUT /tasks/{id}
- DELETE /tasks/{id}

---

## Filtering

GET /tasks should support:

- status
- priority

---

## Pagination

GET /tasks should support:

- limit
- offset

---

## Validation

Use Pydantic schemas.

Separate:

- Create schemas
- Update schemas
- Response schemas

Use response_model in routes.

---

## Error Handling

Use HTTPException.

Return appropriate status codes.

Handle:

- Resource not found
- Unauthorized access
- Duplicate email
- Invalid credentials

---

## Database

Use:

- SQLAlchemy ORM
- Alembic migrations
- SessionLocal
- Declarative Base

---

## API Documentation

Swagger docs should be clear.

Use:

- tags
- summaries
- response models

---

## Code Style

Prefer simplicity.

Keep files small.

Avoid service layers unless necessary.

Avoid unnecessary abstractions.

Avoid generic repositories.

Do not overengineer.

Write readable code.

---

## Refactoring

Remove duplication when needed.

Do not change API behavior during refactoring.

---

## Testing

Ensure endpoints work before moving to the next feature.

---

## Git

Use conventional commits.

Examples:

- feat(auth): implement JWT authentication
- feat(projects): implement project CRUD
- feat(boards): implement board CRUD
- feat(tasks): implement task CRUD
- feat(tasks): add filtering and pagination
- refactor: improve API structure

Commit after each completed section.

Wait for the next instruction before implementing additional features.


## Environment

Create a Python virtual environment inside backend/.

Structure:

backend/
    venv/
    app/
    requirements.txt
    .env

Install dependencies inside the virtual environment.

Use requirements.txt to manage packages.

Typical packages:

- fastapi
- uvicorn
- sqlalchemy
- psycopg2-binary
- alembic
- python-jose
- passlib[bcrypt]
- python-multipart
- pydantic-settings

Do not commit venv/.

Add .gitignore for:

- venv/
- __pycache__/
- .env
- *.pyc

Generate requirements.txt.