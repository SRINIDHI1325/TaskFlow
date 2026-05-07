// Mock data store using localStorage for demo mode
// This allows the app to work without a backend

export interface MockUser {
  _id: string
  name: string
  email: string
  password: string
  role: 'admin' | 'member'
  createdAt: string
}

export interface MockProject {
  _id: string
  name: string
  description: string
  owner: string
  members: string[]
  createdAt: string
}

export interface MockTask {
  _id: string
  title: string
  description: string
  status: 'todo' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  dueDate: string
  project: string
  assignedTo?: string
  createdBy: string
  createdAt: string
}

const STORAGE_KEYS = {
  USERS: 'taskflow-mock-users',
  PROJECTS: 'taskflow-mock-projects',
  TASKS: 'taskflow-mock-tasks',
  CURRENT_USER: 'taskflow-mock-current-user',
}

// Initialize with demo data if empty
function initializeMockData() {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    const demoUsers: MockUser[] = [
      {
        _id: 'user-1',
        name: 'Demo Admin',
        email: 'admin@demo.com',
        password: 'demo123',
        role: 'admin',
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'user-2',
        name: 'Demo Member',
        email: 'member@demo.com',
        password: 'demo123',
        role: 'member',
        createdAt: new Date().toISOString(),
      },
    ]
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(demoUsers))
  }

  if (!localStorage.getItem(STORAGE_KEYS.PROJECTS)) {
    const demoProjects: MockProject[] = [
      {
        _id: 'project-1',
        name: 'Website Redesign',
        description: 'Complete overhaul of the company website with new branding',
        owner: 'user-1',
        members: ['user-1', 'user-2'],
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: 'project-2',
        name: 'Mobile App Development',
        description: 'Build a cross-platform mobile application',
        owner: 'user-1',
        members: ['user-1'],
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(demoProjects))
  }

  if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
    const demoTasks: MockTask[] = [
      {
        _id: 'task-1',
        title: 'Design homepage mockups',
        description: 'Create wireframes and high-fidelity mockups for the new homepage',
        status: 'completed',
        priority: 'high',
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        project: 'project-1',
        assignedTo: 'user-2',
        createdBy: 'user-1',
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: 'task-2',
        title: 'Implement responsive navigation',
        description: 'Build mobile-friendly navigation component with hamburger menu',
        status: 'in-progress',
        priority: 'high',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        project: 'project-1',
        assignedTo: 'user-1',
        createdBy: 'user-1',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: 'task-3',
        title: 'Set up CI/CD pipeline',
        description: 'Configure automated testing and deployment workflow',
        status: 'todo',
        priority: 'medium',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        project: 'project-1',
        createdBy: 'user-1',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: 'task-4',
        title: 'Research React Native vs Flutter',
        description: 'Compare frameworks for mobile app development',
        status: 'completed',
        priority: 'medium',
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        project: 'project-2',
        assignedTo: 'user-1',
        createdBy: 'user-1',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: 'task-5',
        title: 'Set up project structure',
        description: 'Initialize the mobile app project with proper folder structure',
        status: 'in-progress',
        priority: 'high',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        project: 'project-2',
        createdBy: 'user-1',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: 'task-6',
        title: 'Write API documentation',
        description: 'Document all REST API endpoints for the mobile app',
        status: 'todo',
        priority: 'low',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        project: 'project-2',
        createdBy: 'user-1',
        createdAt: new Date().toISOString(),
      },
    ]
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(demoTasks))
  }
}

// Helper functions
function getUsers(): MockUser[] {
  initializeMockData()
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]')
}

function saveUsers(users: MockUser[]) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
}

function getProjects(): MockProject[] {
  initializeMockData()
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECTS) || '[]')
}

function saveProjects(projects: MockProject[]) {
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects))
}

function getTasks(): MockTask[] {
  initializeMockData()
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]')
}

function saveTasks(tasks: MockTask[]) {
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks))
}

function getCurrentUser(): MockUser | null {
  const userData = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
  return userData ? JSON.parse(userData) : null
}

function setCurrentUser(user: MockUser | null) {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user))
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
  }
}

function generateId(): string {
  return 'id-' + Math.random().toString(36).substring(2, 11)
}

// Simulate network delay
function delay(ms: number = 300): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Mock API implementations
export const mockAuthAPI = {
  async login(email: string, password: string) {
    await delay()
    const users = getUsers()
    const user = users.find(u => u.email === email && u.password === password)
    if (!user) {
      throw new Error('Invalid email or password')
    }
    const { password: _, ...safeUser } = user
    setCurrentUser(user)
    return { user: safeUser, token: 'mock-token-' + user._id }
  },

  async signup(data: { name: string; email: string; password: string; role: 'admin' | 'member' }) {
    await delay()
    const users = getUsers()
    if (users.find(u => u.email === data.email)) {
      throw new Error('Email already in use')
    }
    const newUser: MockUser = {
      _id: generateId(),
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
      createdAt: new Date().toISOString(),
    }
    users.push(newUser)
    saveUsers(users)
    const { password: _, ...safeUser } = newUser
    setCurrentUser(newUser)
    return { user: safeUser, token: 'mock-token-' + newUser._id }
  },

  async me() {
    await delay(100)
    const user = getCurrentUser()
    if (!user) {
      throw new Error('Not authenticated')
    }
    const { password: _, ...safeUser } = user
    return { user: safeUser }
  },

  logout() {
    setCurrentUser(null)
  },
}

export const mockProjectsAPI = {
  async getAll() {
    await delay()
    const currentUser = getCurrentUser()
    if (!currentUser) throw new Error('Not authenticated')
    
    const projects = getProjects()
    const users = getUsers()
    const tasks = getTasks()
    
    // Filter projects where user is owner or member
    const userProjects = projects.filter(p => 
      p.owner === currentUser._id || p.members.includes(currentUser._id)
    )
    
    return userProjects.map(p => ({
      ...p,
      owner: users.find(u => u._id === p.owner) || { _id: p.owner, name: 'Unknown' },
      members: p.members.map(mId => users.find(u => u._id === mId) || { _id: mId, name: 'Unknown' }),
      taskCount: tasks.filter(t => t.project === p._id).length,
    }))
  },

  async getOne(id: string) {
    await delay()
    const currentUser = getCurrentUser()
    if (!currentUser) throw new Error('Not authenticated')
    
    const projects = getProjects()
    const project = projects.find(p => p._id === id)
    if (!project) throw new Error('Project not found')
    
    const users = getUsers()
    const tasks = getTasks()
    const projectTasks = tasks.filter(t => t.project === id)
    
    return {
      ...project,
      owner: users.find(u => u._id === project.owner) || { _id: project.owner, name: 'Unknown' },
      members: project.members.map(mId => {
        const user = users.find(u => u._id === mId)
        return user ? { _id: user._id, name: user.name, email: user.email } : { _id: mId, name: 'Unknown' }
      }),
      tasks: projectTasks.map(t => ({
        ...t,
        assignedTo: t.assignedTo ? users.find(u => u._id === t.assignedTo) : undefined,
      })),
    }
  },

  async create(data: { name: string; description: string }) {
    await delay()
    const currentUser = getCurrentUser()
    if (!currentUser) throw new Error('Not authenticated')
    
    const projects = getProjects()
    const newProject: MockProject = {
      _id: generateId(),
      name: data.name,
      description: data.description,
      owner: currentUser._id,
      members: [currentUser._id],
      createdAt: new Date().toISOString(),
    }
    projects.push(newProject)
    saveProjects(projects)
    return newProject
  },

  async update(id: string, data: { name?: string; description?: string }) {
    await delay()
    const projects = getProjects()
    const index = projects.findIndex(p => p._id === id)
    if (index === -1) throw new Error('Project not found')
    
    projects[index] = { ...projects[index], ...data }
    saveProjects(projects)
    return projects[index]
  },

  async delete(id: string) {
    await delay()
    const projects = getProjects()
    const tasks = getTasks()
    
    const filtered = projects.filter(p => p._id !== id)
    saveProjects(filtered)
    
    // Also delete associated tasks
    const filteredTasks = tasks.filter(t => t.project !== id)
    saveTasks(filteredTasks)
    
    return { success: true }
  },

  async addMember(projectId: string, userId: string) {
    await delay()
    const projects = getProjects()
    const index = projects.findIndex(p => p._id === projectId)
    if (index === -1) throw new Error('Project not found')
    
    if (!projects[index].members.includes(userId)) {
      projects[index].members.push(userId)
      saveProjects(projects)
    }
    return projects[index]
  },

  async removeMember(projectId: string, userId: string) {
    await delay()
    const projects = getProjects()
    const index = projects.findIndex(p => p._id === projectId)
    if (index === -1) throw new Error('Project not found')
    
    projects[index].members = projects[index].members.filter(m => m !== userId)
    saveProjects(projects)
    return projects[index]
  },
}

export const mockTasksAPI = {
  async getAll(params?: { project?: string; status?: string; priority?: string; assignedTo?: string }) {
    await delay()
    const currentUser = getCurrentUser()
    if (!currentUser) throw new Error('Not authenticated')
    
    const projects = getProjects()
    const users = getUsers()
    let tasks = getTasks()
    
    // Get user's projects
    const userProjectIds = projects
      .filter(p => p.owner === currentUser._id || p.members.includes(currentUser._id))
      .map(p => p._id)
    
    // Filter tasks to only user's projects
    tasks = tasks.filter(t => userProjectIds.includes(t.project))
    
    // Apply filters
    if (params?.project) {
      tasks = tasks.filter(t => t.project === params.project)
    }
    if (params?.status) {
      tasks = tasks.filter(t => t.status === params.status)
    }
    if (params?.priority) {
      tasks = tasks.filter(t => t.priority === params.priority)
    }
    if (params?.assignedTo) {
      tasks = tasks.filter(t => t.assignedTo === params.assignedTo)
    }
    
    return tasks.map(t => ({
      ...t,
      project: projects.find(p => p._id === t.project) || { _id: t.project, name: 'Unknown Project' },
      assignedTo: t.assignedTo ? users.find(u => u._id === t.assignedTo) : undefined,
    }))
  },

  async create(data: { 
    title: string; 
    description: string; 
    dueDate: string; 
    priority: string; 
    project: string; 
    assignedTo?: string 
  }) {
    await delay()
    const currentUser = getCurrentUser()
    if (!currentUser) throw new Error('Not authenticated')
    
    const tasks = getTasks()
    const newTask: MockTask = {
      _id: generateId(),
      title: data.title,
      description: data.description,
      status: 'todo',
      priority: data.priority as 'low' | 'medium' | 'high',
      dueDate: data.dueDate,
      project: data.project,
      assignedTo: data.assignedTo,
      createdBy: currentUser._id,
      createdAt: new Date().toISOString(),
    }
    tasks.push(newTask)
    saveTasks(tasks)
    return newTask
  },

  async update(id: string, data: Partial<MockTask>) {
    await delay()
    const tasks = getTasks()
    const index = tasks.findIndex(t => t._id === id)
    if (index === -1) throw new Error('Task not found')
    
    tasks[index] = { ...tasks[index], ...data }
    saveTasks(tasks)
    return tasks[index]
  },

  async delete(id: string) {
    await delay()
    const tasks = getTasks()
    const filtered = tasks.filter(t => t._id !== id)
    saveTasks(filtered)
    return { success: true }
  },
}

export const mockDashboardAPI = {
  async getStats() {
    await delay()
    const currentUser = getCurrentUser()
    if (!currentUser) throw new Error('Not authenticated')
    
    const projects = getProjects()
    const tasks = getTasks()
    
    // Get user's projects
    const userProjectIds = projects
      .filter(p => p.owner === currentUser._id || p.members.includes(currentUser._id))
      .map(p => p._id)
    
    const userTasks = tasks.filter(t => userProjectIds.includes(t.project))
    
    const todoTasks = userTasks.filter(t => t.status === 'todo')
    const inProgressTasks = userTasks.filter(t => t.status === 'in-progress')
    const completedTasks = userTasks.filter(t => t.status === 'completed')
    
    const now = new Date()
    const overdueTasks = userTasks.filter(t => 
      t.status !== 'completed' && new Date(t.dueDate) < now
    )
    
    // Tasks due soon (next 3 days)
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
    const upcomingTasks = userTasks
      .filter(t => t.status !== 'completed' && new Date(t.dueDate) <= threeDaysFromNow && new Date(t.dueDate) >= now)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5)
    
    // Recent tasks
    const recentTasks = [...userTasks]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
    
    return {
      totalProjects: userProjectIds.length,
      totalTasks: userTasks.length,
      todoTasks: todoTasks.length,
      inProgressTasks: inProgressTasks.length,
      completedTasks: completedTasks.length,
      overdueTasks: overdueTasks.length,
      upcomingTasks: upcomingTasks.map(t => ({
        ...t,
        project: projects.find(p => p._id === t.project) || { _id: t.project, name: 'Unknown' },
      })),
      recentTasks: recentTasks.map(t => ({
        ...t,
        project: projects.find(p => p._id === t.project) || { _id: t.project, name: 'Unknown' },
      })),
    }
  },
}

export const mockUsersAPI = {
  async getAll() {
    await delay()
    const users = getUsers()
    return users.map(({ password: _, ...user }) => user)
  },

  async update(id: string, data: { name?: string; email?: string }) {
    await delay()
    const users = getUsers()
    const index = users.findIndex(u => u._id === id)
    if (index === -1) throw new Error('User not found')
    
    users[index] = { ...users[index], ...data }
    saveUsers(users)
    
    // Update current user if same
    const currentUser = getCurrentUser()
    if (currentUser && currentUser._id === id) {
      setCurrentUser(users[index])
    }
    
    const { password: _, ...safeUser } = users[index]
    return safeUser
  },
}

// Initialize on import
initializeMockData()
