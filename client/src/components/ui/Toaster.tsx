import { useEffect, useState, createContext, useContext, type ReactNode } from 'react'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface ToastContextType {
  addToast: (message: string, type: Toast['type']) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    // Return a no-op if used outside provider
    return { 
      addToast: () => {},
      toast: {
        success: (message: string) => toastEmitter.emit({ message, type: 'success' }),
        error: (message: string) => toastEmitter.emit({ message, type: 'error' }),
        info: (message: string) => toastEmitter.emit({ message, type: 'info' }),
      }
    }
  }
  return { 
    addToast: context.addToast,
    toast: {
      success: (message: string) => context.addToast(message, 'success'),
      error: (message: string) => context.addToast(message, 'error'),
      info: (message: string) => context.addToast(message, 'info'),
    }
  }
}

// Simple event emitter for toasts
const toastEmitter = {
  listeners: [] as ((toast: { message: string; type: Toast['type'] }) => void)[],
  subscribe(fn: (toast: { message: string; type: Toast['type'] }) => void) {
    this.listeners.push(fn)
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn)
    }
  },
  emit(toast: { message: string; type: Toast['type'] }) {
    this.listeners.forEach(fn => fn(toast))
  }
}

export function toast(message: string, type: Toast['type'] = 'info') {
  toastEmitter.emit({ message, type })
}

toast.success = (message: string) => toast(message, 'success')
toast.error = (message: string) => toast(message, 'error')
toast.info = (message: string) => toast(message, 'info')

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (message: string, type: Toast['type']) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts(prev => [...prev, { id, message, type }])
  }

  useEffect(() => {
    return toastEmitter.subscribe(({ message, type }) => {
      addToast(message, type)
    })
  }, [])

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        setToasts(prev => prev.slice(1))
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [toasts])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={() => onRemove(t.id)} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-success" />,
    error: <AlertCircle className="w-5 h-5 text-destructive" />,
    info: <Info className="w-5 h-5 text-primary" />,
  }

  const bgColors = {
    success: 'bg-success/10 border-success/20',
    error: 'bg-destructive/10 border-destructive/20',
    info: 'bg-primary/10 border-primary/20',
  }

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg backdrop-blur-sm ${bgColors[toast.type]} animate-in slide-in-from-right-full`}>
      {icons[toast.type]}
      <p className="text-sm text-foreground">{toast.message}</p>
      <button onClick={onRemove} className="ml-2 text-muted-foreground hover:text-foreground transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    return toastEmitter.subscribe(({ message, type }) => {
      const id = Math.random().toString(36).substring(2, 9)
      setToasts(prev => [...prev, { id, message, type }])
    })
  }, [])

  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        setToasts(prev => prev.slice(1))
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [toasts])

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return <ToastContainer toasts={toasts} onRemove={removeToast} />
}
