import { type HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    success: 'bg-success text-success-foreground',
    warning: 'bg-warning text-warning-foreground',
    destructive: 'bg-destructive text-destructive-foreground',
    outline: 'border border-input bg-transparent text-foreground',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

// Priority Badge
export function PriorityBadge({ priority }: { priority: 'low' | 'medium' | 'high' }) {
  const config = {
    low: { variant: 'secondary' as const, label: 'Low' },
    medium: { variant: 'warning' as const, label: 'Medium' },
    high: { variant: 'destructive' as const, label: 'High' },
  }
  
  return <Badge variant={config[priority].variant}>{config[priority].label}</Badge>
}

// Status Badge
export function StatusBadge({ status }: { status: 'todo' | 'in-progress' | 'done' }) {
  const config = {
    'todo': { variant: 'secondary' as const, label: 'To Do' },
    'in-progress': { variant: 'warning' as const, label: 'In Progress' },
    'done': { variant: 'success' as const, label: 'Done' },
  }
  
  return <Badge variant={config[status].variant}>{config[status].label}</Badge>
}

// Role Badge
export function RoleBadge({ role }: { role: 'admin' | 'member' }) {
  const config = {
    admin: { variant: 'default' as const, label: 'Admin' },
    member: { variant: 'outline' as const, label: 'Member' },
  }
  
  return <Badge variant={config[role].variant}>{config[role].label}</Badge>
}
