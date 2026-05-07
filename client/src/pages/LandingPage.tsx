import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { useTheme } from '../context/ThemeContext'
import { 
  CheckSquare, 
  Users, 
  BarChart3, 
  Zap, 
  Shield, 
  Clock,
  ArrowRight,
  Sun,
  Moon
} from 'lucide-react'

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme()

  const features = [
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Invite team members, assign tasks, and work together seamlessly.'
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Track progress with real-time analytics and insightful reports.'
    },
    {
      icon: Zap,
      title: 'Fast & Intuitive',
      description: 'Clean interface designed for speed and ease of use.'
    },
    {
      icon: Shield,
      title: 'Role-Based Access',
      description: 'Control who can view, edit, and manage projects and tasks.'
    },
    {
      icon: Clock,
      title: 'Due Date Tracking',
      description: 'Never miss a deadline with smart due date notifications.'
    },
    {
      icon: CheckSquare,
      title: 'Task Management',
      description: 'Create, assign, and track tasks with priority levels.'
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">TaskFlow</span>
            </Link>

            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
              <Link to="/login">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link to="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Streamline your workflow
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground text-balance leading-tight">
              Collaborate smarter.{' '}
              <span className="text-primary">Manage tasks faster.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
              TaskFlow helps teams organize projects, assign tasks, and track productivity with a modern, 
              intuitive interface designed for efficiency.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup">
                <Button size="lg" className="gap-2">
                  Start for free
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg">
                  Sign in to your account
                </Button>
              </Link>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-20 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none h-32 bottom-0 top-auto" />
            <div className="rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
              <div className="bg-muted/50 border-b border-border px-4 py-3 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="p-6 bg-background">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Total Projects', value: '12', color: 'bg-primary/10 text-primary' },
                    { label: 'Active Tasks', value: '48', color: 'bg-chart-3/20 text-chart-3' },
                    { label: 'Completed', value: '156', color: 'bg-success/20 text-success' },
                    { label: 'Team Members', value: '8', color: 'bg-chart-5/20 text-chart-5' },
                  ].map((stat) => (
                    <div key={stat.label} className={`rounded-lg p-4 ${stat.color}`}>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm opacity-80">{stat.label}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['To Do', 'In Progress', 'Done'].map((status) => (
                    <div key={status} className="rounded-lg border border-border p-4">
                      <h3 className="font-medium text-foreground mb-3">{status}</h3>
                      <div className="space-y-2">
                        {[1, 2].map((i) => (
                          <div key={i} className="rounded-md bg-muted/50 p-3">
                            <div className="h-3 w-3/4 bg-muted rounded mb-2" />
                            <div className="h-2 w-1/2 bg-muted rounded" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Everything you need to manage your team
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to help your team stay organized and productive.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div 
                key={feature.title}
                className="group p-6 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
            Ready to boost your team&apos;s productivity?
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join thousands of teams using TaskFlow to manage their projects and tasks efficiently.
          </p>
          <Link to="/signup">
            <Button size="lg" className="gap-2">
              Get started for free
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <CheckSquare className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-medium text-foreground">TaskFlow</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Built with React, Express, and MongoDB
          </p>
        </div>
      </footer>
    </div>
  )
}
