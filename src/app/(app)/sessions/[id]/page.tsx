import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import {
  ArrowLeft,
  MapPin,
  Users,
  Clock,
  FileText,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { PageHeader } from '@/components/layout'
import { getSession, getProgrammes, getStudents, getLocations } from '@/lib/actions'
import { QuickActions } from './quick-actions'
import { ProgrammeSection } from './programme-section'

interface SessionPageProps {
  params: Promise<{ id: string }>
}

export default async function SessionPage({ params }: SessionPageProps) {
  const { id } = await params
  const [session, programmes, students, locations] = await Promise.all([
    getSession(id),
    getProgrammes(),
    getStudents(),
    getLocations(),
  ])

  if (!session) {
    notFound()
  }

  const date = parseISO(session.starts_at)
  const sessionStudents = session.session_students?.map(ss => ss.student) ?? []

  const statusIcon = {
    scheduled: <Clock className="h-4 w-4 text-blue-500" />,
    completed: <CheckCircle className="h-4 w-4 text-green-500" />,
    cancelled: <XCircle className="h-4 w-4 text-gray-400" />,
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        title=""
        action={
          <Button variant="ghost" size="icon" asChild>
            <Link href="/schedule">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
        }
      />

      <div className="px-4 pb-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              {statusIcon[session.status]}
              <Badge variant="outline" className="capitalize">
                {session.status}
              </Badge>
            </div>
            <h1 className="text-xl font-semibold mt-2">
              {format(date, 'EEEE, d MMMM')}
            </h1>
            <p className="text-lg text-muted-foreground">
              {format(date, 'HH:mm')} - {format(new Date(date.getTime() + session.duration_minutes * 60000), 'HH:mm')}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        {session.status === 'scheduled' && (
          <QuickActions
            session={session}
            programmes={programmes}
            students={students}
            locations={locations}
          />
        )}

        {/* Location */}
        {session.location && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{session.location.name}</p>
              {session.location.address && (
                <p className="text-sm text-muted-foreground">
                  {session.location.address}
                </p>
              )}
              {session.location.meeting_point && (
                <p className="text-sm text-muted-foreground mt-1">
                  Meet at: {session.location.meeting_point}
                </p>
              )}
              <Badge variant="outline" className="mt-2 capitalize">
                {session.location.location_type}
              </Badge>
            </CardContent>
          </Card>
        )}

        {/* Students */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" />
              Students ({sessionStudents.length}/2)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sessionStudents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No students assigned</p>
            ) : (
              <div className="space-y-3">
                {sessionStudents.map(student => (
                  <Link
                    key={student.id}
                    href={`/students/${student.id}`}
                    className="flex items-center gap-3"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {student.full_name
                          .split(' ')
                          .map(n => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{student.full_name}</p>
                      {student.constraints_injuries && (
                        <p className="text-sm text-amber-600 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Has constraints
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Programme */}
        <ProgrammeSection session={session} programmes={programmes} />

        {/* Notes */}
        {session.notes && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {session.notes}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Edit Button */}
        {session.status === 'scheduled' && (
          <Button asChild variant="outline" className="w-full tap-target">
            <Link href={`/sessions/${id}/edit`}>
              <Calendar className="mr-2 h-4 w-4" />
              Edit Session
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}
