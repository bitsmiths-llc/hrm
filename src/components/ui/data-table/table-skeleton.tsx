'use client';

import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 3, columns = 4 }: TableSkeletonProps) {
  return (
    <div className='rounded-lg border border-border'>
      <Table>
        <TableHeader>
          <TableRow className='text-base hover:bg-transparent'>
            {Array(columns)
              .fill(0)
              .map((_, i) => (
                <TableHead
                  key={i}
                  className='py-4 first-of-type:pl-5 last-of-type:pr-5'
                >
                  <Skeleton className='h-4 w-[120px]' />
                </TableHead>
              ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array(rows)
            .fill(0)
            .map((_, rowIndex) => (
              <TableRow
                key={rowIndex}
                className={`h-1 border-border text-sm hover:bg-transparent ${
                  rowIndex % 2 === 0 ? 'bg-muted/50' : ''
                }`}
              >
                {Array(columns)
                  .fill(0)
                  .map((_, colIndex) => (
                    <TableCell
                      key={colIndex}
                      className='py-5 first-of-type:pl-5 last-of-type:pr-5'
                    >
                      <Skeleton className='h-4 w-[120px]' />
                    </TableCell>
                  ))}
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
