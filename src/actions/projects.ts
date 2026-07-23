'use server';

import { authActionClient } from '@/lib/server/safe-action';

import { createProjectSchema, projectIdSchema, toggleProjectSchema } from '@/schema/project';

/** Admin gate. The role check is server-side even though RLS also enforces it
 *  (mirrors `actions/overtime.ts`). */
const requireAdmin = (role?: string) => {
  if (role !== 'admin') throw new Error('Forbidden');
};

/**
 * Add a project to the overtime lookup (admin-only). The DB `unique(name)`
 * constraint rejects duplicates; the friendly message surfaces that case.
 */
export const createProject = authActionClient
  .schema(createProjectSchema)
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    requireAdmin(authUser.user?.app_metadata.role);

    const { data, error } = await supabase
      .from('projects')
      .insert({
        name: parsedInput.name,
        description: parsedInput.description,
        tech_stack: parsedInput.techStack.split(',').map((t) => t.trim()).filter(Boolean),
        url: parsedInput.url || null,
        is_active: true,
      })
      .select('id, name')
      .single();
    if (error) {
      throw new Error(
        error.code === '23505'
          ? 'A project with that name already exists'
          : error.message,
      );
    }

    return data;
  });

/**
 * Toggle a project's active state (admin-only). Soft delete via `is_active = false` so
 * historical overtime logs keep resolving through their FK; the dropdown queries
 * only active projects.
 */
export const toggleProject = authActionClient
  .schema(toggleProjectSchema)
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    requireAdmin(authUser.user?.app_metadata.role);

    const { error } = await supabase
      .from('projects')
      .update({ is_active: parsedInput.active })
      .eq('id', parsedInput.projectId);
    if (error) throw new Error(error.message);

    return { id: parsedInput.projectId };
  });

/**
 * "Remove" a project (admin-only). Same as toggleProject with active = false, kept for backwards compatibility
 * if needed, or we can just replace it.
 */
export const deactivateProject = authActionClient
  .schema(projectIdSchema)
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    requireAdmin(authUser.user?.app_metadata.role);

    const { error } = await supabase
      .from('projects')
      .update({ is_active: false })
      .eq('id', parsedInput.projectId);
    if (error) throw new Error(error.message);

    return { id: parsedInput.projectId };
  });
