'use client';

import dynamic from 'next/dynamic';

import { Skeleton } from '@/components/ui/skeleton';

/** CKEditor touches the DOM at load time, so it's dynamically imported with
 *  `ssr: false` — consumers can import this normally without worrying about
 *  the SSR/hydration mismatch that would otherwise cause. */
export const RichTextEditor = dynamic(
  () => import('./rich-text-editor-impl').then((mod) => mod.RichTextEditorImpl),
  {
    ssr: false,
    loading: () => <Skeleton className='h-56 w-full rounded-md' />,
  },
);
