'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from 'next-themes';
import { useState } from 'react';

import { PostHogProvider } from '@/components/posthog/posthog-provider';
import { TooltipProvider } from '@/components/ui/tooltip';

import { appConfig } from '@/config/app';

type AppProviderProps = {
  children: React.ReactNode;
};

export default function AppProviders({ children }: AppProviderProps) {
  // useState (not useMemo) guarantees a single client for the app's lifetime —
  // React may discard a useMemo value, which would drop the whole cache.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: appConfig.reactQuery.staleTimeMs,
            gcTime: appConfig.reactQuery.gcTimeMs,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
      <QueryClientProvider client={queryClient}>
        <PostHogProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </PostHogProvider>
        <ReactQueryDevtools />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
