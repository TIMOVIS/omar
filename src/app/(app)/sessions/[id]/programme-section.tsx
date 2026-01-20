'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Plus, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  assignProgrammeToSession,
  removeProgrammeFromSession,
} from '@/lib/actions'
import type {
  SessionWithRelations,
  ProgrammeTemplate,
  ProgrammeBlockData,
} from '@/lib/supabase/types'

interface ProgrammeSectionProps {
  session: SessionWithRelations
  programmes: ProgrammeTemplate[]
}

export function ProgrammeSection({ session, programmes }: ProgrammeSectionProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)

  const sessionProgramme = session.session_programmes
  const blocks = (sessionProgramme?.blocks ?? []) as ProgrammeBlockData[]

  const handleAssign = async (programmeId: string) => {
    setIsLoading(true)
    await assignProgrammeToSession(session.id, programmeId)
    setIsLoading(false)
    setSheetOpen(false)
    router.refresh()
  }

  const handleRemove = async () => {
    setIsLoading(true)
    await removeProgrammeFromSession(session.id)
    setIsLoading(false)
    router.refresh()
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return null
    if (seconds < 60) return `${seconds}s`
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`
  }

  const exerciseTypeColors: Record<string, string> = {
    warmup: 'bg-orange-100 text-orange-700',
    strength: 'bg-red-100 text-red-700',
    cardio: 'bg-blue-100 text-blue-700',
    flexibility: 'bg-purple-100 text-purple-700',
    cooldown: 'bg-green-100 text-green-700',
    rest: 'bg-gray-100 text-gray-700',
    other: 'bg-gray-100 text-gray-700',
  }

  if (!sessionProgramme) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" />
            Programme
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full tap-target gap-2">
                <Plus className="h-4 w-4" />
                Attach Programme
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[60vh] pb-safe">
              <SheetHeader>
                <SheetTitle>Select Programme</SheetTitle>
              </SheetHeader>
              <div className="space-y-2 py-4 overflow-y-auto">
                {programmes.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No programmes available
                  </p>
                ) : (
                  programmes.map(programme => (
                    <button
                      key={programme.id}
                      onClick={() => handleAssign(programme.id)}
                      disabled={isLoading}
                      className="w-full text-left rounded-md border p-3 hover:bg-muted/50 active:bg-muted disabled:opacity-50"
                    >
                      <p className="font-medium">{programme.name}</p>
                      {programme.description && (
                        <p className="text-sm text-muted-foreground truncate">
                          {programme.description}
                        </p>
                      )}
                      <Badge variant="outline" className="mt-1 text-xs">
                        {programme.target_duration_minutes} min
                      </Badge>
                    </button>
                  ))
                )}
              </div>
            </SheetContent>
          </Sheet>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" />
            {sessionProgramme.name}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleRemove}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 text-destructive" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {blocks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No exercises in programme</p>
        ) : (
          <div className="space-y-2">
            {blocks.map((block, index) => (
              <div
                key={block.id || index}
                className="flex items-start gap-3 rounded-md border p-2"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">{block.name}</p>
                    {block.exercise_type && (
                      <Badge
                        className={`text-xs ${exerciseTypeColors[block.exercise_type]}`}
                      >
                        {block.exercise_type}
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                    {block.sets && block.reps && (
                      <span>
                        {block.sets} x {block.reps}
                      </span>
                    )}
                    {block.duration_seconds && (
                      <span>{formatDuration(block.duration_seconds)}</span>
                    )}
                    {block.rest_seconds && (
                      <span>Rest: {formatDuration(block.rest_seconds)}</span>
                    )}
                  </div>
                  {block.instructions && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {block.instructions}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
