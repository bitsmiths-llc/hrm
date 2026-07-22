import { LucideIcon } from 'lucide-react';

import { Card } from '@/components/ui/card';

import { cn } from '@/lib/utils';

type SettingsCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Right-aligned action, typically the Save button. Sits in a divided
   *  footer so every card ends the same way. */
  footer?: React.ReactNode;
  /** Right-aligned control in the header, e.g. an "Add" button. */
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

/** A configuration panel: a compact titled header, hairline-divided setting
 *  rows (see SettingRow), and a footer for the save action. Shared so every
 *  card on the Configuration tab reads as one console. */
export function SettingsCard({
  icon: Icon,
  title,
  description,
  footer,
  action,
  className,
  children,
}: SettingsCardProps) {
  return (
    <Card className={cn('flex flex-col overflow-hidden', className)}>
      <div className='flex items-center gap-2.5 border-b border-border px-5 py-4'>
        <Icon className='size-4 shrink-0 text-primary' aria-hidden />
        <div className='flex min-w-0 flex-col'>
          <h3 className='text-sm font-semibold leading-tight'>{title}</h3>
          <p className='text-xs text-muted-foreground'>{description}</p>
        </div>
        {!!action && <div className='ml-auto shrink-0'>{action}</div>}
      </div>
      <div className='flex flex-1 flex-col divide-y divide-border px-5'>
        {children}
      </div>
      {!!footer && (
        <div className='flex justify-end border-t border-border bg-muted/30 px-5 py-3'>
          {footer}
        </div>
      )}
    </Card>
  );
}

type SettingsGroupProps = {
  /** Small uppercase heading for a related cluster of settings. */
  label: string;
  children: React.ReactNode;
};

/** A labelled cluster of setting rows inside a card — lets one card hold
 *  several domains (Leave / Medical / Payroll) without four separate boxes. */
export function SettingsGroup({ label, children }: SettingsGroupProps) {
  return (
    <div className='py-4'>
      <p className='mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
        {label}
      </p>
      <div className='divide-y divide-border'>{children}</div>
    </div>
  );
}

type SettingRowProps = {
  label: string;
  description?: string;
  /** The field control — typically a UnitInput. */
  children: React.ReactNode;
};

/** One setting: label + helper on the left, control pinned right. Fixed
 *  control width keeps every value column aligned down the card. */
export function SettingRow({ label, description, children }: SettingRowProps) {
  return (
    <div className='flex items-center justify-between gap-4 py-3'>
      <div className='flex min-w-0 flex-col gap-0.5'>
        <span className='text-sm font-medium'>{label}</span>
        {!!description && (
          <span className='text-xs text-muted-foreground'>{description}</span>
        )}
      </div>
      <div className='w-32 shrink-0'>{children}</div>
    </div>
  );
}
