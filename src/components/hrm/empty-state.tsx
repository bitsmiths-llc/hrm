import { LucideIcon } from 'lucide-react';

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  /** Optional CTA, e.g. a "Request leave" button. */
  children?: React.ReactNode;
};

export function EmptyState({
  title,
  description,
  icon: Icon,
  children,
}: EmptyStateProps) {
  return (
    <div className='flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border px-6 py-12 text-center'>
      {!!Icon && (
        <div className='flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground'>
          <Icon className='size-6' aria-hidden />
        </div>
      )}
      <div className='flex flex-col gap-1'>
        <p className='text-base font-medium'>{title}</p>
        {!!description && (
          <p className='max-w-sm text-sm text-muted-foreground'>
            {description}
          </p>
        )}
      </div>
      {!!children && <div className='mt-2'>{children}</div>}
    </div>
  );
}
