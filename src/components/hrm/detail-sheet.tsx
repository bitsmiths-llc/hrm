'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

export type DetailField = {
  label: string;
  value: React.ReactNode;
};

type DetailSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  /** Label/value rows describing the record (request fields, employee context…). */
  fields: DetailField[];
  /** Extra content below the fields (proof files, balances, notes…). */
  children?: React.ReactNode;
  /** Action row, e.g. approve/reject buttons. */
  footer?: React.ReactNode;
};

/** Generic slide-in detail panel used by the approvals queue and record views. */
export function DetailSheet({
  open,
  onOpenChange,
  title,
  description,
  fields,
  children,
  footer,
}: DetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex w-full flex-col gap-6 overflow-y-auto sm:max-w-md'>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {!!description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <dl className='flex flex-col gap-4'>
          {fields.map((field) => (
            <div key={field.label} className='flex flex-col gap-1'>
              <dt className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                {field.label}
              </dt>
              <dd className='text-sm'>{field.value}</dd>
            </div>
          ))}
        </dl>
        {children}
        {!!footer && <SheetFooter className='mt-auto'>{footer}</SheetFooter>}
      </SheetContent>
    </Sheet>
  );
}
