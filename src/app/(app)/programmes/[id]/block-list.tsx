'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Loader2, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { ProgrammeBlockForm } from '@/components/forms/programme-block-form'
import { deleteProgrammeBlock } from '@/lib/actions'
import type { ProgrammeBlock } from '@/lib/supabase/types'

interface BlockListProps {
  programmeId: string
  blocks: ProgrammeBlock[]
}

export function BlockList({ programmeId, blocks }: BlockListProps) {
  const router = useRouter()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (blockId: string) => {
    setDeletingId(blockId)
    await deleteProgrammeBlock(blockId, programmeId)
    setDeletingId(null)
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

  return (
    <div className="space-y-2">
      {blocks.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No exercises yet. Add your first one.
        </p>
      ) : (
        blocks.map((block, index) => (
          <div
            key={block.id}
            className="flex items-start gap-2 rounded-md border p-2"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium flex-shrink-0">
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
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0"
              onClick={() => handleDelete(block.id)}
              disabled={deletingId === block.id}
            >
              {deletingId === block.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 text-destructive" />
              )}
            </Button>
          </div>
        ))
      )}

      <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="w-full tap-target gap-2">
            <Plus className="h-4 w-4" />
            Add Exercise
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh] pb-safe overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add Exercise</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <ProgrammeBlockForm
              programmeId={programmeId}
              onSuccess={() => setIsAddOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
