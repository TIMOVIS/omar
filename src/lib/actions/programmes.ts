'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  programmeTemplateSchema,
  programmeBlockSchema,
  type ProgrammeTemplateFormData,
  type ProgrammeBlockFormData,
} from '@/lib/validations'
import type { ProgrammeTemplate, ProgrammeBlock, ProgrammeTemplateWithBlocks, ProgrammeBlockData } from '@/lib/supabase/types'

export async function getProgrammes(): Promise<ProgrammeTemplate[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('programme_templates')
    .select('*')
    .eq('is_active', true)
    .order('name')

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getProgramme(id: string): Promise<ProgrammeTemplateWithBlocks | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('programme_templates')
    .select(`
      *,
      programme_blocks(*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(error.message)
  }

  const result = data as unknown as ProgrammeTemplateWithBlocks

  // Sort blocks by order_index
  if (result.programme_blocks) {
    result.programme_blocks.sort((a: ProgrammeBlock, b: ProgrammeBlock) => a.order_index - b.order_index)
  }

  return result
}

export async function createProgramme(formData: ProgrammeTemplateFormData): Promise<{ success: boolean; error?: string; data?: ProgrammeTemplate }> {
  const validated = programmeTemplateSchema.safeParse(formData)
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0].message }
  }

  const supabase = await createClient()

  // Get user's profile
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('id, organization_id')
    .single() as { data: { id: string; organization_id: string | null } | null; error: unknown }

  const organizationId = profileData?.organization_id
  const profileId = profileData?.id
  if (profileError || !organizationId) {
    return { success: false, error: 'No organization found' }
  }

  const insertData = {
    name: validated.data.name,
    description: validated.data.description || null,
    target_duration_minutes: validated.data.target_duration_minutes,
    organization_id: organizationId,
    created_by: profileId,
  }

  const { data, error } = await supabase
    .from('programme_templates')
    .insert(insertData as never)
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/programmes')
  return { success: true, data }
}

export async function updateProgramme(id: string, formData: ProgrammeTemplateFormData): Promise<{ success: boolean; error?: string }> {
  const validated = programmeTemplateSchema.safeParse(formData)
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0].message }
  }

  const supabase = await createClient()

  const updateData = {
    name: validated.data.name,
    description: validated.data.description || null,
    target_duration_minutes: validated.data.target_duration_minutes,
  }

  const { error } = await supabase
    .from('programme_templates')
    .update(updateData as never)
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/programmes')
  revalidatePath(`/programmes/${id}`)
  return { success: true }
}

export async function deleteProgramme(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  // Soft delete
  const { error } = await supabase
    .from('programme_templates')
    .update({ is_active: false } as never)
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/programmes')
  return { success: true }
}

// Programme Blocks
export async function addProgrammeBlock(
  programmeId: string,
  formData: ProgrammeBlockFormData
): Promise<{ success: boolean; error?: string; data?: ProgrammeBlock }> {
  const validated = programmeBlockSchema.safeParse(formData)
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0].message }
  }

  const supabase = await createClient()

  // Get the next order index
  const { data: existingBlocks } = await supabase
    .from('programme_blocks')
    .select('order_index')
    .eq('programme_template_id', programmeId)
    .order('order_index', { ascending: false })
    .limit(1) as { data: { order_index: number }[] | null }

  const nextIndex = existingBlocks && existingBlocks.length > 0 ? existingBlocks[0].order_index + 1 : 0

  const blockInsertData = {
    programme_template_id: programmeId,
    order_index: nextIndex,
    name: validated.data.name,
    exercise_type: validated.data.exercise_type,
    duration_seconds: validated.data.duration_seconds ?? null,
    sets: validated.data.sets ?? null,
    reps: validated.data.reps || null,
    rest_seconds: validated.data.rest_seconds ?? null,
    instructions: validated.data.instructions || null,
  }

  const { data, error } = await supabase
    .from('programme_blocks')
    .insert(blockInsertData as never)
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath(`/programmes/${programmeId}`)
  return { success: true, data }
}

export async function updateProgrammeBlock(
  blockId: string,
  formData: ProgrammeBlockFormData
): Promise<{ success: boolean; error?: string }> {
  const validated = programmeBlockSchema.safeParse(formData)
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0].message }
  }

  const supabase = await createClient()

  const blockUpdateData = {
    name: validated.data.name,
    exercise_type: validated.data.exercise_type,
    duration_seconds: validated.data.duration_seconds ?? null,
    sets: validated.data.sets ?? null,
    reps: validated.data.reps || null,
    rest_seconds: validated.data.rest_seconds ?? null,
    instructions: validated.data.instructions || null,
  }

  const { error } = await supabase
    .from('programme_blocks')
    .update(blockUpdateData as never)
    .eq('id', blockId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/programmes')
  return { success: true }
}

export async function deleteProgrammeBlock(blockId: string, programmeId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('programme_blocks')
    .delete()
    .eq('id', blockId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath(`/programmes/${programmeId}`)
  return { success: true }
}

export async function reorderProgrammeBlocks(
  programmeId: string,
  blockIds: string[]
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  // Update each block's order_index
  const updates = blockIds.map((id, index) =>
    supabase
      .from('programme_blocks')
      .update({ order_index: index } as never)
      .eq('id', id)
  )

  const results = await Promise.all(updates)
  const error = results.find(r => r.error)?.error

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath(`/programmes/${programmeId}`)
  return { success: true }
}

// Session Programme assignment
export async function assignProgrammeToSession(
  sessionId: string,
  programmeId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  // Get the programme with blocks
  const programme = await getProgramme(programmeId)
  if (!programme) {
    return { success: false, error: 'Programme not found' }
  }

  // Convert blocks to JSONB format
  const blocks: ProgrammeBlockData[] = programme.programme_blocks.map(block => ({
    id: block.id,
    order_index: block.order_index,
    name: block.name,
    exercise_type: block.exercise_type,
    duration_seconds: block.duration_seconds,
    sets: block.sets,
    reps: block.reps,
    rest_seconds: block.rest_seconds,
    instructions: block.instructions,
  }))

  // Upsert session programme
  const sessionProgrammeData = {
    session_id: sessionId,
    programme_template_id: programmeId,
    name: programme.name,
    blocks,
  }

  const { error } = await supabase
    .from('session_programmes')
    .upsert(sessionProgrammeData as never, {
      onConflict: 'session_id',
    })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath(`/sessions/${sessionId}`)
  revalidatePath('/today')
  revalidatePath('/schedule')
  return { success: true }
}

export async function removeProgrammeFromSession(sessionId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('session_programmes')
    .delete()
    .eq('session_id', sessionId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath(`/sessions/${sessionId}`)
  revalidatePath('/today')
  revalidatePath('/schedule')
  return { success: true }
}
