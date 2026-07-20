'use client';

import { pdf } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { CheckCircle2, CircleDashed, Eye, History } from 'lucide-react';
import { useState } from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { PolicyPdfDocument } from './policy-pdf-document';

import {
  Employee,
  Policy,
  PolicyAcknowledgment,
  PolicyVersion,
} from '@/types/hrm';

type PolicyVersionHistoryProps = {
  policy: Pick<Policy, 'title' | 'category'>;
  versions: PolicyVersion[];
  currentVersionNumber: number;
  /** Active employees — acknowledgment status inside each version panel is
   *  reported against these. */
  employees: Employee[];
  /** Append-only acknowledgment history for this policy: one record per
   *  version each employee acknowledged. */
  acknowledgments: PolicyAcknowledgment[];
  /** Omit to hide the revert action (e.g. read-only contexts). */
  onRevert?: (version: PolicyVersion) => void;
};

const initialsOf = (fullName: string) =>
  fullName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

export function PolicyVersionHistory({
  policy,
  versions,
  currentVersionNumber,
  employees,
  acknowledgments,
  onRevert,
}: PolicyVersionHistoryProps) {
  const newestFirst = [...versions].reverse();
  const [viewingVersion, setViewingVersion] = useState<number | null>(null);

  /** Opens the version as a PDF in a new tab — same document employees get
   *  from the Download button, so what you preview is what ships. */
  const handleView = async (version: PolicyVersion) => {
    setViewingVersion(version.version);
    const blob = await pdf(
      <PolicyPdfDocument policy={policy} version={version} />,
    ).toBlob();
    window.open(URL.createObjectURL(blob), '_blank', 'noopener,noreferrer');
    setViewingVersion(null);
  };

  const ackFor = (employeeId: string, versionNumber: number) =>
    acknowledgments.find(
      (ack) =>
        ack.employeeId === employeeId &&
        ack.acknowledgedVersion === versionNumber,
    );
  const latestFor = (employeeId: string) =>
    acknowledgments
      .filter((ack) => ack.employeeId === employeeId)
      .reduce<
        PolicyAcknowledgment | undefined
      >((best, ack) => (!best || ack.acknowledgedVersion > best.acknowledgedVersion ? ack : best), undefined);

  return (
    <Accordion
      type='single'
      collapsible
      defaultValue={`v${currentVersionNumber}`}
      className='rounded-lg border border-border'
    >
      {newestFirst.map((version) => {
        const isCurrent = version.version === currentVersionNumber;
        const ackedEmployees = employees.filter(
          (employee) => !!ackFor(employee.id, version.version),
        );

        return (
          <AccordionItem
            key={version.version}
            value={`v${version.version}`}
            className='px-4 last:border-b-0'
          >
            <div className='relative'>
              <AccordionTrigger className='pr-24 hover:no-underline'>
                <span className='flex flex-1 items-center justify-between gap-3 pr-3'>
                  <span className='text-sm font-medium'>
                    Version {version.version}
                    {isCurrent && ' (current)'}
                  </span>
                  <span className='text-xs font-normal text-muted-foreground'>
                    {format(version.publishedAt, 'MMM d, yyyy')} ·{' '}
                    {isCurrent
                      ? `${ackedEmployees.length} of ${employees.length} acknowledged`
                      : `${ackedEmployees.length} acknowledged`}
                  </span>
                </span>
              </AccordionTrigger>
              <div className='absolute right-0 top-1/2 flex -translate-y-1/2 items-center gap-2'>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type='button'
                      variant='outline'
                      size='icon'
                      className='size-7'
                      isLoading={viewingVersion === version.version}
                      onClick={() => handleView(version)}
                      aria-label={`View version ${version.version} PDF`}
                    >
                      <Eye className='size-3.5' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>View this version</TooltipContent>
                </Tooltip>
                {!isCurrent && !!onRevert && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type='button'
                        variant='outline'
                        size='icon'
                        className='size-7'
                        onClick={() => onRevert(version)}
                        aria-label={`Revert to version ${version.version}`}
                      >
                        <History className='size-3.5' />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Revert to this version</TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
            <AccordionContent>
              <ul className='divide-y divide-border overflow-hidden rounded-md border border-border'>
                {employees.map((employee) => {
                  const ackOfThis = ackFor(employee.id, version.version);
                  // Past versions list everyone who acknowledged them at the
                  // time (even if they've since moved on); the current
                  // version shows every employee's present standing.
                  if (!isCurrent && !ackOfThis) return null;
                  const latest = latestFor(employee.id);

                  return (
                    <li
                      key={employee.id}
                      className='flex items-center justify-between gap-3 bg-muted/30 px-3 py-2.5'
                    >
                      <span className='flex items-center gap-2.5'>
                        <span className='flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground'>
                          {initialsOf(employee.fullName)}
                        </span>
                        <span className='text-sm font-medium'>
                          {employee.fullName}
                        </span>
                      </span>
                      {ackOfThis ? (
                        <span className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                          <CheckCircle2
                            className='size-4 text-primary'
                            aria-hidden
                          />
                          Acknowledged{' '}
                          {format(ackOfThis.acknowledgedAt, 'MMM d, yyyy')}
                        </span>
                      ) : (
                        <span className='flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400'>
                          <CircleDashed className='size-4' aria-hidden />
                          {latest
                            ? `Behind (on v${latest.acknowledgedVersion})`
                            : 'Not acknowledged'}
                        </span>
                      )}
                    </li>
                  );
                })}
                {!isCurrent && ackedEmployees.length === 0 && (
                  <li className='bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground'>
                    No one acknowledged this version.
                  </li>
                )}
              </ul>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
