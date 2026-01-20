import Link from 'next/link'
import { Plus, UserCog } from 'lucide-react'
import { PageHeader } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getTrainers } from '@/lib/actions'
import { createClient } from '@/lib/supabase/server'

export default async function TrainersPage() {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .single() as { data: { id: string } | null }

  const trainers = await getTrainers()

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Trainers"
        subtitle={`${trainers.length} trainer${trainers.length !== 1 ? 's' : ''}`}
        action={
          <Button asChild size="icon" className="h-9 w-9">
            <Link href="/trainers/new">
              <Plus className="h-5 w-5" />
            </Link>
          </Button>
        }
      />

      <div className="flex-1 px-4 pb-4">
        {trainers.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-8 text-center">
            <UserCog className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="mb-4 text-muted-foreground">No trainers yet</p>
            <Button asChild>
              <Link href="/trainers/new">Add a trainer</Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-2">
            {trainers.map(trainer => (
              <Card key={trainer.id} className="flex items-center gap-3 p-3">
                <Avatar>
                  <AvatarFallback>
                    {trainer.full_name
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{trainer.full_name}</p>
                    {trainer.id === profile?.id && (
                      <Badge variant="secondary" className="text-xs">You</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {trainer.email}
                  </p>
                </div>
                <Badge variant="outline" className="capitalize">
                  {trainer.role}
                </Badge>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
