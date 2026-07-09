import { CheckCircle2, CircleDashed } from 'lucide-react';

import { Employee, Policy, PolicyAcknowledgment } from '@/types/hrm';

type PolicyComplianceListProps = {
  policy: Policy;
  employees: Employee[];
  acknowledgments: PolicyAcknowledgment[];
};

/** Per-policy acknowledgment status for every active employee — which
 *  employees have (and haven't) acknowledged the current version. */
export function PolicyComplianceList({
  policy,
  employees,
  acknowledgments,
}: PolicyComplianceListProps) {
  const latestVersion = policy.versions[policy.versions.length - 1].version;

  return (
    <ul className='flex flex-col divide-y divide-border rounded-lg border border-border'>
      {employees.map((employee) => {
        const ack = acknowledgments.find(
          (a) => a.employeeId === employee.id && a.policyId === policy.id,
        );
        const upToDate = !!ack && ack.acknowledgedVersion >= latestVersion;

        return (
          <li
            key={employee.id}
            className='flex items-center justify-between gap-3 px-4 py-3'
          >
            <span className='text-sm font-medium'>{employee.fullName}</span>
            {upToDate ? (
              <span className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                <CheckCircle2 className='size-4 text-primary' aria-hidden />
                Acknowledged v{latestVersion}
              </span>
            ) : (
              <span className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                <CircleDashed className='size-4' aria-hidden />
                {ack
                  ? `Behind (on v${ack.acknowledgedVersion})`
                  : 'Not acknowledged'}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
