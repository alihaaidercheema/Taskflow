# TaskFlow Frontend

## Stack

- React
- Vite
- JavaScript
- Tailwind CSS
- shadcn/ui
- React Router
- Axios
- React Hook Form
- Zod
- TanStack Query
- Lucide React

---

## Design Inspiration

- Linear
- Notion
- Vercel
- Jira

Build a premium SaaS application.

Requirements:

- Responsive design
- Dark mode
- Beautiful spacing
- Modern typography
- Smooth transitions
- Subtle shadows
- Rounded corners
- Hover effects
- Loading skeletons
- Empty states
- Error states
- Toast notifications

---

## Layout

### Sidebar

- Logo
- Dashboard
- Projects
- Boards
- Tasks
- Settings
- Logout

Responsive and collapsible.

---

### Header

Contains:

- Search bar
- Theme toggle
- Notifications
- User avatar menu

---

## Authentication

### Login

- Email
- Password
- Validation
- Loading states

### Register

- Username
- Email
- Password
- Validation

JWT authentication.

Use Axios interceptors.

Store token securely.

Protected routes required.

---

## Dashboard

Statistics cards:

- Total Projects
- Active Tasks
- Completed Tasks
- High Priority Tasks

Recent activity section.

---

## Projects

Features:

- Table view
- Search
- Create project dialog
- Edit project dialog
- Delete confirmation

---

## Boards

Features:

- Card layout
- CRUD operations

---

## Tasks

Features:

- Table view
- Card view
- Status badges
- Priority badges
- Search
- Filtering
- Pagination
- Drag and drop
- Create task dialog
- Edit task dialog
- Delete confirmation

---

## Settings

- Profile settings
- Theme preferences

---

## API

Connect to the existing FastAPI backend.

Authentication:

JWT Bearer token.

Endpoints:

POST /auth/register
POST /auth/login

GET /projects
POST /projects
PUT /projects/{id}
DELETE /projects/{id}

GET /boards
POST /boards
PUT /boards/{id}
DELETE /boards/{id}

GET /tasks
POST /tasks
PUT /tasks/{id}
DELETE /tasks/{id}

---

## Components

Use shadcn/ui:

- Card
- Button
- Input
- Badge
- Table
- Dialog
- Dropdown Menu
- Sheet
- Avatar
- Tabs
- Tooltip
- Skeleton
- Toast

---

## Folder Structure

src/

components/
pages/
layouts/
services/
hooks/
context/
lib/
routes/

---

## Code Style

- JavaScript only
- Reusable components
- Maintainable code
- Feature-based structure
- Avoid unnecessary complexity