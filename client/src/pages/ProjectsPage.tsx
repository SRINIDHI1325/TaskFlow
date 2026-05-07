import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { mockProjectsAPI } from '../services/mockData'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { Avatar } from '../components/ui/Avatar'
import { toast } from '../components/ui/Toaster'
import { Plus, FolderKanban, Users, CheckCircle, Clock, Search, MoreVertical, Pencil, Trash2 } from 'lucide-react'

interface Project {
  _id: string
  name: string
  description: string
  admin: { _id: string; name: string; email: string }
  members: { _id: string; name: string; email: string }[]
  taskStats: {
    total: number
    todo: number
    'in-progress': number
    done: number
  }
  createdAt: string
}

export default function ProjectsPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    const filtered = projects.filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredProjects(filtered)
  }, [searchQuery, projects])

  const fetchProjects = async () => {
    try {
      const response = await mockProjectsAPI.getAll()
      const transformedProjects = response.map((p: any) => ({
        ...p,
        admin: p.owner,
        taskStats: { total: p.taskCount || 0, todo: 0, 'in-progress': 0, done: 0 },
      }))
      setProjects(transformedProjects)
      setFilteredProjects(transformedProjects)
    } catch (error) {
      toast.error('Failed to load projects')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedProject) return
    try {
      await mockProjectsAPI.delete(selectedProject._id)
      setProjects((prev) => prev.filter((p) => p._id !== selectedProject._id))
      toast.success('Project deleted successfully')
      setIsDeleteModalOpen(false)
      setSelectedProject(null)
    } catch {
      toast.error('Failed to delete project')
    }
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
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground">Manage your team projects</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <FolderKanban className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'Try a different search term' : 'Get started by creating your first project'}
            </p>
            {isAdmin && !searchQuery && (
              <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Create Project
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <Card key={project._id} className="hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <Link to={`/projects/${project._id}`}>
                      <CardTitle className="text-lg hover:text-primary transition-colors truncate">
                        {project.name}
                      </CardTitle>
                    </Link>
                    <CardDescription className="line-clamp-2 mt-1">
                      {project.description || 'No description'}
                    </CardDescription>
                  </div>
                  {isAdmin && project.admin._id === user?._id && (
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === project._id ? null : project._id)}
                        className="p-1 hover:bg-accent rounded-md transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-muted-foreground" />
                      </button>
                      {openMenuId === project._id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                          <div className="absolute right-0 mt-1 w-36 bg-popover border border-border rounded-lg shadow-lg z-20">
                            <button
                              onClick={() => {
                                setSelectedProject(project)
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
                                setSelectedProject(project)
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
              </CardHeader>
              <CardContent>
                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center p-2 rounded-lg bg-muted/50">
                    <p className="text-lg font-semibold text-foreground">{project.taskStats.total}</p>
                    <p className="text-xs text-muted-foreground">Tasks</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-warning/10">
                    <p className="text-lg font-semibold text-warning">{project.taskStats['in-progress']}</p>
                    <p className="text-xs text-muted-foreground">In Progress</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-success/10">
                    <p className="text-lg font-semibold text-success">{project.taskStats.done}</p>
                    <p className="text-xs text-muted-foreground">Done</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Progress</span>
                    <span>
                      {project.taskStats.total > 0
                        ? Math.round((project.taskStats.done / project.taskStats.total) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{
                        width: `${
                          project.taskStats.total > 0
                            ? (project.taskStats.done / project.taskStats.total) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                {/* Members */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{project.members.length} members</span>
                  </div>
                  <div className="flex -space-x-2">
                    {project.members.slice(0, 3).map((member) => (
                      <Avatar key={member._id} name={member.name} size="sm" className="ring-2 ring-card" />
                    ))}
                    {project.members.length > 3 && (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground ring-2 ring-card">
                        +{project.members.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={(project) => {
          setProjects((prev) => [project, ...prev])
          setIsCreateModalOpen(false)
        }}
      />

      {/* Edit Project Modal */}
      {selectedProject && (
        <EditProjectModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedProject(null)
          }}
          project={selectedProject}
          onSuccess={(updated) => {
            setProjects((prev) => prev.map((p) => (p._id === updated._id ? { ...p, ...updated } : p)))
            setIsEditModalOpen(false)
            setSelectedProject(null)
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedProject(null)
        }}
        title="Delete Project"
      >
        <p className="text-muted-foreground mb-6">
          Are you sure you want to delete <strong>{selectedProject?.name}</strong>? This will also delete all tasks in this project. This action cannot be undone.
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

// Create Project Modal Component
function CreateProjectModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean
  onClose: () => void
  onSuccess: (project: Project) => void
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      setErrors({ name: 'Project name is required' })
      return
    }

    setIsLoading(true)
    try {
      const response = await mockProjectsAPI.create(formData)
      toast.success('Project created successfully')
      onSuccess({ ...response, admin: { _id: 'user-1', name: 'Demo Admin', email: 'admin@demo.com' }, members: [], taskStats: { total: 0, todo: 0, 'in-progress': 0, done: 0 } } as Project)
      setFormData({ name: '', description: '' })
    } catch {
      toast.error('Failed to create project')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Project">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="name"
          label="Project Name"
          placeholder="Enter project name"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          error={errors.name}
        />
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1.5">
            Description
          </label>
          <textarea
            id="description"
            placeholder="Enter project description (optional)"
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            className="w-full h-24 px-3 py-2 rounded-lg border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// Edit Project Modal Component
function EditProjectModal({
  isOpen,
  onClose,
  project,
  onSuccess,
}: {
  isOpen: boolean
  onClose: () => void
  project: Project
  onSuccess: (project: Project) => void
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({ name: project.name, description: project.description })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setFormData({ name: project.name, description: project.description })
  }, [project])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      setErrors({ name: 'Project name is required' })
      return
    }

    setIsLoading(true)
    try {
      const response = await mockProjectsAPI.update(project._id, formData)
      toast.success('Project updated successfully')
      onSuccess({ ...project, ...response } as Project)
    } catch {
      toast.error('Failed to update project')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Project">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="edit-name"
          label="Project Name"
          placeholder="Enter project name"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          error={errors.name}
        />
        <div>
          <label htmlFor="edit-description" className="block text-sm font-medium text-foreground mb-1.5">
            Description
          </label>
          <textarea
            id="edit-description"
            placeholder="Enter project description (optional)"
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            className="w-full h-24 px-3 py-2 rounded-lg border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
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
