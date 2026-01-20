import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Pencil, Clock, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/layout'
import { getProgramme } from '@/lib/actions'
import { BlockList } from './block-list'
import { DeleteProgrammeButton } from './delete-button'

interface ProgrammePageProps {
  params: Promise<{ id: string }>
}

export default async function ProgrammePage({ params }: ProgrammePageProps) {
  const { id } = await params
  const programme = await getProgramme(id)

  if (!programme) {
    notFound()
  }

  const totalDuration = programme.programme_blocks.reduce(
    (acc, block) => acc + (block.duration_seconds ?? 0),
    0
  )

  return (
    <div className="flex flex-col">
      <PageHeader
        title=""
        action={
          <Button variant="ghost" size="icon" asChild>
            <Link href="/programmes">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
        }
      />

      <div className="px-4 pb-4 space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold">{programme.name}</h1>
          {programme.description && (
            <p className="text-muted-foreground mt-1">{programme.description}</p>
          )}
          <div className="flex gap-2 mt-2">
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              {programme.target_duration_minutes} min target
            </Badge>
            {totalDuration > 0 && (
              <Badge variant="secondary" className="gap-1">
                ~{Math.round(totalDuration / 60)} min actual
              </Badge>
            )}
          </div>
        </div>

        {/* Blocks */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Exercises ({programme.programme_blocks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BlockList programmeId={id} blocks={programme.programme_blocks} />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-2">
          <Button asChild className="flex-1 tap-target">
            <Link href={`/programmes/${id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Details
            </Link>
          </Button>
          <DeleteProgrammeButton id={id} name={programme.name} />
        </div>
      </div>
    </div>
  )
}
