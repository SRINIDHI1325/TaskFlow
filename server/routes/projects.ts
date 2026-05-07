import { Router, Response } from 'express'
import Project from '../models/Project'
import Task from '../models/Task'
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth'

const router = Router()

// Apply auth to all routes
router.use(authenticate)

// Get all projects (user is member or admin)
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const projects = await Project.find({
      $or: [
        { admin: req.user!._id },
        { members: req.user!._id },
      ],
    })
      .populate('admin', 'name email role')
      .populate('members', 'name email role')
      .sort({ createdAt: -1 })

    // Get task counts for each project
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const taskStats = await Task.aggregate([
          { $match: { project: project._id } },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
            },
          },
        ])

        const stats = {
          total: 0,
          todo: 0,
          'in-progress': 0,
          done: 0,
        }

        taskStats.forEach((s) => {
          stats[s._id as keyof typeof stats] = s.count
          stats.total += s.count
        })

        return {
          ...project.toJSON(),
          taskStats: stats,
        }
      })
    )

    res.json(projectsWithStats)
  } catch (error) {
    const err = error as Error
    res.status(500).json({ message: err.message || 'Error fetching projects' })
  }
})

// Get single project
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('admin', 'name email role')
      .populate('members', 'name email role')

    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    // Check access
    const isMember = project.members.some((m: { _id: { equals: (arg0: import("mongoose").Types.ObjectId) => boolean } }) => m._id.equals(req.user!._id))
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' })
    }

    // Get tasks for this project
    const tasks = await Task.find({ project: project._id })
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 })

    res.json({ project, tasks })
  } catch (error) {
    const err = error as Error
    res.status(500).json({ message: err.message || 'Error fetching project' })
  }
})

// Create project (admin only)
router.post('/', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body

    const project = new Project({
      name,
      description,
      admin: req.user!._id,
      members: [req.user!._id],
    })

    await project.save()
    await project.populate('admin', 'name email role')
    await project.populate('members', 'name email role')

    res.status(201).json({
      message: 'Project created successfully',
      project,
    })
  } catch (error) {
    const err = error as Error
    res.status(500).json({ message: err.message || 'Error creating project' })
  }
})

// Update project (admin only)
router.put('/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body

    const project = await Project.findById(req.params.id)
    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    // Check if user is the project admin
    if (!project.admin.equals(req.user!._id)) {
      return res.status(403).json({ message: 'Only the project admin can update this project' })
    }

    project.name = name || project.name
    project.description = description ?? project.description

    await project.save()
    await project.populate('admin', 'name email role')
    await project.populate('members', 'name email role')

    res.json({
      message: 'Project updated successfully',
      project,
    })
  } catch (error) {
    const err = error as Error
    res.status(500).json({ message: err.message || 'Error updating project' })
  }
})

// Delete project (admin only)
router.delete('/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    // Check if user is the project admin
    if (!project.admin.equals(req.user!._id)) {
      return res.status(403).json({ message: 'Only the project admin can delete this project' })
    }

    // Delete all tasks in the project
    await Task.deleteMany({ project: project._id })

    // Delete the project
    await project.deleteOne()

    res.json({ message: 'Project deleted successfully' })
  } catch (error) {
    const err = error as Error
    res.status(500).json({ message: err.message || 'Error deleting project' })
  }
})

// Add member to project (admin only)
router.post('/:id/members', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.body

    const project = await Project.findById(req.params.id)
    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    // Check if user is the project admin
    if (!project.admin.equals(req.user!._id)) {
      return res.status(403).json({ message: 'Only the project admin can add members' })
    }

    // Check if already a member
    if (project.members.some((m) => m.toString() === userId)) {
      return res.status(400).json({ message: 'User is already a member' })
    }

    project.members.push(userId)
    await project.save()
    await project.populate('members', 'name email role')

    res.json({
      message: 'Member added successfully',
      project,
    })
  } catch (error) {
    const err = error as Error
    res.status(500).json({ message: err.message || 'Error adding member' })
  }
})

// Remove member from project (admin only)
router.delete('/:id/members/:userId', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    // Check if user is the project admin
    if (!project.admin.equals(req.user!._id)) {
      return res.status(403).json({ message: 'Only the project admin can remove members' })
    }

    // Cannot remove the admin
    if (project.admin.toString() === req.params.userId) {
      return res.status(400).json({ message: 'Cannot remove the project admin' })
    }

    project.members = project.members.filter(
      (m) => m.toString() !== req.params.userId
    )

    await project.save()
    await project.populate('members', 'name email role')

    res.json({
      message: 'Member removed successfully',
      project,
    })
  } catch (error) {
    const err = error as Error
    res.status(500).json({ message: err.message || 'Error removing member' })
  }
})

export default router
