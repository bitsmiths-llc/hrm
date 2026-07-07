import { Column } from '@tanstack/react-table';
import { RxCaretDown, RxCaretSort, RxCaretUp } from 'react-icons/rx';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { cn } from '@/lib/utils';

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
  /** Must match the alignment the column's cell renderer uses (e.g.
   *  CenteredCell) — otherwise the header sits beside its data instead
   *  of above it. Defaults to 'left'. */
  align?: 'left' | 'center' | 'right';
}

const justifyByAlign = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
} as const;

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
  align = 'left',
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return (
      <div
        className={cn(
          'flex text-sm font-light',
          justifyByAlign[align],
          className,
        )}
      >
        {title}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center', justifyByAlign[align], className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            size='sm'
            className={cn('h-8', align === 'left' && '-ml-3')}
          >
            <span>{title}</span>
            {column.getIsSorted() === 'desc' ? (
              <RxCaretDown className='ml-2 h-4 w-4' />
            ) : column.getIsSorted() === 'asc' ? (
              <RxCaretUp className='ml-2 h-4 w-4' />
            ) : (
              <RxCaretSort className='ml-2 h-4 w-4' />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='start'>
          <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
            <RxCaretUp className='mr-2 h-3.5 w-3.5 text-muted-foreground/70' />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
            <RxCaretDown className='mr-2 h-3.5 w-3.5 text-muted-foreground/70' />
            Desc
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
