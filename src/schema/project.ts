import { z } from 'zod';

/**
 * Admin-managed overtime project. `name` is unique in the DB; the client rule
 * mirrors the old inline settings-card guard (min 2 chars). Creating is
 * admin-only (enforced by the action + RLS).
 */
export const createProjectSchema = z.object({
  name: z.string().trim().min(2, 'Enter a project name'),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

/** Target a single project (soft-delete / deactivate). */
export const projectIdSchema = z.object({
  projectId: z.string().uuid(),
});

export type ProjectIdInput = z.infer<typeof projectIdSchema>;
