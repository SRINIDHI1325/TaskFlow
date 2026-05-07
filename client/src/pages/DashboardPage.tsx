import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { mockDashboardAPI } from '../services/mockData'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Avatar } from '../components/ui/Avatar'
import { Badge, PriorityBadge, StatusBadge } from '../components/ui/Badge'
import { toast } from '../components/ui/Toaster'
import { formatRelativeDate, isOverdue } from '../lib/utils'
import {
  FolderKanban,
  CheckSquare,
  Clock,
  AlertTriangle,
  TrendingUp,
  Users,
  Calendar,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

interface DashboardStats {
  totalProjects: number
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  overdueTasks: number
}

interface TaskByStatus {
  todo: number
  'in-progress': number
  done: number
}

interface TaskByPriority {
  low: number
  medium: number
  high: number
}

interface TaskPerUser {
  user: { _id: string; name: string; email: string } | null
  total: number
  completed: number
}

interface RecentTask {
  _id: string
  title: string
  status: 'todo' | 'in-progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  dueDate: string
  assignedTo?: { name: string }
  project: { _id: string; name: string }
  updatedAt: string
}

interface DashboardData {
  stats: DashboardStats
  tasksByStatus: TaskByStatus
  tasksByPriority: TaskByPriority
  tasksPerUser: TaskPerUser[]
  recentTasks: RecentTask[]
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const response = await mockDashboardAPI.getStats()
      setData({
        stats: {
          totalProjects: response.totalProjects,
          totalTasks: response.totalTasks,
          completedTasks: response.completedTasks,
          pendingTasks: response.todoTasks + response.inProgressTasks,
          overdueTasks: response.overdueTasks,
        },
        tasksByStatus: {
          todo: response.todoTasks,
          'in-progress': response.inProgressTasks,
          done: response.completedTasks,
        },
        tasksByPriority: { low: 0, medium: 0, high: 0 },
        tasksPerUser: [],
        recentTasks: response.recentTasks as RecentTask[],
      })
    } catch {
      toast.error('Failed to load dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-foreground">Unable to load dashboard</h2>
        <p className="text-muted-foreground mt-2">Please try refreshing the page</p>
      </div>
    )
  }

  const { stats, tasksByStatus, tasksByPriority, tasksPerUser, recentTasks } = data

  // Chart data
  const statusChartData = [
    { name: 'To Do', value: tasksByStatus.todo, color: 'var(--color-muted-foreground)' },
    { name: 'In Progress', value: tasksByStatus['in-progress'], color: 'var(--color-warning)' },
    { name: 'Done', value: tasksByStatus.done, color: 'var(--color-success)' },
  ]

  const priorityChartData = [
    { name: 'Low', value: tasksByPriority.low, fill: 'var(--color-muted-foreground)' },
    { name: 'Medium', value: tasksByPriority.medium, fill: 'var(--color-warning)' },
    { name: 'High', value: tasksByPriority.high, fill: 'var(--color-destructive)' },
  ]

  const userChartData = tasksPerUser
    .filter((u) => u.user)
    .map((u) => ({
      name: u.user!.name.split(' ')[0],
      total: u.total,
      completed: u.completed,
    }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.name}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FolderKanban className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalProjects}</p>
                <p className="text-xs text-muted-foreground">Total Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-chart-1/5 border-chart-1/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-chart-1/10">
                <CheckSquare className="w-5 h-5 text-chart-1" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalTasks}</p>
                <p className="text-xs text-muted-foreground">Total Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-success/5 border-success/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.completedTasks}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-warning/5 border-warning/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.pendingTasks}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.overdueTasks}</p>
                <p className="text-xs text-muted-foreground">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks by Status (Pie Chart) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tasks by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.totalTasks === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No tasks yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--color-popover)', 
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Tasks by Priority (Bar Chart) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tasks by Priority</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.totalTasks === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No tasks yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={priorityChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--color-popover)', 
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks per User */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tasks per User</CardTitle>
          </CardHeader>
          <CardContent>
            {userChartData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                No assigned tasks
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={userChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--color-popover)', 
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="total" fill="var(--color-primary)" name="Total" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" fill="var(--color-success)" name="Completed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentTasks.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                No recent activity
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {recentTasks.map((task) => (
                  <div key={task._id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Link 
                          to={`/projects/${task.project._id}`}
                          className="font-medium text-foreground hover:text-primary truncate transition-colors"
                        >
                          {task.title}
                        </Link>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <StatusBadge status={task.status} />
                        <PriorityBadge priority={task.priority} />
                        <span className="text-xs text-muted-foreground">
                          in {task.project.name}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs ${isOverdue(task.dueDate) && task.status !== 'done' ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {formatRelativeDate(task.dueDate)}
                      </div>
                      {task.assignedTo && (
                        <div className="flex items-center gap-1 mt-1 justify-end">
                          <Avatar name={task.assignedTo.name} size="sm" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
