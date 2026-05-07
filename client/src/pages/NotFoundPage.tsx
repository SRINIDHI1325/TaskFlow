import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-primary">404</h1>
        <h2 className="mt-4 text-2xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-muted-foreground max-w-md mx-auto">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. 
          It might have been moved or deleted.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Button onClick={() => window.history.back()} variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Go back
          </Button>
          <Link to="/">
            <Button className="gap-2">
              <Home className="w-4 h-4" />
              Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
