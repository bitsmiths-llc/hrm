import { Badge } from '@/components/ui/badge';

import {
  accountStatusLabels,
  payrollCycleStatusLabels,
  requestStatusLabels,
} from '@/constants/hrm-labels';

import { AccountStatus, PayrollCycleStatus, RequestStatus } from '@/types/hrm';

const presentations = {
  ...requestStatusLabels,
  ...accountStatusLabels,
  ...payrollCycleStatusLabels,
};

type StatusBadgeProps = {
  status: RequestStatus | AccountStatus | PayrollCycleStatus;
};

/** Single mapping from any HRM status to a badge, so colors and labels stay
 *  consistent across modules. */
export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, variant } = presentations[status];
  return <Badge variant={variant}>{label}</Badge>;
}
