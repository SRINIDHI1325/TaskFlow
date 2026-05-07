import { Router, Response } from 'express'
import Project from '../models/Project'
import Task from '../models/Task'
import User from '../models/User'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()

// Apply auth to all routes
router.use(authenticate)

// Get dashboard statistics
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    // Get projects user has access to
    const userProjects = await Project.find({
      $or: [
        { admin: req.user!._id },
        { members: req.user!._id },
      ],
    })

    const projectIds = userProjects.map((p) => p._id)

    // Get all tasks from accessible projects
    const tasks = await Task.find({ project: { $in: projectIds } })

    // Calculate statistics
    const now = new Date()
    const stats = {
      totalProjects: userProjects.length,
      totalTasks: tasks.length,
      completedTasks: tasks.filter((t) => t.status === 'done').length,
      pendingTasks: tasks.filter((t) => t.status !== 'done').length,
      overdueTasks: tasks.filter((t) => t.status !== 'done' && new Date(t.dueDate) < now).length,
    }

    // Tasks by status
    const tasksByStatus = {
      todo: tasks.filter((t) => t.status === 'todo').length,
      'in-progress': tasks.filter((t) => t.status === 'in-progress').length,
      done: tasks.filter((t) => t.status === 'done').length,
    }

    // Tasks by priority
    const tasksByPriority = {
      low: tasks.filter((t) => t.priority === 'low').length,
      medium: tasks.filter((t) => t.priority === 'medium').length,
      high: tasks.filter((t) => t.priority === 'high').length,
    }

    // Tasks per user (for accessible projects)
    const tasksByUser = await Task.aggregate([
      { $match: { project: { $in: projectIds }, assignedTo: { $exists: true } } },
      {
        $group: {
          _id: '$assignedTo',
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] },
          },
        },
      },
    ])

    // Get user details
    const userIds = tasksByUser.map((t) => t._id)
    const users = await User.find({ _id: { $in: userIds } }).select('name email')
    
    const tasksPerUser = tasksByUser.map((t) => {
      const user = users.find((u) => u._id.equals(t._id))
      return {
        user: user ? { _id: user._id, name: user.name, email: user.email } : null,
        total: t.total,
        completed: t.completed,
      }
    })

    // Recent activity (last 10 tasks)
    const recentTasks = await Task.find({ project: { $in: projectIds } })
      .populate('assignedTo', 'name')
      .populate('project', 'name')
      .sort({ updatedAt: -1 })
      .limit(10)

    res.json({
      stats,
      tasksByStatus,
      tasksByPriority,
      tasksPerUser,
      recentTasks,
    })
  } catch (error) {
    const err = error as Error
    res.status(500).json({ message: err.message || 'Error fetching dashboard data' })
  }
})

export default router
