import { ReactNode } from 'react'
import { BottomNav } from './bottom-nav'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 mb-bottom-nav">{children}</main>
      <BottomNav />
    </div>
  )
}
