import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { mockAuthAPI } from '../services/mockData'

export interface User {
  _id: string
  name: string
  email: string
  role: 'admin' | 'member'
  createdAt: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string, role: 'admin' | 'member') => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('taskflow-token')
    if (!token) {
      setIsLoading(false)
      return
    }

    try {
      const response = await mockAuthAPI.me()
      setUser(response.user as User)
    } catch {
      localStorage.removeItem('taskflow-token')
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const response = await mockAuthAPI.login(email, password)
    localStorage.setItem('taskflow-token', response.token)
    setUser(response.user as User)
  }

  const signup = async (name: string, email: string, password: string, role: 'admin' | 'member') => {
    const response = await mockAuthAPI.signup({ name, email, password, role })
    localStorage.setItem('taskflow-token', response.token)
    setUser(response.user as User)
  }

  const logout = () => {
    localStorage.removeItem('taskflow-token')
    mockAuthAPI.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
