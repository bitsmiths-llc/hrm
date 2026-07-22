import { Project } from '@/types/hrm';

export const mockProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'HRM Frontend',
    description: 'The internal HR platform for leave, payroll, and policies.',
    techStack: ['Next.js', 'TypeScript', 'Tailwind', 'Supabase'],
    url: 'https://github.com/bitsmiths-llc/hrm',
  },
  {
    id: 'proj-2',
    name: 'Client API',
    description: 'Backend services and integrations for client deliverables.',
    techStack: ['Node.js', 'PostgreSQL', 'Prisma'],
    url: 'https://github.com/bitsmiths-llc/client-api',
  },
  {
    id: 'proj-3',
    name: 'Design System',
    description: 'Shared component library and design tokens across products.',
    techStack: ['React', 'Storybook', 'Radix UI'],
    url: 'https://github.com/bitsmiths-llc/design-system',
  },
  {
    id: 'proj-4',
    name: 'Client Website Redesign',
    description: 'Marketing site rebuild with the new brand direction.',
    techStack: ['Next.js', 'Framer Motion'],
    url: 'https://bitsmiths.studio',
  },
];
