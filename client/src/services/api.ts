import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('taskflow-token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('taskflow-token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

// Auth API
export const authAPI = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  signup: (data: { name: string; email: string; password: string; role: string }) => api.post('/auth/signup', data),
  me: () => api.get('/auth/me'),
}

// Projects API
export const projectsAPI = {
  getAll: () => api.get('/projects'),
  getOne: (id: string) => api.get(`/projects/${id}`),
  create: (data: { name: string; description: string }) => api.post('/projects', data),
  update: (id: string, data: { name?: string; description?: string }) => api.put(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
  addMember: (id: string, userId: string) => api.post(`/projects/${id}/members`, { userId }),
  removeMember: (id: string, userId: string) => api.delete(`/projects/${id}/members/${userId}`),
}

// Tasks API
export const tasksAPI = {
  getAll: (params?: { project?: string; status?: string; priority?: string; assignedTo?: string }) => 
    api.get('/tasks', { params }),
  getOne: (id: string) => api.get(`/tasks/${id}`),
  create: (data: { 
    title: string; 
    description: string; 
    dueDate: string; 
    priority: string; 
    project: string; 
    assignedTo?: string 
  }) => api.post('/tasks', data),
  update: (id: string, data: Partial<{
    title: string;
    description: string;
    dueDate: string;
    priority: string;
    status: string;
    assignedTo: string;
  }>) => api.put(`/tasks/${id}`, data),
  delete: (id: string) => api.delete(`/tasks/${id}`),
}

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard'),
}

// Users API
export const usersAPI = {
  getAll: () => api.get('/users'),
  getOne: (id: string) => api.get(`/users/${id}`),
  update: (id: string, data: { name?: string; email?: string }) => api.put(`/users/${id}`, data),
}
