import { Router, Response } from 'express'
import Task from '../models/Task'
import Project from '../models/Project'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()

// Apply auth to all routes
router.use(authenticate)

// Get all tasks (filtered by user access)
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { project, status, priority, assignedTo, search } = req.query

    // Get projects user has access to
    const userProjects = await Project.find({
      $or: [
        { admin: req.user!._id },
        { members: req.user!._id },
      ],
    }).select('_id')

    const projectIds = userProjects.map((p) => p._id)

    // Build query
    const query: Record<string, unknown> = {
      project: { $in: projectIds },
    }

    if (project) query.project = project
    if (status) query.status = status
    if (priority) query.priority = priority
    if (assignedTo) query.assignedTo = assignedTo
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ]
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email role')
      .populate('project', 'name')
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 })

    res.json(tasks)
  } catch (error) {
    const err = error as Error
    res.status(500).json({ message: err.message || 'Error fetching tasks' })
  }
})

// Get single task
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email role')
      .populate('project', 'name admin members')
      .populate('createdBy', 'name email role')

    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    // Check project access
    const project = await Project.findById(task.project)
    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    const isMember = project.members.some((m) => m.equals(req.user!._id))
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' })
    }

    res.json(task)
  } catch (error) {
    const err = error as Error
    res.status(500).json({ message: err.message || 'Error fetching task' })
  }
})

// Create task (admin only)
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, dueDate, priority, project: projectId, assignedTo } = req.body

    // Check project exists and user is admin
    const project = await Project.findById(projectId)
    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    // Only admins can create tasks
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create tasks' })
    }

    // Check if assignedTo user is a member
    if (assignedTo && !project.members.some((m) => m.toString() === assignedTo)) {
      return res.status(400).json({ message: 'Assigned user must be a project member' })
    }

    const task = new Task({
      title,
      description,
      dueDate,
      priority: priority || 'medium',
      project: projectId,
      assignedTo,
      createdBy: req.user!._id,
    })

    await task.save()
    await task.populate('assignedTo', 'name email role')
    await task.populate('project', 'name')
    await task.populate('createdBy', 'name email role')

    res.status(201).json({
      message: 'Task created successfully',
      task,
    })
  } catch (error) {
    const err = error as Error
    res.status(500).json({ message: err.message || 'Error creating task' })
  }
})

// Update task
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, dueDate, priority, status, assignedTo } = req.body

    const task = await Task.findById(req.params.id)
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    // Get project for access check
    const project = await Project.findById(task.project)
    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    const isAdmin = req.user!.role === 'admin'
    const isAssigned = task.assignedTo?.equals(req.user!._id)

    // Members can only update status of their assigned tasks
    if (!isAdmin && !isAssigned) {
      return res.status(403).json({ message: 'Access denied' })
    }

    // Members can only update status
    if (!isAdmin && (title || description || dueDate || priority || assignedTo)) {
      return res.status(403).json({ message: 'Members can only update task status' })
    }

    // Admin can update everything
    if (isAdmin) {
      if (title) task.title = title
      if (description !== undefined) task.description = description
      if (dueDate) task.dueDate = new Date(dueDate)
      if (priority) task.priority = priority
      if (assignedTo !== undefined) task.assignedTo = assignedTo || undefined
    }

    // Both can update status
    if (status) task.status = status

    await task.save()
    await task.populate('assignedTo', 'name email role')
    await task.populate('project', 'name')
    await task.populate('createdBy', 'name email role')

    res.json({
      message: 'Task updated successfully',
      task,
    })
  } catch (error) {
    const err = error as Error
    res.status(500).json({ message: err.message || 'Error updating task' })
  }
})

// Delete task (admin only)
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can delete tasks' })
    }

    const task = await Task.findById(req.params.id)
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    await task.deleteOne()

    res.json({ message: 'Task deleted successfully' })
  } catch (error) {
    const err = error as Error
    res.status(500).json({ message: err.message || 'Error deleting task' })
  }
})

export default router
