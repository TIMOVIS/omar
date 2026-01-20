import Link from 'next/link'
import { format, isToday, isTomorrow, parseISO, startOfDay, addDays } from 'date-fns'
import { Plus, MapPin, Users, Clock, FileText, AlertTriangle, CheckCircle } from 'lucide-react'
import { PageHeader } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getTodaySessions } from '@/lib/actions'
import type { SessionWithRelations } from '@/lib/supabase/types'

export default async function TodayPage() {
  const sessions = await getTodaySessions()

  const todaySessions = sessions.filter(s => isToday(parseISO(s.starts_at)))
  const tomorrowSessions = sessions.filter(s => isTomorrow(parseISO(s.starts_at)))

  const today = new Date()
  const todayStr = format(today, 'EEEE, d MMMM')

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Today"
        subtitle={todayStr}
        action={
          <Button asChild size="icon" className="h-9 w-9">
            <Link href={`/schedule/new?date=${format(today, 'yyyy-MM-dd')}`}>
              <Plus className="h-5 w-5" />
            </Link>
          </Button>
        }
      />

      <div className="flex-1 px-4 pb-4 space-y-6">
        {/* Today's Sessions */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-2">
            Today ({todaySessions.length} sessions)
          </h2>
          {todaySessions.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">No sessions today</p>
              <Button asChild variant="link" className="mt-2">
                <Link href={`/schedule/new?date=${format(today, 'yyyy-MM-dd')}`}>
                  Schedule one
                </Link>
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {todaySessions.map(session => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          )}
        </section>

        {/* Tomorrow's Sessions */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-2">
            Tomorrow ({tomorrowSessions.length} sessions)
          </h2>
          {tomorrowSessions.length === 0 ? (
            <Card className="p-4 text-center">
              <p className="text-sm text-muted-foreground">No sessions tomorrow</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {tomorrowSessions.map(session => (
                <SessionCard key={session.id} session={session} compact />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function SessionCard({
  session,
  compact = false,
}: {
  session: SessionWithRelations
  compact?: boolean
}) {
  const time = format(parseISO(session.starts_at), 'HH:mm')
  const endTime = format(
    new Date(parseISO(session.starts_at).getTime() + session.duration_minutes * 60000),
    'HH:mm'
  )
  const students = session.session_students?.map(ss => ss.student) ?? []
  const hasProgramme = !!session.session_programmes
  const hasConstraints = students.some(s => s.constraints_injuries)

  const statusColors = {
    scheduled: 'border-l-blue-500',
    completed: 'border-l-green-500',
    cancelled: 'border-l-gray-400',
  }

  if (compact) {
    return (
      <Link href={`/sessions/${session.id}`}>
        <Card className={`border-l-4 ${statusColors[session.status]} active:bg-muted/50`}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium">{time}</span>
                <span className="text-muted-foreground">
                  {students.length === 0
                    ? 'No students'
                    : students.map(s => s.full_name.split(' ')[0]).join(', ')}
                </span>
              </div>
              {session.location && (
                <Badge variant="outline" className="text-xs">
                  {session.location.name}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  return (
    <Link href={`/sessions/${session.id}`}>
      <Card className={`border-l-4 ${statusColors[session.status]} active:bg-muted/50`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {time} - {endTime}
            </CardTitle>
            {session.status === 'completed' && (
              <Badge className="bg-green-500 gap-1">
                <CheckCircle className="h-3 w-3" />
                Done
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Location */}
          {session.location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{session.location.name}</span>
              <Badge variant="outline" className="text-xs capitalize">
                {session.location.location_type}
              </Badge>
            </div>
          )}

          {/* Students */}
          <div className="space-y-2">
            {students.length === 0 ? (
              <p className="text-sm text-muted-foreground">No students assigned</p>
            ) : (
              students.map(student => (
                <div key={student.id} className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {student.full_name
                        .split(' ')
                        .map(n => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{student.full_name}</p>
                    {student.goals && (
                      <p className="text-xs text-muted-foreground truncate">
                        {student.goals}
                      </p>
                    )}
                  </div>
                  {student.constraints_injuries && (
                    <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {students.length === 2 && (
              <Badge variant="secondary" className="text-xs">
                1:2 session
              </Badge>
            )}
            {hasProgramme && (
              <Badge variant="secondary" className="text-xs gap-1">
                <FileText className="h-3 w-3" />
                {session.session_programmes?.name}
              </Badge>
            )}
            {!hasProgramme && session.status === 'scheduled' && (
              <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                No programme
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
