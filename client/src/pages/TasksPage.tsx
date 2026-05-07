import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { mockTasksAPI, mockProjectsAPI } from '../services/mockData'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Card, CardContent } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { Avatar } from '../components/ui/Avatar'
import { PriorityBadge, StatusBadge } from '../components/ui/Badge'
import { toast } from '../components/ui/Toaster'
import { formatDate, formatRelativeDate, isOverdue } from '../lib/utils'
import {
  Search,
  Filter,
  SortAsc,
  CheckSquare,
  Calendar,
  FolderKanban,
  MoreVertical,
  Pencil,
  Trash2,
  Clock,
  X,
} from 'lucide-react'

interface Member {
  _id: string
  name: string
  email: string
  role: 'admin' | 'member'
}

interface Task {
  _id: string
  title: string
  description: string
  dueDate: string
  priority: 'low' | 'medium' | 'high'
  status: 'todo' | 'in-progress' | 'done'
  assignedTo?: Member
  project: { _id: string; name: string }
  createdBy: Member
  createdAt: string
}

interface Project {
  _id: string
  name: string
  members: Member[]
}

export default function TasksPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    project: '',
  })
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'createdAt'>('dueDate')
  const [showFilters, setShowFilters] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  useEffect(() => {
    fetchTasks()
    fetchProjects()
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await mockTasksAPI.getAll()
      setTasks(response as Task[])
    } catch {
      toast.error('Failed to load tasks')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchProjects = async () => {
    try {
      const response = await mockProjectsAPI.getAll()
      setProjects(response.map((p: any) => ({ _id: p._id, name: p.name, members: p.members || [] })))
    } catch {
      // Silent fail
    }
  }

  const handleStatusChange = async (taskId: string, status: string) => {
    try {
      const response = await mockTasksAPI.update(taskId, { status: status as any })
      const task = tasks.find(t => t._id === taskId)
      if (task) {
        setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, status: status as any } : t)))
      }
      toast.success('Task status updated')
    } catch {
      toast.error('Failed to update task status')
    }
  }

  const handleDelete = async () => {
    if (!selectedTask) return
    try {
      await mockTasksAPI.delete(selectedTask._id)
      setTasks((prev) => prev.filter((t) => t._id !== selectedTask._id))
      toast.success('Task deleted successfully')
      setIsDeleteModalOpen(false)
      setSelectedTask(null)
    } catch {
      toast.error('Failed to delete task')
    }
  }

  // Filter and sort tasks
  const filteredTasks = tasks
    .filter((task) => {
      if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !task.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      if (filters.status && task.status !== filters.status) return false
      if (filters.priority && task.priority !== filters.priority) return false
      if (filters.project && task.project._id !== filters.project) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'dueDate') {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      }
      if (sortBy === 'priority') {
        const priorityOrder = { high: 0, medium: 1, low: 2 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  const activeFiltersCount = Object.values(filters).filter(Boolean).length

  const clearFilters = () => {
    setFilters({ status: '', priority: '', project: '' })
    setSearchQuery('')
  }

  const isAdmin = user?.role === 'admin'

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tasks</h1>
          <p className="text-muted-foreground">View and manage all your tasks</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={showFilters ? 'default' : 'outline'}
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary-foreground text-primary rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </Button>
          <Select
            id="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            options={[
              { value: 'dueDate', label: 'Due Date' },
              { value: 'priority', label: 'Priority' },
              { value: 'createdAt', label: 'Created' },
            ]}
          />
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <Card className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="w-40">
              <Select
                id="filter-status"
                label="Status"
                value={filters.status}
                onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                options={[
                  { value: '', label: 'All Statuses' },
                  { value: 'todo', label: 'To Do' },
                  { value: 'in-progress', label: 'In Progress' },
                  { value: 'done', label: 'Done' },
                ]}
              />
            </div>
            <div className="w-40">
              <Select
                id="filter-priority"
                label="Priority"
                value={filters.priority}
                onChange={(e) => setFilters((prev) => ({ ...prev, priority: e.target.value }))}
                options={[
                  { value: '', label: 'All Priorities' },
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                ]}
              />
            </div>
            <div className="w-48">
              <Select
                id="filter-project"
                label="Project"
                value={filters.project}
                onChange={(e) => setFilters((prev) => ({ ...prev, project: e.target.value }))}
                options={[
                  { value: '', label: 'All Projects' },
                  ...projects.map((p) => ({ value: p._id, label: p.name })),
                ]}
              />
            </div>
            {activeFiltersCount > 0 && (
              <div className="flex items-end">
                <Button variant="ghost" onClick={clearFilters} className="gap-2">
                  <X className="w-4 h-4" />
                  Clear
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No tasks found</h3>
            <p className="text-muted-foreground">
              {searchQuery || activeFiltersCount > 0
                ? 'Try adjusting your filters'
                : 'Tasks from your projects will appear here'}
            </p>
            {(searchQuery || activeFiltersCount > 0) && (
              <Button variant="outline" onClick={clearFilters} className="mt-4">
                Clear Filters
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <Card key={task._id} className="hover:border-primary/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Task Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">{task.title}</h3>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      <StatusBadge status={task.status} />
                      <PriorityBadge priority={task.priority} />
                      
                      <div className={`flex items-center gap-1 text-sm ${isOverdue(task.dueDate) && task.status !== 'done' ? 'text-destructive' : 'text-muted-foreground'}`}>
                        <Calendar className="w-4 h-4" />
                        {formatRelativeDate(task.dueDate)}
                      </div>

                      <Link 
                        to={`/projects/${task.project._id}`}
                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        <FolderKanban className="w-4 h-4" />
                        {task.project.name}
                      </Link>

                      {task.assignedTo && (
                        <div className="flex items-center gap-2">
                          <Avatar name={task.assignedTo.name} size="sm" />
                          <span className="text-sm text-muted-foreground">{task.assignedTo.name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {/* Status Change */}
                    {(isAdmin || task.assignedTo?._id === user?._id) && (
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                        className="text-sm px-2 py-1 rounded border border-input bg-background"
                      >
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                    )}

                    {/* Menu */}
                    {isAdmin && (
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === task._id ? null : task._id)}
                          className="p-1 hover:bg-accent rounded-md transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-muted-foreground" />
                        </button>
                        {openMenuId === task._id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                            <div className="absolute right-0 mt-1 w-36 bg-popover border border-border rounded-lg shadow-lg z-20">
                              <button
                                onClick={() => {
                                  setSelectedTask(task)
                                  setIsEditModalOpen(true)
                                  setOpenMenuId(null)
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-t-lg transition-colors"
                              >
                                <Pencil className="w-4 h-4" />
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedTask(task)
                                  setIsDeleteModalOpen(true)
                                  setOpenMenuId(null)
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-b-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Task Modal */}
      {selectedTask && (
        <EditTaskModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedTask(null)
          }}
          task={selectedTask}
          projects={projects}
          onSuccess={(updatedTask) => {
            setTasks((prev) => prev.map((t) => (t._id === updatedTask._id ? updatedTask : t)))
            setIsEditModalOpen(false)
            setSelectedTask(null)
          }}
        />
      )}

      {/* Delete Confirmation */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedTask(null)
        }}
        title="Delete Task"
      >
        <p className="text-muted-foreground mb-6">
          Are you sure you want to delete <strong>{selectedTask?.title}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  )
}

// Edit Task Modal
function EditTaskModal({
  isOpen,
  onClose,
  task,
  projects,
  onSuccess,
}: {
  isOpen: boolean
  onClose: () => void
  task: Task
  projects: Project[]
  onSuccess: (task: Task) => void
}) {
  const [isLoading, setIsLoading] = useState(false)
  const currentProject = projects.find((p) => p._id === task.project._id)
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description,
    dueDate: task.dueDate.split('T')[0],
    priority: task.priority,
    status: task.status,
    assignedTo: task.assignedTo?._id || '',
  })

  useEffect(() => {
    setFormData({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate.split('T')[0],
      priority: task.priority,
      status: task.status,
      assignedTo: task.assignedTo?._id || '',
    })
  }, [task])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await tasksAPI.update(task._id, {
        ...formData,
        assignedTo: formData.assignedTo || undefined,
      })
      toast.success('Task updated successfully')
      onSuccess(response.data.task)
    } catch {
      toast.error('Failed to update task')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Task">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="edit-task-title"
          label="Title"
          placeholder="Enter task title"
          value={formData.title}
          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
        />
        <div>
          <label htmlFor="edit-task-description" className="block text-sm font-medium text-foreground mb-1.5">
            Description
          </label>
          <textarea
            id="edit-task-description"
            placeholder="Enter task description"
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            className="w-full h-20 px-3 py-2 rounded-lg border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Input
          id="edit-task-dueDate"
          type="date"
          label="Due Date"
          value={formData.dueDate}
          onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
        />
        <Select
          id="edit-task-priority"
          label="Priority"
          value={formData.priority}
          onChange={(e) => setFormData((prev) => ({ ...prev, priority: e.target.value }))}
          options={[
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
          ]}
        />
        <Select
          id="edit-task-status"
          label="Status"
          value={formData.status}
          onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
          options={[
            { value: 'todo', label: 'To Do' },
            { value: 'in-progress', label: 'In Progress' },
            { value: 'done', label: 'Done' },
          ]}
        />
        {currentProject && (
          <Select
            id="edit-task-assignedTo"
            label="Assign To"
            value={formData.assignedTo}
            onChange={(e) => setFormData((prev) => ({ ...prev, assignedTo: e.target.value }))}
            options={[
              { value: '', label: 'Unassigned' },
              ...currentProject.members.map((m) => ({ value: m._id, label: m.name })),
            ]}
          />
        )}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  )
}
