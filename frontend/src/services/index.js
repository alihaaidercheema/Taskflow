import api from "./api";

export const authService = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => {
    // FastAPI OAuth2 expects form data for /auth/login
    const formData = new URLSearchParams();
    formData.append("username", data.email);
    formData.append("password", data.password);
    return api.post("/auth/login", formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
  },
};

export const projectsService = {
  getAll: (params) => api.get("/projects", { params }),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post("/projects", data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
};

export const boardsService = {
  getAll: (params) => api.get("/boards", { params }),
  getById: (id) => api.get(`/boards/${id}`),
  create: (data) => api.post("/boards", data),
  update: (id, data) => api.put(`/boards/${id}`, data),
  delete: (id) => api.delete(`/boards/${id}`),
};

export const tasksService = {
  getAll: (params) => api.get("/tasks", { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post("/tasks", data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
};
