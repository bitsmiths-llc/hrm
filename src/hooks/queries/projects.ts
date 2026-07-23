import { useQuery } from '@tanstack/react-query';

import { authQuery } from '@/lib/client/auth-query';

import { QueryKeys } from '@/constants/query-keys';

import { Project } from '@/types/hrm';

// The admin-managed list employees pick from when logging overtime. Only active
// projects are returned — deactivating one (soft delete) removes it from the
// dropdown, while existing logs still resolve their name through the FK. Any
// authenticated user can read (RLS projects_select_authenticated).
const fetchProjects = authQuery(async ({ supabase }) => {
  const { data, error } = await supabase
    .from('projects')
    .select('id, name, description, tech_stack, url, is_active')
    .order('name', { ascending: true });
  if (error) throw new Error(error.message);
  return (data as any[]).map(
    (row) =>
      ({
        id: row.id,
        name: row.name,
        description: row.description,
        techStack: row.tech_stack,
        url: row.url || '',
        active: row.is_active,
      }) satisfies Project,
  );
});

export const useProjects = () =>
  useQuery({
    queryKey: [QueryKeys.PROJECTS],
    queryFn: () => fetchProjects(),
  });
