import { Router, Response } from 'express'
import User from '../models/User'
import { authenticate, generateToken, AuthRequest } from '../middleware/auth'

const router = Router()

// Signup
router.post('/signup', async (req, res: Response) => {
  try {
    const { name, email, password, role } = req.body

    // Check if user exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    // Create user
    const user = new User({
      name,
      email,
      password,
      role: role || 'member',
    })

    await user.save()

    // Generate token
    const token = generateToken(user._id.toString())

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    const err = error as Error
    res.status(500).json({ message: err.message || 'Error creating account' })
  }
})

// Login
router.post('/login', async (req, res: Response) => {
  try {
    const { email, password } = req.body

    // Find user with password
    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    // Check password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    // Generate token
    const token = generateToken(user._id.toString())

    res.json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    const err = error as Error
    res.status(500).json({ message: err.message || 'Error logging in' })
  }
})

// Get current user
router.get('/me', authenticate, (req: AuthRequest, res: Response) => {
  res.json({
    user: {
      _id: req.user!._id,
      name: req.user!.name,
      email: req.user!.email,
      role: req.user!.role,
      createdAt: req.user!.createdAt,
    },
  })
})

export default router
