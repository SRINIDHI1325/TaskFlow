import { Router, Response } from 'express'
import User from '../models/User'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()

// Apply auth to all routes
router.use(authenticate)

// Get all users (for adding members to projects)
router.get('/', async (_req: AuthRequest, res: Response) => {
  try {
    const users = await User.find()
      .select('name email role createdAt')
      .sort({ name: 1 })

    res.json(users)
  } catch (error) {
    const err = error as Error
    res.status(500).json({ message: err.message || 'Error fetching users' })
  }
})

// Get single user
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('name email role createdAt')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json(user)
  } catch (error) {
    const err = error as Error
    res.status(500).json({ message: err.message || 'Error fetching user' })
  }
})

// Update user profile
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    // Users can only update their own profile
    if (req.params.id !== req.user!._id.toString()) {
      return res.status(403).json({ message: 'You can only update your own profile' })
    }

    const { name, email } = req.body

    // Check if email is taken by another user
    if (email && email !== req.user!.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.user!._id } })
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' })
      }
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email },
      { new: true, runValidators: true }
    ).select('name email role createdAt')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({
      message: 'Profile updated successfully',
      user,
    })
  } catch (error) {
    const err = error as Error
    res.status(500).json({ message: err.message || 'Error updating profile' })
  }
})

export default router
