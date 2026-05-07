import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { projectsAPI, tasksAPI, usersAPI } from '../services/api'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { Avatar } from '../components/ui/Avatar'
import { Badge, PriorityBadge, StatusBadge, RoleBadge } from '../components/ui/Badge'
import { toast } from '../components/ui/Toaster'
import { formatDate, formatRelativeDate, isOverdue } from '../lib/utils'
import {
  ArrowLeft,
  Plus,
  Users,
  CheckSquare,
  Calendar,
  MoreVertical,
  Pencil,
  Trash2,
  UserPlus,
  UserMinus,
  Clock,
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
  description: string
  admin: Member
  members: Member[]
  createdAt: string
}

export default function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [allUsers, setAllUsers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false)
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false)
  const [isDeleteTaskModalOpen, setIsDeleteTaskModalOpen] = useState(false)
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [openTaskMenuId, setOpenTaskMenuId] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      fetchProjectDetails()
      fetchAllUsers()
    }
  }, [id])

  const fetchProjectDetails = async () => {
    try {
      const response = await projectsAPI.getOne(id!)
      setProject(response.data.project)
      setTasks(response.data.tasks)
    } catch {
      toast.error('Failed to load project')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAllUsers = async () => {
    try {
      const response = await usersAPI.getAll()
      setAllUsers(response.data)
    } catch {
      // Silent fail
    }
  }

  const handleDeleteTask = async () => {
    if (!selectedTask) return
    try {
      await tasksAPI.delete(selectedTask._id)
      setTasks((prev) => prev.filter((t) => t._id !== selectedTask._id))
      toast.success('Task deleted successfully')
      setIsDeleteTaskModalOpen(false)
      setSelectedTask(null)
    } catch {
      toast.error('Failed to delete task')
    }
  }

  const handleStatusChange = async (taskId: string, status: string) => {
    try {
      const response = await tasksAPI.update(taskId, { status })
      setTasks((prev) => prev.map((t) => (t._id === taskId ? response.data.task : t)))
      toast.success('Task status updated')
    } catch {
      toast.error('Failed to update task status')
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!project) return
    try {
      await projectsAPI.removeMember(project._id, memberId)
      setProject((prev) => prev ? { ...prev, members: prev.members.filter((m) => m._id !== memberId) } : null)
      toast.success('Member removed successfully')
    } catch {
      toast.error('Failed to remove member')
    }
  }

  const isAdmin = user?.role === 'admin'
  const isProjectAdmin = project?.admin._id === user?._id

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-foreground mb-2">Project not found</h2>
        <Link to="/projects">
          <Button variant="outline">Back to Projects</Button>
        </Link>
      </div>
    )
  }

  const tasksByStatus = {
    todo: tasks.filter((t) => t.status === 'todo'),
    'in-progress': tasks.filter((t) => t.status === 'in-progress'),
    done: tasks.filter((t) => t.status === 'done'),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/projects" className="p-2 hover:bg-accent rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
          <p className="text-muted-foreground">{project.description || 'No description'}</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setIsCreateTaskModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Task
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content - Task Board */}
        <div className="lg:col-span-3 space-y-4">
          {/* Task Board */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['todo', 'in-progress', 'done'] as const).map((status) => (
              <div key={status} className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground capitalize">
                    {status === 'in-progress' ? 'In Progress' : status === 'todo' ? 'To Do' : 'Done'}
                  </h3>
                  <Badge variant="secondary">{tasksByStatus[status].length}</Badge>
                </div>
                <div className="space-y-2 min-h-[200px] p-2 bg-muted/30 rounded-lg">
                  {tasksByStatus[status].length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No tasks</p>
                  ) : (
                    tasksByStatus[status].map((task) => (
                      <Card key={task._id} className="bg-card hover:border-primary/50 transition-colors">
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-medium text-sm text-foreground line-clamp-2">{task.title}</h4>
                            {(isAdmin || task.assignedTo?._id === user?._id) && (
                              <div className="relative">
                                <button
                                  onClick={() => setOpenTaskMenuId(openTaskMenuId === task._id ? null : task._id)}
                                  className="p-1 hover:bg-accent rounded-md transition-colors"
                                >
                                  <MoreVertical className="w-3 h-3 text-muted-foreground" />
                                </button>
                                {openTaskMenuId === task._id && (
                                  <>
                                    <div className="fixed inset-0 z-10" onClick={() => setOpenTaskMenuId(null)} />
                                    <div className="absolute right-0 mt-1 w-40 bg-popover border border-border rounded-lg shadow-lg z-20">
                                      {isAdmin && (
                                        <button
                                          onClick={() => {
                                            setSelectedTask(task)
                                            setIsEditTaskModalOpen(true)
                                            setOpenTaskMenuId(null)
                                          }}
                                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
                                        >
                                          <Pencil className="w-4 h-4" />
                                          Edit
                                        </button>
                                      )}
                                      {isAdmin && (
                                        <button
                                          onClick={() => {
                                            setSelectedTask(task)
                                            setIsDeleteTaskModalOpen(true)
                                            setOpenTaskMenuId(null)
                                          }}
                                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                          Delete
                                        </button>
                                      )}
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                          {task.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-3">
                            <PriorityBadge priority={task.priority} />
                            <div className={`flex items-center gap-1 text-xs ${isOverdue(task.dueDate) && task.status !== 'done' ? 'text-destructive' : 'text-muted-foreground'}`}>
                              <Clock className="w-3 h-3" />
                              {formatRelativeDate(task.dueDate)}
                            </div>
                          </div>
                          {task.assignedTo && (
                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border">
                              <Avatar name={task.assignedTo.name} size="sm" />
                              <span className="text-xs text-muted-foreground truncate">{task.assignedTo.name}</span>
                            </div>
                          )}
                          {/* Status change for assigned members */}
                          {(isAdmin || task.assignedTo?._id === user?._id) && (
                            <div className="mt-2 pt-2 border-t border-border">
                              <select
                                value={task.status}
                                onChange={(e) => handleStatusChange(task._id, e.target.value)}
                                className="w-full text-xs px-2 py-1 rounded border border-input bg-background"
                              >
                                <option value="todo">To Do</option>
                                <option value="in-progress">In Progress</option>
                                <option value="done">Done</option>
                              </select>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar - Team Members */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Team Members</CardTitle>
                {isProjectAdmin && (
                  <button
                    onClick={() => setIsAddMemberModalOpen(true)}
                    className="p-1 hover:bg-accent rounded-md transition-colors"
                  >
                    <UserPlus className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {project.members.map((member) => (
                  <div key={member._id} className="flex items-center gap-3">
                    <Avatar name={member.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{member.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {member._id === project.admin._id && <RoleBadge role="admin" />}
                      {isProjectAdmin && member._id !== project.admin._id && (
                        <button
                          onClick={() => handleRemoveMember(member._id)}
                          className="p-1 hover:bg-destructive/10 rounded-md transition-colors"
                        >
                          <UserMinus className="w-4 h-4 text-destructive" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Project Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Project Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Created {formatDate(project.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{project.members.length} members</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckSquare className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{tasks.length} tasks</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        projectId={project._id}
        members={project.members}
        onSuccess={(task) => {
          setTasks((prev) => [task, ...prev])
          setIsCreateTaskModalOpen(false)
        }}
      />

      {/* Edit Task Modal */}
      {selectedTask && (
        <EditTaskModal
          isOpen={isEditTaskModalOpen}
          onClose={() => {
            setIsEditTaskModalOpen(false)
            setSelectedTask(null)
          }}
          task={selectedTask}
          members={project.members}
          onSuccess={(updatedTask) => {
            setTasks((prev) => prev.map((t) => (t._id === updatedTask._id ? updatedTask : t)))
            setIsEditTaskModalOpen(false)
            setSelectedTask(null)
          }}
        />
      )}

      {/* Delete Task Confirmation */}
      <Modal
        isOpen={isDeleteTaskModalOpen}
        onClose={() => {
          setIsDeleteTaskModalOpen(false)
          setSelectedTask(null)
        }}
        title="Delete Task"
      >
        <p className="text-muted-foreground mb-6">
          Are you sure you want to delete <strong>{selectedTask?.title}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setIsDeleteTaskModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDeleteTask}>
            Delete
          </Button>
        </div>
      </Modal>

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        projectId={project._id}
        currentMembers={project.members}
        allUsers={allUsers}
        onSuccess={(updatedProject) => {
          setProject(updatedProject)
          setIsAddMemberModalOpen(false)
        }}
      />
    </div>
  )
}

// Create Task Modal
function CreateTaskModal({
  isOpen,
  onClose,
  projectId,
  members,
  onSuccess,
}: {
  isOpen: boolean
  onClose: () => void
  projectId: string
  members: Member[]
  onSuccess: (task: Task) => void
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    assignedTo: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.dueDate) {
      toast.error('Title and due date are required')
      return
    }

    setIsLoading(true)
    try {
      const response = await tasksAPI.create({
        ...formData,
        project: projectId,
        assignedTo: formData.assignedTo || undefined,
      })
      toast.success('Task created successfully')
      onSuccess(response.data.task)
      setFormData({ title: '', description: '', dueDate: '', priority: 'medium', assignedTo: '' })
    } catch {
      toast.error('Failed to create task')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Task">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="task-title"
          label="Title"
          placeholder="Enter task title"
          value={formData.title}
          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
        />
        <div>
          <label htmlFor="task-description" className="block text-sm font-medium text-foreground mb-1.5">
            Description
          </label>
          <textarea
            id="task-description"
            placeholder="Enter task description"
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            className="w-full h-20 px-3 py-2 rounded-lg border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Input
          id="task-dueDate"
          type="date"
          label="Due Date"
          value={formData.dueDate}
          onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
        />
        <Select
          id="task-priority"
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
          id="task-assignedTo"
          label="Assign To"
          value={formData.assignedTo}
          onChange={(e) => setFormData((prev) => ({ ...prev, assignedTo: e.target.value }))}
          options={[
            { value: '', label: 'Unassigned' },
            ...members.map((m) => ({ value: m._id, label: m.name })),
          ]}
        />
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// Edit Task Modal
function EditTaskModal({
  isOpen,
  onClose,
  task,
  members,
  onSuccess,
}: {
  isOpen: boolean
  onClose: () => void
  task: Task
  members: Member[]
  onSuccess: (task: Task) => void
}) {
  const [isLoading, setIsLoading] = useState(false)
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
        <Select
          id="edit-task-assignedTo"
          label="Assign To"
          value={formData.assignedTo}
          onChange={(e) => setFormData((prev) => ({ ...prev, assignedTo: e.target.value }))}
          options={[
            { value: '', label: 'Unassigned' },
            ...members.map((m) => ({ value: m._id, label: m.name })),
          ]}
        />
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

// Add Member Modal
function AddMemberModal({
  isOpen,
  onClose,
  projectId,
  currentMembers,
  allUsers,
  onSuccess,
}: {
  isOpen: boolean
  onClose: () => void
  projectId: string
  currentMembers: Member[]
  allUsers: Member[]
  onSuccess: (project: Project) => void
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')

  const availableUsers = allUsers.filter((u) => !currentMembers.some((m) => m._id === u._id))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUserId) {
      toast.error('Please select a user')
      return
    }

    setIsLoading(true)
    try {
      const response = await projectsAPI.addMember(projectId, selectedUserId)
      toast.success('Member added successfully')
      onSuccess(response.data.project)
      setSelectedUserId('')
    } catch {
      toast.error('Failed to add member')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Team Member">
      {availableUsers.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-muted-foreground">All users are already members of this project.</p>
          <Button variant="outline" onClick={onClose} className="mt-4">
            Close
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            id="add-member"
            label="Select User"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            options={[
              { value: '', label: 'Select a user...' },
              ...availableUsers.map((u) => ({ value: u._id, label: `${u.name} (${u.email})` })),
            ]}
          />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              Add Member
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
