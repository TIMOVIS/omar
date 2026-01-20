'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { CalendarPlus, Clock, CheckCircle, XCircle, MapPin, Dumbbell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import type { Student, SessionWithRelations, ProgrammeTemplate } from '@/lib/supabase/types'
import { getStudentSessions, getProgrammes } from '@/lib/actions'

interface StudentAppointmentDialogProps {
  student: Student
}

export function StudentAppointmentDialog({ student }: StudentAppointmentDialogProps) {
  const [open, setOpen] = useState(false)
  const [sessions, setSessions] = useState<SessionWithRelations[]>([])
  const [programmes, setProgrammes] = useState<ProgrammeTemplate[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setLoading(true)
      Promise.all([
        getStudentSessions(student.id),
        getProgrammes(),
      ])
        .then(([sessionsData, programmesData]) => {
          setSessions(sessionsData)
          setProgrammes(programmesData)
        })
        .finally(() => setLoading(false))
    }
  }, [open, student.id])

  const statusIcon = {
    scheduled: <Clock className="h-4 w-4 text-blue-500" />,
    completed: <CheckCircle className="h-4 w-4 text-green-500" />,
    cancelled: <XCircle className="h-4 w-4 text-gray-400" />,
  }

  const statusColors = {
    scheduled: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-gray-100 text-gray-500',
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <CalendarPlus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{student.full_name}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="sessions" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="w-full">
            <TabsTrigger value="sessions" className="flex-1">Sessions</TabsTrigger>
            <TabsTrigger value="programmes" className="flex-1">Programmes</TabsTrigger>
          </TabsList>

          <TabsContent value="sessions" className="flex-1 overflow-y-auto mt-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-muted-foreground mb-4">No past sessions</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sessions.map((session) => {
                  const date = parseISO(session.starts_at)
                  return (
                    <Link
                      key={session.id}
                      href={`/sessions/${session.id}`}
                      onClick={() => setOpen(false)}
                    >
                      <Card className="hover:bg-muted/50 transition-colors">
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                {statusIcon[session.status]}
                                <span className="font-medium">
                                  {format(date, 'EEE, d MMM yyyy')}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {format(date, 'HH:mm')} - {format(new Date(date.getTime() + session.duration_minutes * 60000), 'HH:mm')}
                              </p>
                              {session.location && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                  <MapPin className="h-3 w-3" />
                                  {session.location.name}
                                </p>
                              )}
                              {session.session_programmes && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                  <Dumbbell className="h-3 w-3" />
                                  {session.session_programmes.name}
                                </p>
                              )}
                            </div>
                            <Badge
                              variant="secondary"
                              className={`capitalize text-xs ${statusColors[session.status]}`}
                            >
                              {session.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="programmes" className="flex-1 overflow-y-auto mt-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : programmes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-muted-foreground mb-4">No programmes available</p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/programmes/new" onClick={() => setOpen(false)}>
                    Create Programme
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {programmes.map((programme) => (
                  <Link
                    key={programme.id}
                    href={`/programmes/${programme.id}`}
                    onClick={() => setOpen(false)}
                  >
                    <Card className="hover:bg-muted/50 transition-colors">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{programme.name}</p>
                            {programme.description && (
                              <p className="text-sm text-muted-foreground truncate">
                                {programme.description}
                              </p>
                            )}
                          </div>
                          <Badge variant="outline">
                            {programme.target_duration_minutes} min
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="pt-4 border-t">
          <Button asChild className="w-full">
            <Link
              href={`/schedule/new?student=${student.id}`}
              onClick={() => setOpen(false)}
            >
              <CalendarPlus className="mr-2 h-4 w-4" />
              Schedule New Session
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
