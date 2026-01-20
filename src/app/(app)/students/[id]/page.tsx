import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Pencil, Phone, Mail, AlertTriangle, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/layout'
import { getStudent } from '@/lib/actions'
import { DeleteStudentButton } from './delete-button'

interface StudentPageProps {
  params: Promise<{ id: string }>
}

export default async function StudentPage({ params }: StudentPageProps) {
  const { id } = await params
  const student = await getStudent(id)

  if (!student) {
    notFound()
  }

  const initials = student.full_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex flex-col">
      <PageHeader
        title=""
        action={
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/students">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        }
      />

      <div className="px-4 pb-4 space-y-4">
        {/* Profile Header */}
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary/10 text-primary text-xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-xl font-semibold">{student.full_name}</h1>
            <div className="flex gap-2 mt-1">
              {student.email && (
                <a href={`mailto:${student.email}`}>
                  <Badge variant="secondary" className="gap-1">
                    <Mail className="h-3 w-3" />
                    Email
                  </Badge>
                </a>
              )}
              {student.phone && (
                <a href={`tel:${student.phone}`}>
                  <Badge variant="secondary" className="gap-1">
                    <Phone className="h-3 w-3" />
                    Call
                  </Badge>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Goals */}
        {student.goals && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-4 w-4" />
                Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {student.goals}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Constraints / Injuries */}
        {student.constraints_injuries && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base text-amber-600">
                <AlertTriangle className="h-4 w-4" />
                Constraints / Injuries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {student.constraints_injuries}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {student.notes && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {student.notes}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Emergency Contact */}
        {(student.emergency_contact_name || student.emergency_contact_phone) && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Emergency Contact</CardTitle>
            </CardHeader>
            <CardContent>
              {student.emergency_contact_name && (
                <p className="text-sm font-medium">{student.emergency_contact_name}</p>
              )}
              {student.emergency_contact_phone && (
                <a
                  href={`tel:${student.emergency_contact_phone}`}
                  className="text-sm text-primary"
                >
                  {student.emergency_contact_phone}
                </a>
              )}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button asChild className="flex-1 tap-target">
            <Link href={`/students/${id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <DeleteStudentButton id={id} name={student.full_name} />
        </div>
      </div>
    </div>
  )
}
