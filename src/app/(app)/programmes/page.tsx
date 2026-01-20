import Link from 'next/link'
import { Plus, ChevronRight, Clock } from 'lucide-react'
import { PageHeader } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getProgrammes } from '@/lib/actions'

export default async function ProgrammesPage() {
  const programmes = await getProgrammes()

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Programmes"
        subtitle={`${programmes.length} templates`}
        action={
          <Button asChild size="icon" className="h-9 w-9">
            <Link href="/programmes/new">
              <Plus className="h-5 w-5" />
            </Link>
          </Button>
        }
      />

      <div className="flex-1 px-4 pb-4">
        {programmes.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-8 text-center">
            <p className="mb-4 text-muted-foreground">No programmes yet</p>
            <Button asChild>
              <Link href="/programmes/new">Create your first programme</Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-2">
            {programmes.map(programme => (
              <Link key={programme.id} href={`/programmes/${programme.id}`}>
                <Card className="flex items-center gap-3 p-3 active:bg-muted/50">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{programme.name}</p>
                    {programme.description && (
                      <p className="text-sm text-muted-foreground truncate">
                        {programme.description}
                      </p>
                    )}
                    <Badge variant="outline" className="mt-1 text-xs gap-1">
                      <Clock className="h-3 w-3" />
                      {programme.target_duration_minutes} min
                    </Badge>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
