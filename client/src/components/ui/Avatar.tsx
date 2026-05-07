import { cn } from '../../lib/utils'

interface AvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Avatar({ name, size = 'md', className }: AvatarProps) {
  const initials = name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  }

  // Generate consistent color based on name
  const colors = [
    'bg-primary text-primary-foreground',
    'bg-chart-1 text-white',
    'bg-chart-2 text-white',
    'bg-chart-3 text-white',
    'bg-chart-4 text-white',
    'bg-chart-5 text-white',
  ]
  const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-medium',
        sizes[size],
        colors[colorIndex],
        className
      )}
    >
      {initials}
    </div>
  )
}
