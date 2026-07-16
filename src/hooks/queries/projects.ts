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
    .select('id, name')
    .eq('is_active', true)
    .order('name', { ascending: true });
  if (error) throw new Error(error.message);
  return data.map((row) => ({ id: row.id, name: row.name }) satisfies Project);
});

export const useProjects = () =>
  useQuery({
    queryKey: [QueryKeys.PROJECTS],
    queryFn: () => fetchProjects(),
  });
