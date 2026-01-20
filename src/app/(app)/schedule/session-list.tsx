'use client'

import Link from 'next/link'
import { format, isToday, isTomorrow, parseISO } from 'date-fns'
import { MapPin, Users, Clock, FileText } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { SessionWithRelations } from '@/lib/supabase/types'

interface SessionListProps {
  sessions: SessionWithRelations[]
  showEmpty?: boolean
}

export function SessionList({ sessions, showEmpty = true }: SessionListProps) {
  // Group sessions by date
  const groupedSessions = sessions.reduce<Record<string, SessionWithRelations[]>>(
    (acc, session) => {
      const date = format(parseISO(session.starts_at), 'yyyy-MM-dd')
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(session)
      return acc
    },
    {}
  )

  const sortedDates = Object.keys(groupedSessions).sort()

  if (sortedDates.length === 0 && showEmpty) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-muted-foreground">No sessions scheduled</p>
      </div>
    )
  }

  const formatDateHeader = (dateStr: string) => {
    const date = parseISO(dateStr)
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    return format(date, 'EEEE, d MMMM')
  }

  return (
    <div className="space-y-4 px-4 pb-4">
      {sortedDates.map(date => (
        <div key={date}>
          <h2 className="sticky top-0 bg-background py-2 text-sm font-medium text-muted-foreground">
            {formatDateHeader(date)}
          </h2>
          <div className="space-y-2">
            {groupedSessions[date].map(session => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function SessionCard({ session }: { session: SessionWithRelations }) {
  const time = format(parseISO(session.starts_at), 'HH:mm')
  const students = session.session_students?.map(ss => ss.student) ?? []
  const hasProgramme = !!session.session_programmes

  const statusColors = {
    scheduled: 'bg-blue-500',
    completed: 'bg-green-500',
    cancelled: 'bg-gray-400',
  }

  return (
    <Link href={`/sessions/${session.id}`}>
      <Card className="p-3 active:bg-muted/50">
        <div className="flex gap-3">
          {/* Time indicator */}
          <div className="flex flex-col items-center">
            <div className={`h-2 w-2 rounded-full ${statusColors[session.status]}`} />
            <div className="mt-1 text-sm font-medium">{time}</div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Students */}
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="font-medium truncate">
                {students.length === 0
                  ? 'No students assigned'
                  : students.map(s => s.full_name).join(', ')}
              </span>
              {students.length === 2 && (
                <Badge variant="secondary" className="text-xs flex-shrink-0">
                  1:2
                </Badge>
              )}
            </div>

            {/* Location */}
            {session.location && (
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{session.location.name}</span>
              </div>
            )}

            {/* Tags row */}
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs gap-1">
                <Clock className="h-3 w-3" />
                {session.duration_minutes}min
              </Badge>
              {hasProgramme && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <FileText className="h-3 w-3" />
                  Programme
                </Badge>
              )}
              {session.status === 'completed' && (
                <Badge className="bg-green-500 text-xs">Done</Badge>
              )}
              {session.status === 'cancelled' && (
                <Badge variant="secondary" className="text-xs">
                  Cancelled
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
