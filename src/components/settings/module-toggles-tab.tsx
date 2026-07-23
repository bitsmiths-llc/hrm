'use client';

import { ToggleRight } from 'lucide-react';
import { toast } from 'sonner';

import { useUpdateSystemConfig } from '@/hooks/actions/use-update-system-config';
import { useSystemConfig } from '@/hooks/queries/system-config';

import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';

import { moduleToggles } from '@/constants/module-toggles';
import type { UpdateSystemConfigInput } from '@/schema/system-config';

import { SettingsCard } from './settings-card';

import type { ModuleFlag } from '@/types/hrm';

/** Module Toggles tab (BIT-20). A `Switch` per feature flag in the
 *  `system_config` singleton. Flipping a switch persists immediately (admin
 *  only) and, on invalidation, shows/hides the module's nav entry app-wide —
 *  e.g. Reimbursements. */
export function ModuleTogglesTab() {
  const { data: config, isLoading } = useSystemConfig();
  const { execute, isPending } = useUpdateSystemConfig(() =>
    toast.success('Module settings updated'),
  );

  if (isLoading || !config) {
    return <Skeleton className='h-48 max-w-2xl rounded-xl' />;
  }

  // Persist the full flag set with one field flipped, so the action always
  // writes a complete `system_config` row.
  const handleToggle = (key: ModuleFlag, value: boolean) => {
    const next: UpdateSystemConfigInput = {
      reimbursementsEnabled: config.reimbursementsEnabled,
    };
    next[key] = value;
    execute(next);
  };

  return (
    <SettingsCard
      icon={ToggleRight}
      title='Feature Modules'
      description='Turn optional modules on or off across the app.'
      className='max-w-2xl'
    >
      {moduleToggles.map((toggle) => {
        const Icon = toggle.icon;
        return (
          <div
            key={toggle.key}
            className='flex items-center justify-between gap-4 py-4'
          >
            <div className='flex min-w-0 items-start gap-3'>
              <div className='flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground'>
                <Icon className='size-4' aria-hidden />
              </div>
              <div className='flex min-w-0 flex-col gap-0.5'>
                <Label
                  htmlFor={`toggle-${toggle.key}`}
                  className='text-sm font-medium'
                >
                  {toggle.label}
                </Label>
                <p className='text-xs text-muted-foreground'>
                  {toggle.description}
                </p>
              </div>
            </div>
            <Switch
              id={`toggle-${toggle.key}`}
              checked={config[toggle.key]}
              disabled={isPending}
              onCheckedChange={(value) => handleToggle(toggle.key, value)}
              aria-label={`Toggle ${toggle.label}`}
            />
          </div>
        );
      })}
    </SettingsCard>
  );
}
