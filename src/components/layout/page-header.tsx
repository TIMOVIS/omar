import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { LogoutButton } from './logout-button'

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
  className?: string
  showLogout?: boolean
}

export function PageHeader({ title, subtitle, action, className, showLogout = true }: PageHeaderProps) {
  return (
    <header className={cn('sticky top-0 z-40 bg-background pt-safe', className)}>
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <h1 className="text-xl font-semibold">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {action}
          {showLogout && <LogoutButton />}
        </div>
      </div>
    </header>
  )
}
