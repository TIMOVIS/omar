import Link from 'next/link'
import { Plus, MapPin, UserCog } from 'lucide-react'
import { PageHeader } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { getSessions } from '@/lib/actions'
import { SessionList } from './session-list'

export default async function SchedulePage() {
  // Get sessions for the next 4 weeks
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const fourWeeksLater = new Date(now)
  fourWeeksLater.setDate(fourWeeksLater.getDate() + 28)

  const sessions = await getSessions({
    from: now.toISOString(),
    to: fourWeeksLater.toISOString(),
  })

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Schedule"
        subtitle="Next 4 weeks"
        action={
          <div className="flex gap-2">
            <Button asChild size="icon" variant="outline" className="h-9 w-9" title="Manage Trainers">
              <Link href="/trainers">
                <UserCog className="h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="icon" variant="outline" className="h-9 w-9" title="Manage Locations">
              <Link href="/locations">
                <MapPin className="h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="icon" className="h-9 w-9" title="New Session">
              <Link href="/schedule/new">
                <Plus className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        }
      />

      <div className="flex-1">
        <SessionList sessions={sessions} />
      </div>
    </div>
  )
}
