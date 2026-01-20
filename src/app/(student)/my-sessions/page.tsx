import { format, parseISO, isToday, isTomorrow, isPast } from 'date-fns'
import { Calendar, MapPin, Clock, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getStudentSessions } from '@/lib/actions/student-sessions'

export default async function MySessionsPage() {
  const sessions = await getStudentSessions()

  const upcomingSessions = sessions.filter(
    s => !isPast(parseISO(s.starts_at)) && s.status === 'scheduled'
  )
  const pastSessions = sessions.filter(
    s => isPast(parseISO(s.starts_at)) || s.status !== 'scheduled'
  )

  const formatSessionDate = (dateStr: string) => {
    const date = parseISO(dateStr)
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    return format(date, 'EEE, MMM d')
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      <section>
        <h2 className="mb-3 text-lg font-semibold">Upcoming Sessions</h2>
        {upcomingSessions.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No upcoming sessions scheduled
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {upcomingSessions.map(session => (
              <Card key={session.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">
                      {formatSessionDate(session.starts_at)}
                    </CardTitle>
                    <Badge variant="default">Upcoming</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{format(parseISO(session.starts_at), 'h:mm a')}</span>
                    <span className="text-muted-foreground">
                      ({session.duration_minutes} min)
                    </span>
                  </div>

                  {session.trainer && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{session.trainer.full_name}</span>
                    </div>
                  )}

                  {session.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <span>{session.location.name}</span>
                        {session.location.meeting_point && (
                          <p className="text-xs text-muted-foreground">
                            Meet at: {session.location.meeting_point}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {session.notes && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {session.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {pastSessions.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-muted-foreground">
            Past Sessions
          </h2>
          <div className="space-y-2">
            {pastSessions.slice(0, 10).map(session => (
              <Card key={session.id} className="opacity-60">
                <CardContent className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {format(parseISO(session.starts_at), 'MMM d, yyyy')}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {format(parseISO(session.starts_at), 'h:mm a')}
                      </span>
                    </div>
                    <Badge variant={session.status === 'completed' ? 'secondary' : 'outline'}>
                      {session.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
